class JavaSourceReader extends JavacUtils {

    /** @type string */
    fileName;

    /** @type JvmClass */
    clz;

    /** @type [] */
    fields;

    /** @type [] */
    functions;

    /** @type int */
    classAccess;

    /** @type string */
    classType;

    /** @type string */
    className;

    /**
     * The text for the whole class (includes everything)
     * @type string
     * */
    classText;

    /**
     * All inner classes
     * @type JavaSourceReader[]
     * */
    innerClasses;

    /** @type boolean */
    ignoreEndGarbage;

    constructor(fileName, text, iter, ignoreEndGarbage = false) {
        super();
        this.fileName = fileName;
        this.text = text;
        this.iter = iter;
        this.clz = new JvmClass();
        this.fields = [];
        this.functions = [];
        this.innerClasses = [];
        this.ignoreEndGarbage = ignoreEndGarbage;
    }

    /**
     * Parse
     * @param throwErrors {boolean}
     * @returns {string|json|Promise<{}|json>|boolean}
     * @throws {Error}
     */
    async parseSourceCode(throwErrors = true) {
        const iter = this.iter;

        // Read package
        const pkg = [];
        let word = this.peekWord();
        if (word === false) return false;
        if (word === 'package') {
            this.readWord(iter); // Skip 'package'
            pkg.push(...this.readPackage(iter));
        }
        console.log(`package: '${pkg.join('.')}'`)

        const imports = [];
        while (true) {
            word = this.peekWord(iter);
            if (word === false) return false;
            if (word === 'import') {
                this.readWord(iter); // Skip 'import'
                imports.push(...[this.readImport(iter).trim()]);
            } else {
                break;
            }
        }
        console.log(`imports: '${imports.join(', ')}'`)

        // Read annotations
        const annotationData = this.readAnnotations(iter);
        console.log('[' + this.className + '] annotationData:', annotationData)

        // Reach the class
        if (!this.skipWhitespace(iter))
            return false;

        // Set bookmark so we can return later if needed
        iter.setBookmark(0);

        let classAccess = 0;

        // Check class access
        word = this.readWord(iter);
        if (word === false) return false;
        if (word in this.accessWords) {
            console.log(`classAccess: ${word}`)
            classAccess |= this.accessWords[word];

            // Set bookmark so we can return later if needed
            iter.setBookmark(0);

            // Check class access again!
            word = this.readWord(iter);
            if (word === false) return false;
            if (word in this.accessWords) {
                console.log(`classAccess: ${word}`)
                classAccess |= this.accessWords[word];

                // Set bookmark so we can return later if needed
                iter.setBookmark(0);

                // Check class access again-again!
                word = this.readWord(iter);
                if (word === false) return false;
                if (word in this.accessWords) {
                    console.log(`classAccess: ${word}`)
                    classAccess |= this.accessWords[word];
                } else {
                    // Reset iter index, because we didn't find another access flag
                    iter.gotoBookmark(0);
                }
            } else {
                // Reset iter index, because we didn't find another access flag
                iter.gotoBookmark(0);
            }
        } else {
            // Reset iter index, because we didn't find any access flags
            iter.gotoBookmark(0);
        }
        console.log(`accessFlags: ${this.accessFlagsToString(classAccess)}`)
        this.classAccess = classAccess;

        // Check class-type
        const classType = this.readWord(iter);
        if (classType === false) return false;
        console.log(`classType: ${classType}`) // classType (class, enum, interface, etc)
        if (!this.classTypes.includes(classType)) {
            if (throwErrors) throw new Error(`Class-type '${classType}' not supported.`);
            return false;
        }
        this.classType = classType;

        // Read class-name
        const className = this.readWord(iter);
        if (className === false) return false;
        console.log(`className: ${className}`) // className
        this.className = className;

        // Extract class data
        const [ ignored, blockEnd, classBlock ] = this.findOpenCloseRange(this.text, iter.index(), '{', '}');

        // Verify content after class has ended
        const lastText = this.text.substring(blockEnd + 1);
        const lastTextBlock = this.getTextWithoutComments(lastText).trim();

        if (!this.ignoreEndGarbage && lastTextBlock.length > 0) {
            if (throwErrors) throw new Error('Garbage-data at end of class.');
            return false;
        }

        this.classText = this.text;
        this.text = classBlock;
        this.iter = new Iterator(classBlock);
        const classData = await this.parseClassData(classBlock, this.iter);
        if (classData === false) return false;

        return {
            'package': pkg,
            'className': className,
            'classType': classType,
            'accessFlags': classAccess,
            'annotations': annotationData.join(', '),
            'classData': classData
        };
    }

