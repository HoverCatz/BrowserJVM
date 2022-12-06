class JavaSourceReader extends JavacUtils {

    /** @type string */
    fileName;

    /** @type JvmClass */
    clz;

    constructor(fileName, text, iter) {
        super();
        this.fileName = fileName;
        this.text = text;
        this.iter = iter;
        this.clz = new JvmClass();
    }

    async parseSourceCode() {
        const iter = this.iter;

        // Read package
        const pkg = [];
        let word = this.readWord();
        if (word === 'package')
            pkg.push(...this.readPackage(iter));
        console.log(`package: ${pkg.join('.')}`)

        // Read annotations
        const annotationData = [];
        while (true) {
            let char = iter.peek();
            if (char === '@') {
                const anno = this.readAnnotation(iter);

                // if we have annotationData, set index at end of data
                if (typeof anno.data === 'object')
                    iter.setIndex(anno.data.close);

                // Reach next annotation (if any)
                this.skipWhitespace(iter);

                // Add annotation to the annotation list
                annotationData.push(...[anno]);

                console.log(`annotationData: '${anno.annoClassName.join('.')}, hasData: ${typeof anno.data === 'object'}'`)
            } else {
                break;
            }
        }
        console.log('annotationData:', annotationData)

        // Reach the class
        this.skipWhitespace(iter);

        word = this.readWord(iter);
        console.log(`word: ${word}`)

        word = this.readWord(iter);
        console.log(`word: ${word}`)

        word = this.readWord(iter);
        console.log(`word: ${word}`)

        // console.log(this.readPackage());

        return '';
    }

    /**
     * Parse annotation
     * @param iter {Iterator}
     */
    readAnnotation(iter) {
        // Ignore first annotation character
        iter.next(); // @

        // Read annotation class name
        const annoClassName = [];
        while (true) {
            const char = iter.peek();
            if (this.isAlphaNumeric(char)) {
                const word = this.readWord(iter);
                annoClassName.push(word);
            } else if (char === '.') {
                iter.next();
                continue;
            } else {
                break;
            }
        }

        const data = {
            'annoClassName': annoClassName,
        };

        // Check if we have more data
        let char = iter.peek();
        if (char === '(') {
            const index = iter.index();
            data.data = this.readAnnotationData(iter, index);
        }

        return data;
    }

    /**
     * Parse annotation data
     * @param iter {Iterator}
     * @param index {int}
     */
    readAnnotationData(iter, index) {
        const [open, close, sub] = this.findOpenCloseRange(this.text, index, '(', ')');
        // console.log(sub)
        return {
            'open': open + index,
            'close': close + index,
            'sub': sub
        };
    }

    /**
     * Parse package
     * @param iter {Iterator}
     * @returns {string[]}
     */
    readPackage(iter) {
        const pkg = [];
        while (true) {
            const char = iter.peek();
            if (this.isAlphaNumeric(char)) {
                pkg.push(this.readWord());
            } else if (char === '.') {
                iter.next();
                this.skipWhitespace(iter);
                continue;
            } else if (char === ';') {
                iter.next();
                this.skipWhitespace(iter);
                break;
            } else if (this.isWhitespace(char)) {
                this.skipWhitespace(iter);
            } else {
                throw new Error(`Invalid character: '${char}'`);
            }
        }
        return pkg;
    }

}