class JavaSourceReader extends JavacUtils {

    /** @type string */
    fileName;

    /** @type [] */
    topLevelClasses;

    constructor(fileName, text, iter) {
        super(iter, text);
        this.fileName = fileName;
    }

    /**
     * Parse
     * @param throwErrors {boolean}
     * @returns {Promise|ClassParseResult|boolean}
     * @throws {Error}
     */
    async parseSourceCode(throwErrors = true) {
        try {
            const iter = this.iter;

            // Skip leading whitespace (and all comments)
            if (!this.skipWhitespace(iter))
                return ClassParseResult.success(this);

            let packageName = '';
            let hasFoundPackage = false;

            let imports = [];
            let annotations = [];

            let classes = [];

            // Try parsing:
            // - package
            // - import
            // - annotations
            // - class
            outer:
            while (true) {
                // for (let k = 0; k < 10; k++) {
                if (!this.skipWhitespace(iter))
                    break;

                iter.setBookmark('last');
                const start = iter.index();

                let index, char, type;
                while (true) {
                // for (let k = 0; k < 10; k++) {

                    // console.log(`OWO ${iter.toString().substring(0, 100)}`)

                    const what = iter.findFirstOfMany([';', '@', '(', '{'], false, true);
                    if (what === false) break outer;
                    [index, char] = what;
                    if (index === -1 || char === '') break outer;
                    type = this.charToType(char);
                    if (type === '') break outer;

                    // We need to verify if this is
                    // an actual annotation, or just @interface
                    if (type === ClassItemType.Annotation) {
                        const isAnnotationInterface =
                            iter.iterMatch('^interface\\s+', false,false);
                        // console.log(`iter: '${iter.toString()}', isAnnotationInterface: ${isAnnotationInterface}`)
                        if (isAnnotationInterface)
                            continue;
                    }

                    // We are free!
                    break;
                }

                // console.log(index, char, type);
                switch (type) {
                    case ClassItemType.FieldNoValue: {
                        const sub = this.text.substring(start, index).trim();
                        // console.log(sub)

                        // Starts with `package`,
                        // then a whitespace,
                        // then captures the package name
                        let match = sub.match(/^package\s+(?<package>.*)/);
                        if (match && match.groups && match.groups.package) {
                            if (hasFoundPackage)
                                throw new Error('A package was already found, declaring it twice is illegal.');
                            let _package = match.groups.package;
                            if (this.verifyPackage(_package)) {
                                hasFoundPackage = true;
                                packageName = match.groups.package; // This string might need a cleanup (remove whitespaces etc)
                                // console.log(`Found package: '${packageName}'`)
                                break;
                            }
                            throw new Error(`The package '${_package}' was invalid.`);
                        }

                        // Starts with `import`,
                        // then a whitespace,
                        // [then static and perhaps whitespace],
                        // then captures the import
                        match = sub.match(/^import\s+(?<static>static\s+)?(?<import>.*)/s);
                        if (match && match.groups && match.groups.import) {
                            let _import = match.groups.import;
                            const [success, _imports] = this.verifyImport(_import);
                            if (success) {
                                const path = _imports.join('.');
                                const isStatic = !!match.groups.static
                                imports.push({
                                    'name': path,
                                    'isStatic': isStatic
                                });
                                // console.log(`Found import: '${path}', isStatic: ${isStatic}`)
                                break;
                            }
                            throw new Error(`The import '${_import}' was invalid.`);
                        }

                        iter.setBookmark('last');

                    } break;
                    case ClassItemType.Annotation: {

                        // @<whitespace>TestAnnotation.TestInner(a=1, b=2)
                        if (!this.skipWhitespace(iter))
                            return ClassParseResult.success(this.stripSelf());

                        // We expect alphanumeric here
                        // @<T>estAnnotation.TestInner(a=1, b=2)
                        if (!this.isAlphaNumeric(iter.char()))
                            return ClassParseResult.of(
                                ClassParseResultReason.FailedWithError,
                                'Found non-alphanumeric where an annotation name should of been.'
                            );

                        let annotationWords = [];
                        // Read words (split by dot (.))
                        // @<TestAnnotation><.><TestInner>(a=1, b=2)
                        while (true) {
                            // for (let j = 0; j < 10; j++) {

                            // @<TestAnnotation>.TestInner(a=1, b=2)
                            let word = this.readAlphaNumeric(iter);
                            if (word === false)
                                return ClassParseResult.of(
                                    ClassParseResultReason.FailedWithError,
                                    'Couldn\'t read alphanumeric'
                                );

                            // @TestAnnotation<whitespace>.TestInner(a=1, b=2)
                            if (!this.skipWhitespace(iter))
                                break outer;

                            annotationWords.push(word);

                            // Next character should be either:
                            // - A dot .
                            // - An opening parenthesis (
                            // If not, then we are done with the annotation
                            const c = iter.char();
                            if (c === '.') {
                                iter.next(); // Skip the dot
                                continue;
                            }
                            if (c === '(') {
                                // We need to count ourselves out of this annotation,
                                // Starting with this opening parenthesis, until the closing
                                const start = iter.index();
                                this.skipUntilClosingChar('(', iter);
                                const end = iter.index();
                                const annotationData = this.text.substring(start, end);
                                annotationWords.push(annotationData);
                                // console.log(`annotation data: '${this.text.substring(start, end)}'`)
                            }
                            break;
                        }

                        annotations.push(annotationWords);
                        iter.setBookmark('last');

                    } break;
                    case ClassItemType.Class: {
                        iter.prev(); // include the opening curly bracket

                        // console.log(`sub: '${iter.toString()}'`)

                        // Skips comments, strings and chars,
                        // and sets the new iter index to
                        // right after the closing char.
                        const start = iter.index();
                        this.skipUntilClosingChar('{', iter);
                        const end = iter.index();

                        let classHeader = this.text.substring(
                            iter.getBookmark('last'), start
                        ).trim();
                        // console.log(`classHeader: '${classHeader}'`)
                        const classData = this.text.substring(start, end)
                            .trim();
                        // console.log(`classData: '${classData}'`)

                        classHeader = this.#parseClassHeader(classHeader);

                        const clz = {
                            'package': packageName,
                            'imports': imports,
                            'annotations': annotations,
                            'header': classHeader,
                            'body': {
                                'parsed': false,
                                'fields': [],
                                'functions': []
                            },
                            'innerClasses': []
                        };
                        clz.body.parsed = this.#parseClassBody(
                            classData, clz,
                            classHeader.type
                        );
                        classes.push(clz);

                        hasFoundPackage = false;
                        // imports = []; // Don't reset imports!
                        annotations = [];

                        if (iter.char() === false)
                            break outer;

                    } break;
                }
            }

            this.topLevelClasses = classes;

            // Check for abrupt exit
            if (classes.length === 0)
                return ClassParseResult.of(
                    ClassParseResultReason.SuccessButAbrupt,
                    this.stripSelf()
                );

            // Parse all class bodies
            // for (let clz of classes)
            //     if (clz.body && !!clz.body.classData) {
            //         clz.body.triedParsing = true;
            //         const result = this.#parseClassBody(clz.body.classData, clz);
            //         if (result) {
            //             clz.body.parsed = result;
            //             clz.body.triedParsing = false;
            //         }
            //     }

            return ClassParseResult.success(this.stripSelf());
        } catch (e) {
            console.error(`Error with file: ${this.fileName}`)
            console.error(e)
        }
        return ClassParseResult.of(
            ClassParseResultReason.FailedWithError,
            this.stripSelf()
        );
    }

    /**
     * Parse the class headers:
     * <access_modifier> [non_access_modifiers]
     * <class/enum/interface/@interface> <class_name>
     *     [<generic_parameters>]
     *     [extends <superclass>[<generic_parameters>]]
     *     [implements <interface1>[<generic_parameters>],
     *                 <interface2>[<generic_parameters>], ...]
     * @param classHeader {string}
     * @param isInnerClass {boolean}
     * @returns {{}}
     */
    #parseClassHeader(classHeader, isInnerClass = false) {
        const iter = new Iterator(classHeader);
        // console.log(`classHeader: ${classHeader}`)

        const header = {
            'access': [],
            'type': '',
            'name': '',
            'extend': '',
            'implements': []
        };

        // Read the access flags
        // |public| class CompilerTestV210<T extends Number> extends Person implements Comparable<CompilerTestV210<T>>, Serializable
        // ||@interface CompilerTestV210

        let hasFoundClassName = false;
        let isAnnotationInterface = false;
        let hasReachedImplements = false;
        let lastAddedWhere = '';
        let lastAddedWas = '';

        // while (true) {
        for (let i = 0; i < 100; i++) {

            // Skip whitespace
            if (!this.skipWhitespace(iter))
                break;

            const c = iter.char();
            // console.log(`c: ${c}`)

            // @interface (used for annotation classes)
            if (c === '@') {
                if (isAnnotationInterface)
                    throw new Error(`Issue in class-header: Multiple '@' found.`);
                isAnnotationInterface = true;
                iter.next(); // Skip the @
                //console.log(`Found @`)
                continue;
            }
            else
            // Only read words if the current
            // character is actually alphanumeric
            if (this.isAlphaNumeric(c)) {
                // Read next word
                let word = this.readAlphaNumeric(iter);
                if (word === false)
                    break;
                word = word.trim();
                const wordLower = word.toLowerCase();
                // console.log(`word: '${word}'`)

                // Found static class-access-flag! That's illegal >:o
                if (wordLower === 'static' && !isInnerClass)
                    throw new Error(`Found illegal 'static' access-flag for class: '${classHeader}'`);

                // Is this an access flag?
                if (word in this.accessWords) {
                    if (header.access.includes(word))
                        throw new Error(`Found multiple accessWords in class-header: '${classHeader}'`);
                    header.access.push(word);
                    continue;
                }

                // What class-type is this?
                if (this.classTypes.includes(wordLower) && wordLower === word) {
                    if (header.type !== '')
                        throw new Error(`Found multiple classTypes in class-header: '${classHeader}'`);
                    if (isAnnotationInterface) {
                        if (wordLower !== 'interface')
                            throw new Error(`Found invalid classType '${wordLower}' when expecting 'interface' (because of the @).`);
                        header.type = '@' + wordLower;
                    } else
                        header.type = wordLower;
                    // console.log(`a header.type: ${header.type}`)
                    continue;
                }

                // Verify class-type before we check class-name
                if (header.type === '') {
                    // console.log(`b header.type: ${header.type}`)
                    throw new Error('Didn\'t find classType before class-name.');
                }

                // Did we just find the class name? :D
                if (!hasFoundClassName) {
                    hasFoundClassName = true;
                    lastAddedWhere = 'class';
                    header.name = word;
                    // console.log(`Found class name: '${word}'`)
                    continue;
                }

                // Extend a class!
                if (wordLower === 'extends') {
                    const nextWord = this.readAlphaNumeric(iter);
                    // console.log(`nextWord: '${nextWord}'`)
                    if (nextWord === false || nextWord === '')
                        break;
                    lastAddedWhere = 'extendClass';
                    header.extend = nextWord;
                    // console.log(`Found extends: '${nextWord}'`)
                    continue;
                }

                // Implements are tricky! :o
                if (wordLower === 'implements') {
                    const nextWord = this.readAlphaNumeric(iter);
                    // console.log(`nextWord: '${nextWord}'`)
                    if (nextWord === false || nextWord === '')
                        break;
                    lastAddedWhere = 'implementsClass';
                    lastAddedWas = nextWord;
                    hasReachedImplements = true;
                    header.implements.push(nextWord);
                    // console.log(`Found implements: '${nextWord}'`)
                    continue;
                }

                // Do we need to add more implement names?
                if (hasReachedImplements) {
                    lastAddedWhere = 'implementsClass';
                    lastAddedWas = word;
                    hasReachedImplements = true;
                    header.implements.push(word);
                    // console.log(`Found implements: '${word}'`)
                    continue;
                }

                continue;
            }
            else
            if (c === '<') {
                const start = iter.index();
                this.skipUntilClosingChar('<', iter)
                const end = iter.index();
                const generics = classHeader.substring(start, end).trim();
                // console.log(`Found generics: ${generics}`)
                if (lastAddedWhere === 'class')
                    header.name += generics;
                else if (lastAddedWhere === 'extendClass')
                    header.extend += generics;
                else if (lastAddedWhere === 'implementsClass') {
                    const index = header.implements.indexOf(lastAddedWas);
                    if (index >= 0) {
                        header.implements.splice(lastAddedWas, 1)
                        header.implements.push(lastAddedWas + generics);
                        lastAddedWas = '';
                    }
                }
                lastAddedWhere = '';
                continue;
            }
            else
            if (c === ',') {
                iter.next(); // Skip the comma
                hasReachedImplements = true;
                continue;
            }

            // console.log(`c: '${c}'`)
        }

        // Set default `extend` if none was set
        if (header.extend === '')
            header.extend = 'java.lang.Object';

        //console.log(`header: ${JSON.stringify(header, null, 4)}`)
        // console.log('')
        return header;
    }

    /**
     * Parse the class data (inside the open-closing curly bracket)
     * @param classText {string} This will always be trimmed
     * @param clz {any}
     * @param classType {string}
     * @return {boolean}
     * @throws {Error}
     */
    #parseClassBody(classText, clz, classType) {
        const iter = this.iter = new Iterator(classText);
        // console.log(`parseClassBody(${classText})`)

        // Skip opening and closing class-curly-brackets
        if (iter.char() === '{')
            iter.next();
        if (iter.peekLast() === '}')
            iter.removeLast(1);

        //console.log('')
        //console.log('### Parsing class body')
        //console.log('')
        //console.log('classText:')
        //console.log(iter.toString())
        //console.log('')

        let enumText = '';
        let annotations = [];
        let innerClasses = [];

        if (classType === 'enum') {
            const start = iter.index();
            this.skipUntilCharOutsideBrackets(';', iter);
            const end = iter.index();
            enumText = classText.substring(start, end)
                .trim();
            // console.log(`enumText: '${enumText}'`)
        }

        let lastAnnotationWasInterface = false;

        outer:
        // while (true) {
        for (let i = 0; i < 100; i++) {

            // Skip starting whitespace
            if (!this.skipWhitespace(iter))
                break;

            const start = iter.index();

            // Search for the next type
            const what = iter.findFirstOfMany(
                ['@', ';', '=', '(', '{'], false, true, true);
            if (what === false) break;
            const [index, found] = what;
            if (index === -1 || found === '') break;
            const type = this.charToType(found);
            if (type === '') break;

            // console.log(`found: ${found}, type: ${type}, index: ${index}`)
            // console.log(`foundText: '${classText.substring(start, index)}'`)
            switch (type) {
                case ClassItemType.Function: {
                    iter.prev(); // Include the opening (
                    // console.log(`toString: '${iter.toString()}'`)

                    const functionHeader = classText
                        .substring(start, index).trim();
                    // console.log(`Function: '${functionHeader}'`)

                    this.skipUntilClosingChar('(', iter);
                    let end = iter.index();
                    const functionArguments = classText
                        .substring(index, end).trim();
                    // console.log(`Function arguments: '${functionArguments}'`)
                    // console.log(`sub: '${iter.toString()}'`)

                    const start_ = iter.index();
                    this.skipUntilClosingChar('{', iter);
                    end = iter.index();
                    const functionBody = classText
                        .substring(start_, end).trim();
                    // console.log(`Function body: '${functionBody}'`)
                    // console.log(`sub: '${iter.toString()}'`)
                    clz.body.functions.push({
                        'header': functionHeader,
                        'args': functionArguments,
                        'body': functionBody,
                        'annos': annotations
                    });

                    annotations = [];

                } break;
                case ClassItemType.Annotation: {

                    // @<whitespace>TestAnnotation.TestInner(a=1, b=2)
                    if (!this.skipWhitespace(iter))
                        break outer;

                    // We expect alphanumeric here
                    // @<T>estAnnotation.TestInner(a=1, b=2)
                    if (!this.isAlphaNumeric(iter.char()))
                        break outer;

                    let annotationWords = [];
                    // Read words (split by dot (.))
                    // @<TestAnnotation><.><TestInner>(a=1, b=2)
                    while (true) {
                        // for (let j = 0; j < 10; j++) {

                        // @<TestAnnotation>.TestInner(a=1, b=2)
                        let word = this.readAlphaNumeric(iter);
                        if (word === false)
                            break outer;
                        // console.log(`word: ${word}`)

                        // @TestAnnotation<whitespace>.TestInner(a=1, b=2)
                        if (!this.skipWhitespace(iter))
                            break outer;

                        annotationWords.push(word);

                        // Next character should be either:
                        // - A dot .
                        // - An opening parenthesis (
                        // If not, then we are done with the annotation
                        const c = iter.char();
                        if (c === '.') {
                            iter.next(); // Skip the dot
                            continue;
                        }
                        if (c === '(') {
                            // We need to count ourselves out of this annotation,
                            // Starting with this opening parenthesis, until the closing
                            const start = iter.index();
                            this.skipUntilClosingChar(c, iter);
                            const end = iter.index();
                            const annotationData = classText.substring(start, end);
                            annotationWords.push(annotationData);
                            //console.log(`annotation data: '${classText.substring(start, end)}'`)
                        }
                        break;
                    }

                    if (annotationWords.length === 1 && annotationWords[0] === 'interface') {
                        lastAnnotationWasInterface =
                            classText.substring(start, index).trim() +
                                ' @interface';
                        break;
                    }

                    annotations.push(annotationWords);
                    iter.setBookmark('last');

                } break;
                case ClassItemType.FieldNoValue: {
                    //console.log(`Field: '${classText.substring(start, index)}'`)

                    const fieldData = classText.substring(start, index);
                    if (fieldData.trim().length === 0)
                        break;
                    // console.log(`Fielda: '${fieldData}'`)
                    // iter.next(); // Skip the ;
                    clz.body.fields.push({
                        'data': fieldData
                    });
                } break;
                case ClassItemType.Field: {

                    // (recurse)-parse fields (fields can be very complex)
                    // while (true) {
                    for (let j = 0; j < 100; j++) {
                        const what = iter.findFirstOfMany(
                            ['@', ';', '=', '(', '{'], false, true, false);
                        if (what === false) break outer;
                        const [index, found] = what;
                        if (index === -1 || found === '') break outer;
                        // console.log(`found ${j}: '${found}'`)
                        if (found === ';') {
                            const fieldData = classText.substring(start, index);
                            // console.log(`Fielda: '${fieldData}'`)
                            // iter.next(); // Skip the ;
                            clz.body.fields.push({
                                'data': fieldData
                            });
                            break;
                        } else if (found === '(') {
                            this.skipUntilClosingChar('(', iter);
                            // console.log(`Fieldb: '${classText.substring(start, iter.index())}'`)
                            // iter.next(); // Skip the )
                            continue;
                        } else if (found === '{') {
                            this.skipUntilClosingChar('{', iter);
                            // console.log(`Fieldc: '${classText.substring(start, iter.index())}'`)
                            // iter.next(); // Skip the }
                            continue;
                        } else if (found === '=') {
                            // console.log(`Fieldd: '${classText.substring(start, index)}'`)
                            // iter.next(); // Skip the =
                            continue;
                        } else if (found === '@') {
                            // console.log(`Fielde: '${classText.substring(start, index)}'`)
                            // iter.next(); // Skip the @
                            continue;
                        }
                        // console.warn(`Unknown character: ${iter.char()}`)
                        break;
                    }

                } break;
                case ClassItemType.Class: {
                    iter.prev(); // include the opening curly bracket

                    // console.log(`sub: '${iter.toString()}'`)

                    let innerClassHeader = classText.substring(start, index)
                        .trim();
                    if (!!lastAnnotationWasInterface) {
                        innerClassHeader = lastAnnotationWasInterface + ' ' + innerClassHeader;
                        lastAnnotationWasInterface = false;
                    }
                    // console.log('innerClassHeader: ' + innerClassHeader)

                    const _start = iter.index();
                    this.skipUntilClosingChar('{', iter);
                    const end = iter.index();
                    const innerClassData = classText.substring(_start, end);
                    // console.log('innerClassData: ' + innerClassData)

                    let headerLower = innerClassHeader.toLowerCase();
                    if (innerClassHeader === '' || headerLower === 'static') {
                        clz.body.functions.push({
                            'header': innerClassHeader,
                            'args': '()',
                            'body': innerClassData,
                            'annos': annotations
                        });
                        annotations = [];
                        break;
                    }

                    innerClassHeader = this.#parseClassHeader(innerClassHeader, true);

                    // Validate final + interface = no
                    if (innerClassHeader.access.includes('final') && (
                           innerClassHeader.type === 'interface'
                        || innerClassHeader.type === '@interface'
                    )) {
                        throw new Error(`Invalid access modified for inner-class interface 
                            '${innerClassHeader.name}' in file '${this.fileName}'. 
                            Can't be both final and interface!`);
                    }

                    const _clz = {
                        'annotations': annotations,
                        'header': innerClassHeader,
                        'body': {
                            'parsed': false,
                            'fields': [],
                            'functions': []
                        },
                        'innerClasses': []
                    };
                    annotations = [];

                    _clz.body.parsed = this.#parseClassBody(
                        innerClassData, _clz,
                        innerClassHeader.type
                    );
                    innerClasses.push(_clz);

                    // console.log(`innerClasses:`, innerClasses)

                } break;
            }
        }

        clz.innerClasses = innerClasses;
        if (classType === 'enum')
            clz.enumText = enumText;

        return true;
    }

    /**
     * Verify if the matched package is java-valid
     * @param packageFound
     * @returns {boolean}
     */
    verifyPackage(packageFound) {
        for (const name of packageFound.trim().split('.'))
            if (!this.isValidJavaName(name))
                return false;
        return true;
    }

    /**
     * Verify if the matched import is java-valid
     * @param importFound
     * @returns {[boolean,string[]]}
     */
    verifyImport(importFound) {
        const imports = [];
        const names = importFound.trim()
            .replace(/\s+/, '')
            .split('.');
        for (let i = 0; i < names.length; i++) {
            const name = names[i].trim();
            if (name.length === 0) continue;
            if (!this.isValidJavaName(name))
                return [false];
            imports.push(name);
        }
        return [true, imports];
    }

    /**
     * Test if name is a valid java name.
     * - They must begin with a letter, underscore (_), or dollar sign ($).
     * - Subsequent characters can be letters, digits, underscores, or dollar signs.
     * @param name {string}
     * @returns {boolean}
     */
    isValidJavaName(name) {
        return /^[$A-Za-z_*][\w$]*$/.test(name);
    }

    /**
     * Just for debugging
     * @returns {JavaSourceReader}
     */
    stripSelf() {
        const _this = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        delete _this.alphaNumericArray;
        delete _this.alphaNumericAnnotationArray;
        delete _this.annotationArray;
        delete _this.accessWords;
        delete _this.classTypes;
        delete _this.text;
        delete _this.iter;
        return _this;
    }

}