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
            const nocc = iter.noComments(this);

            // Skip leading whitespace (and all comments)
            this.skipWhitespace(nocc);
            if (nocc.isDone())
                return ClassParseResult.of(ClassParseResultReason.SuccessButAbrupt, this.stripSelf());

            const classes = [];

            // Read class header
            const header = this.readClassHeader(nocc);
            console.log(`header:`, header)

            // Read class data
            const data = this.readClassData(nocc);
            console.log(`data:`, data)

            // Append resulting classes
            this.topLevelClasses = this.topLevelClasses.concat(classes);

            this.skipWhitespace(nocc);
            if (!nocc.isDone()) {
                // We have more classes to parse
                const sourceReader = new JavaSourceReader(this.fileName, iter);
                const res = await sourceReader.parseSourceCode(throwErrors);
                if (ClassParseResult.isSuccess(res)) {
                    const it = res.result;
                    this.topLevelClasses = this.topLevelClasses.concat(it.topLevelClasses);
                }
            }

            // Check for abrupt exit
            if (classes.length === 0)
                return ClassParseResult.of(ClassParseResultReason.SuccessButAbrupt, this.stripSelf());

            return ClassParseResult.success(this.stripSelf());
        } catch (e) {
            console.error(`Error with file: ${this.fileName}`)
            console.error(e)
        }
        return ClassParseResult.of(ClassParseResultReason.FailedWithError, this.stripSelf());
    }

    /**
     *
     * @param nocc {CIterator}
     * @returns {int}
     */
    readClassHeader(nocc) {
        // Start index
        let start = nocc.index();

        let idk = nocc.findFirstOfMany(['{']);

        nocc.setIndex(9999)
        return nocc.index();
    }

    /**
     *
     * @param nocc {CIterator}
     * @returns {int}
     */
    readClassData(nocc) {


        return nocc.index();
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