    /**
     * Parse class data
     * @param text {string}
     * @param iter {Iterator}
     * @returns {{}|json|false}
     */
    async parseClassData(text, iter) {
        if (iter.next() === false)
            return false;
        const fields = {};
        const functions = {};
        const innerClasses = {};

        // Skip whitespace
        if (!this.skipWhitespace(iter))
            return false;

        let annotations = [];
        while (true) {
            const iterIndex = iter.index();
            let detectedType = this.detectNextItem(text, iter);
            if (detectedType === false)
                break;

            const [ index, itemType ] = detectedType;
            console.log('[' + this.className + '] ')
            console.log('[' + this.className + '] index:', index, 'type:', itemType)

            // No detection found
            if (index === -1)
                break;

            // Something found, but we don't know what it is
            if (index <= -2)
                throw new Error(`Unknown type '${itemType}' at index ${-(index + 2)}.`);

            // console.log(`iterIndex: ${iterIndex}`)
            // console.log(`subText: '${this.text.substring(iterIndex)}'`)
            // console.log(`itemType: ${itemType}`)

            switch (itemType) {
                case ClassItemType.Annotation: {
                    if (iter.char() === '@')
                        iter.prev(); // Go back one character
                    annotations = this.readAnnotations(iter);
                    console.log(`anno:`, annotations)
                } break;
                case ClassItemType.FieldNoValue:
                case ClassItemType.Field: {
                    const subText = this.text.substring(iterIndex);
                    const fieldReader = new JavaSourceFieldReader();
                    const endIndex = fieldReader.process(subText, iterIndex, itemType);
                    if (endIndex === false)
                        return false;
                    iter.setIndex(endIndex);
                    this.skipWhitespace(iter);
                    this.fields.push(fieldReader);
                } break;
                case ClassItemType.Function: {
                    const subText = this.text.substring(iterIndex);
                    const functionReader = new JavaSourceFunctionReader();
                    const endIndex = functionReader.process(subText, iterIndex, itemType);
                    if (endIndex === false)
                        return false;
                    iter.setIndex(endIndex);
                    this.skipWhitespace(iter);
                    this.functions.push(functionReader);
                } break;
                case ClassItemType.Class: {
                    let subText = this.text.substring(iterIndex);
                    const [ , close, ] = this.findOpenCloseRange(subText, 0, '{', '}');
                    subText = subText.substring(0, close) + '}';

                    const sourceReader = new JavaSourceReader(this.fileName, subText, new Iterator(subText), true);
                    const code = await sourceReader.parseSourceCode();

                    sourceReader.iter = null;
                    sourceReader.alphaNumericArray = null;
                    sourceReader.alphaNumericAnnotationArray = null;
                    sourceReader.fieldReader = null;
                    sourceReader.functionReader = null;
                    innerClasses[sourceReader.className] = [sourceReader, code];

                    const endIndex = iterIndex + close;
                    iter.setIndex(endIndex);
                    this.skipWhitespace(iter);
                } break;
            }

            // Skip whitespace
            this.skipWhitespace(iter);
        }

        // Skip whitespace
        this.skipWhitespace(iter);

        return {
            'fields': fields,
            'functions': functions,
            'innerClasses': innerClasses
        };
    }

    /**
     * Parse all annotations
     * @param iter {Iterator}
     * @returns {boolean|{}[]}
     */
    readAnnotations(iter) {
        // Skip whitespace in-front
        if (!this.skipWhitespace(iter))
            return false;
        const list = [];
        while (true) {
            const char = iter.peek();
            if (char === false) return false;

            // If not an annotation, abort
            if (char !== '@') break;

            // Read annotation
            const anno = this.readAnnotation(iter);
            if (anno === false) return false;

            list.push(anno);

            // Skip next whitespace
            if (!this.skipWhitespace(iter))
                return false;
        }
        return list;
    }

    /**
     * Parse annotation
     * @param iter {Iterator}
     */
    readAnnotation(iter) {
        // Ignore first annotation character
        let peek = iter.peek();
        if (peek !== '@')
            return false;
        iter.next(); // Skip @

        // Read annotation class name
        const annoClassNames = [];
        const data = { 'annoClassName': annoClassNames };

        // @Test
        // @Test()
        // @Test.Inner
        // @Test.Inner()
        // @Test(abc = 123)
        // @Test.Inner(abc = 123)

        let word = '';
        let expectedWord = true;
        while (true) {
            const char = iter.peek();
            if (char === false) return false;

            let whitespace;
            if (expectedWord && this.isAlphaNumeric(char)) {
                word += char;
                iter.next(); // Skip char
            } else if ((whitespace = this.isWhitespace(char)) || char === '.') {
                if (word !== '') {
                    annoClassNames.push(word);
                    word = '';
                    if (whitespace)
                        expectedWord = false;
                }
                iter.next();
                if (!whitespace)
                    expectedWord = true;
            } else if (char === '(') {
                if (word !== '') {
                    annoClassNames.push(word);
                    word = '';
                }
                const [ _, close, sub ] = this.findOpenCloseRange(this.text, iter.index(), '(', ')');
                // TODO: Parse inner data (annotation fields can also include annotations as values)
                data.data = sub;
                iter.setIndex(close);
                break;
            } else {
                break;
            }
        }

        // Just for testing (readability in console)
        // data.annoClassName = JSON.stringify(data.annoClassName);

        return data;
    }

    /**
     * Parse annotation data
     * @param iter {Iterator}
     * @param index {int}
     */
    readAnnotationData(iter, index) {
        const [open, close, sub] = this.findOpenCloseRange(this.text, index, '(', ')');
        // TODO: Parse annotation data
        // console.log(sub)
        return {
            'open': open,
            'close': close,
            'sub': sub
        };
    }

    /**
     * Read one import statement
     * @param iter
     * @returns {boolean|string|boolean}
     */
    readImport(iter) {
        const str = this.readUntil(';', iter, false);
        if (str === false) return false;
        if (!iter.next()) // Skip ;
            return false;
        return str;
    }

    /**
     * Parse package
     * @param iter {Iterator}
     * @returns {string[]|false}
     */
    readPackage(iter) {
        const pkg = [];
        const str = this.readUntil(';', iter, false);
        if (str === false) return false;
        if (!iter.next()) // Skip ;
            return false;
        str.split('.').forEach(s =>
            pkg.push(s.trim())
        );
        return pkg;
    }

}