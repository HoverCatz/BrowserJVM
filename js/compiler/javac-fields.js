class JavaSourceFieldReader extends JavacUtils {

    /** @type int */
    fieldAccess;

    /** @type string */
    fieldType;

    /** @type any */
    fieldValue;

    /**
     * @param text {string}
     * @param index {int}
     * @param itemType {string|ClassItemType}
     * @returns {int|false}
     */
    process(text, index, itemType) {
        const iter = this.iter = new Iterator(text);
        this.text = text;

        if (!this.skipWhitespace(iter))
            return false;

        let innerIndex;
        if (itemType === ClassItemType.FieldNoValue)
            innerIndex = this.readFieldNoValue(iter);
        else
        if (itemType === ClassItemType.Field)
            innerIndex = this.readField(iter);

        if (innerIndex === false)
            return false;

        return innerIndex + index;
    }

    readFieldNoValue(iter) {

        console.log(`text: '${this.text}'`)

        const [ index, char ] = this.indexOfFirstSkipComments([';'], iter);
        if (index === -1)
            return false;

        console.log(`index: ${index}`)
        console.log(`char: ${char}`)
        let sub = this.text.substring(0, index);
        sub = this.getTextWithoutComments(sub).trim();
        console.log(`sub: '${sub}'`)

        iter = new Iterator(sub + ';');
        iter.setBookmark(0);

        // Check field access
        let fieldAccess = this.readAccessFlags(iter);
        if (fieldAccess === false) return false;
        console.log(`accessFlags: ${this.accessFlagsToString(fieldAccess)}`)

        // Check field-type
        const fieldType = this.readWord(iter);
        if (fieldType === false) return false;
        console.log(`fieldType: ${fieldType}`)

        // Check field-name
        const fieldName = this.readWord(iter);
        if (fieldName === false) return false;
        console.log(`fieldName: ${fieldName}`)

        return iter.index();
    }

    readField(iter) {

        return iter.index();
    }

    readAccessFlags(iter) {
        let fieldAccess = 0;
        let word = this.readWord(iter);
        if (word === false) return false;
        if (word in this.accessWords) {
            console.log(`fieldAccess: ${word}`)
            fieldAccess |= this.accessWords[word];

            // Set bookmark so we can return later if needed
            iter.setBookmark(0);

            // Check field access again!
            word = this.readWord(iter);
            if (word === false) return false;
            if (word in this.accessWords) {
                console.log(`fieldAccess: ${word}`)
                fieldAccess |= this.accessWords[word];

                // Set bookmark so we can return later if needed
                iter.setBookmark(0);

                // Check field access again-again!
                word = this.readWord(iter);
                if (word === false) return false;
                if (word in this.accessWords) {
                    console.log(`fieldAccess: ${word}`)
                    fieldAccess |= this.accessWords[word];
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
        return fieldAccess;
    }

}