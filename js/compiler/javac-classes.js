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

    async parseSourceCode(throwErrors = true) {
        const iter = this.iter;

        // Read package
        const pkg = [];
        let word = this.readWord();
        if (word === false) return false;
        if (word === 'package')
            pkg.push(...this.readPackage(iter));
        console.log(`package: ${pkg.join('.')}`)

        // Read annotations
        const annotationData = [];
        while (true) {
            let char = iter.peek();
            if (char === false) return false;
            if (char === '@') {
                const anno = this.readAnnotation(iter);
                if (anno === false)
                    return false;

                // if we have annotationData, set index at end of data
                if (typeof anno.data === 'object')
                    iter.setIndex(anno.data.close);

                // Reach next annotation (if any)
                if (!this.skipWhitespace(iter))
                    return false;

                // Add annotation to the annotation list
                annotationData.push(...[anno]);

                console.log(`annotationData: '${anno.annoClassName.join('.')}, hasData: ${typeof anno.data === 'object'}'`)
            } else {
                break;
            }
        }
        console.log('annotationData:', annotationData)

        // Reach the class
        if (!this.skipWhitespace(iter))
            return false;

        let classAccess = 0;
        const accessWords = {
            'public': Opcodes.ACC_PUBLIC,
            'private': Opcodes.ACC_PRIVATE,
            'protected': Opcodes.ACC_PROTECTED,
            'static': Opcodes.ACC_STATIC,
            'final': Opcodes.ACC_FINAL,
            'abstract': Opcodes.ACC_ABSTRACT,
            'deprecated': Opcodes.ACC_DEPRECATED
            // Records aren't supported in java7
        };

        // Set bookmark so we can return later if needed
        iter.setBookmark(0);

        // Check class access
        word = this.readWord(iter);
        if (word === false) return false;
        if (word in accessWords) {
            console.log(`classAccess: ${word}`)
            classAccess |= accessWords[word];

            // Set bookmark so we can return later if needed
            iter.setBookmark(0);

            // Check class access again!
            word = this.readWord(iter);
            if (word === false) return false;
            if (word in accessWords) {
                console.log(`classAccess: ${word}`)
                classAccess |= accessWords[word];
            } else {
                // Reset iter index, because we didn't find another access flag
                iter.gotoBookmark(0);
            }
        } else {
            // Reset iter index, because we didn't find any access flags
            iter.gotoBookmark(0);
        }
        console.log(`accessFlags: ${classAccess}`)

        // Check class-type
        const classTypes = [
            'class',
            'enum',
            'interface'
        ];
        const classType = this.readWord(iter);
        if (classType === false) return false;
        console.log(`classType: ${classType}`) // classType (class, enum, interface, etc)
        if (!classTypes.includes(classType)) {
            if (throwErrors) throw new Error(`Class-type '${classType}' not supported.`);
            return false;
        }

        // Read class-name
        const className = this.readWord(iter);
        if (className === false) return false;
        console.log(`className: ${className}`) // className

        const [ blockOpen, blockEnd, classBlock ] = this.findOpenCloseRange(this.text, iter.index(), '{', '}');
        // Verify content after class has ended
        const lastText = this.text.substring(blockEnd + 1).trimEnd();
        console.log(`'${lastText}'`)

        if (lastText.length > 0) {
            if (throwErrors) throw new Error('Garbage-data at end of class.');
            return false;
        }

        return {
            'package': pkg,
            'className': className,
            'classType': classType,
            'accessFlags': classAccess,
            'annotations': annotationData.join(', '),
            'classBlock': classBlock
        };
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
            if (char === false) return false;
            if (this.isAlphaNumeric(char)) {
                const word = this.readWord(iter);
                if (word === false) return false;
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
        if (char === false) return false;
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
            'open': open,
            'close': close,
            'sub': sub
        };
    }

    /**
     * Parse package
     * @param iter {Iterator}
     * @returns {string[]|false}
     */
    readPackage(iter) {
        const pkg = [];
        while (true) {
            const char = iter.peek();
            if (char === false) return false;
            if (this.isAlphaNumeric(char)) {
                const word = this.readWord();
                if (word === false) return false;
                pkg.push(word);
            } else if (char === '.') {
                iter.next();
                if (!this.skipWhitespace(iter))
                    return false;
                continue;
            } else if (char === ';') {
                iter.next();
                if (!this.skipWhitespace(iter))
                    return false;
                break;
            } else if (this.isWhitespace(char)) {
                if (!this.skipWhitespace(iter))
                    return false;
            } else {
                throw new Error(`Invalid character: '${char}'`);
            }
        }
        return pkg;
    }

}