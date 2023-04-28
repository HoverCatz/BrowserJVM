class JavaSourceReader extends JavacUtils {

    /** @type string */
    fileName;

    /** @type [] */
    topLevelClasses;

    constructor(fileName, iter) {
        super(iter);
        this.fileName = fileName;
        this.topLevelClasses = [];
    }

    /**
     * Parse a class
     * @param throwErrors {boolean}
     * @returns {Promise|ClassParseResult|boolean}
     * @throws {Error}
     */
    async parseSourceCode(throwErrors = true) {
        try {
            const iter = this.iter;
            const nocc = iter.noComments();

            const classes = [];

            // while (true) {
            for (let i = 0; i < 100; i++) {

                // Skip leading whitespace (and all comments)
                nocc.skipWhitespace();
                if (nocc.isDone())
                    break;
                const start = nocc.index();

                // Read class header
                const header = this.readClassHeader(nocc);
                // console.log(`header:`, header)
                if (header === -1) {
                    // Possible `package-info.java`, which has no curly brackets.
                    break;
                }
                const [ , headerText ] = header;
                // console.log(`headerText:`, headerText)

                // Read class data
                const data = this.readClassData(nocc);
                // console.log(`data:`, data)
                if (data === -1) break;
                const [ , classText ] = data;

                const parsedHeader = this.parseHeader(headerText);
                if (!parsedHeader) break;
                console.log(`parsedHeader:`, parsedHeader)

                const parsedClass = this.parseClass(classText);
                if (!parsedClass) break;
                // console.log(`parsedClass:`, parsedClass)

                classes.push({
                    header: parsedHeader,
                    data: parsedClass
                });
            }

            // Check for abrupt exit
            if (classes.length === 0)
                return ClassParseResult.of(ClassParseResultReason.SuccessButAbrupt, this.stripSelf());

            // Append resulting classes
            this.topLevelClasses = this.topLevelClasses.concat(classes);

            return ClassParseResult.success(this.stripSelf());
        } catch (e) {
            console.error(`Error with file: ${this.fileName}`)
            console.error(e)
            return ClassParseResult.of(
                ClassParseResultReason.FailedWithError,
                {
                    fileName: this.fileName,
                    error: e,
                    result: this.stripSelf()
                }
            );
        }
    }

    /**
     * Parse class statements, such as:
     * - package <str>[.str];
     * - import [static] <str>[.str];
     * @param text {string}
     * @return {false|{}}
     */
    parseClassStatement(text) {
        const nocc = new CIterator(text, true);

        nocc.skipWhitespace();
        if (nocc.isDone()) return false;

        const match = nocc.iterFind(
            '^\\s*(?<left>(package|import))\\s*(?<middle>static){0,1}\\s*(?<right>([\\w$]+(\\s*\\.\\s*[\\w$]+)*(\\s*\\.\\s*\\*){0,1}))',
            true, false);
        if (!match) {
            console.error(`Class statement error: Failed matching with regex: '${text}'`)
            return false;
        }

        const left = match.groups.left;
        const isStatic = match.groups.middle;
        if (left === 'package' && isStatic) {
            console.error(`Class statement error: Found 'package static': '${text}'`)
            return false;
        }
        // console.log(`match:`, match)

        const right = match.groups.right;
        return {
            [left]: right,
            'static': !!isStatic
        };
    }

    /**
     * Parse the header.
     * Extract:
     * - package
     * - imports
     * - annotations
     * - access flags
     * - class-type
     * - class-name
     * - class-generics
     * - extends (+ generics)
     * - implements (+ generics)
     * @param headerText {string}
     * @returns {false|{}}
     */
    parseHeader(headerText) {
        const iter = new CIterator(headerText);
        const nocc = iter.noComments();
        const text = nocc.text;

        nocc.skipWhitespace();
        if (nocc.isDone()) return false;

        // while (true) {
        for (let i = 0; i < 100; i++) {
            nocc.skipWhitespace();
            if (nocc.isDone()) break;

            let start = nocc.index();

            let [ index, found ] = nocc.findFirstOfMany([';', '@', '{'],
                false, true, true, start, true);
            if (index === -1) break;

            switch (found) {
                case ';': {
                    const sub = text.substring(start, index);
                    // console.log(`sub: '${sub.trim()}'`)
                    const stmt = this.parseClassStatement(sub);
                    console.log(`stmt:`, stmt)
                } break;
                case '@': {
                    // Search for end of annotation
                    while (true) {
                    // for (let j = 0; j < 100; j++) {
                        const found = nocc.iterFind('\\s*(?<first>[a-zA-Z0-9_]+)\\s*(?<second>\\S)', false, false);
                        if (!found) break;
                        // console.log(`found:`, found)

                        const second = found.groups.second;
                        if (second === '.') {
                            // console.log(`middle:`, found)
                            nocc.next(found[0].length);
                        } else if (second === '(') {
                            nocc.next(found[0].length - 1); // Skip (
                            const end = nocc.index();
                            this.skipAllBracketsBy(['('], nocc, false);
                            const first = text.substring(index + 1, end);
                            const last = text.substring(end, nocc.index());
                            // console.log(`anno a: '${first}'`)
                            // console.log(`anno b: '${last}'`)
                            break;
                        } else {
                            if (second === '@' || this.isValidJavaName(second)) { // Done with annotation
                                // console.log(`end:`, found)
                                nocc.next(found[1].length);
                                // console.log(`anno c: '${text.substring(index + 1, nocc.index())}'`) // Skip @
                                break;
                            }
                            console.warn(`Filename: ${this.fileName}`)
                            console.warn(`Found invalid character: '${second}' when looking for annotation data.`)
                            break;
                        }
                    }
                } break;
                case '{':
                    break;
            }
        }

        return false;
    }

    parseClass(classText) {
        return 0;
    }

    /**
     * Detect class-header range, then parse it
     * @param nocc {CIterator}
     * @returns {-1|[int,string]}
     */
    readClassHeader(nocc) {
        // Start index
        let start = nocc.index();

        const [ index, ] = nocc.findFirstOfMany(['{'],
            false, true, false, start,
            true);
        if (index === -1) return -1;

        const header = nocc.subString(start, index);
        // console.log(`header:`, header)

        return [ nocc.index(), header ];
    }

    /**
     *
     * @param nocc {CIterator}
     * @returns {-1|[int,string]}
     */
    readClassData(nocc) {
        nocc.skipWhitespace();
        if (nocc.isDone()) return -1;

        // Start index
        let start = nocc.index();

        const [ , found ] = nocc.findFirstOfMany(['{'],
            false, true, false, start,
            true);

        start = nocc.index();
        this.skipAllBracketsBy([found], nocc, false);
        let end = nocc.index();

        const data = nocc.subString(start + 1, end - 1); // We know for a fact that it
        // console.log(`data:`, data)                  // starts and ends with a curly bracket

        return [ nocc.index(), data ];
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
        const iter = new CIterator(classHeader);
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
        const iter = this.iter = new CIterator(classText);
        // console.log(`parseClassBody(${classText})`)

        // Skip opening and closing class-curly-brackets
        if (iter.char() === '{')
            iter.next();
        if (iter.peekLast() === '}')
            iter.removeLast(1);



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
        delete _this.iter;
        return _this;
    }

}