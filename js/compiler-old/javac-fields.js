class JavaSourceFieldReader_Old extends JavacUtils_Old {

    /** @type int */
    fieldAccess;

    /** @type string */
    fieldType;

    /** @type string */
    fieldName;

    /** @type any */
    fieldValue = undefined;

    /**
     * @param text {string}
     * @param index {int}
     * @param itemType {string|ClassItemType}
     * @returns {int|false}
     */
    process(text, index, itemType) {
        const iter = this.iter = new Iterator(text);
        this.text = text;

        if (!this.skipWhitespace_(iter))
            return false;

        let innerIndex;
        if (itemType === ClassItemType.FieldNoValue)
            innerIndex = this.readFieldNoValue(iter);
        else
        if (itemType === ClassItemType.Field)
            innerIndex = this.readField(iter);

        if (innerIndex === false)
            return false;

        return innerIndex + index + 1;
    }

    readFieldNoValue(iter) {

        console.log(`text: '${this.text}'`)

        const [ index, char ] = this.indexOfFirst([';'], iter);
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
        const fieldAccess = this.readAccessFlags(iter);
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

        this.fieldAccess = fieldAccess;
        this.fieldType = fieldType;
        this.fieldName = fieldName;

        return index;
    }

    readField(iter) {

        const index = this.indexOf('=');
        if (index === false) return false;
        console.log(`index: '${index}'`)

        // We need to find this symbol ';', which is not inside any brackets '{}, (), []'
        const found = this.indexOfFirstOutsideBracketsSkipComments([';'], iter);
        if (found === false) return false;
        console.log(`found: '${found}'`)

        // Extract access flags, type and name
        let sub = this.text.substring(0, index);
        sub = this.getTextWithoutComments(sub).trim();
        console.log(`sub: '${sub}'`)

        iter = new Iterator(sub + ';');
        iter.setBookmark(0);

        // Check field access
        const fieldAccess = this.readAccessFlags(iter);
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

        // '+ 1' to skip the equals sign '='
        let fieldValue = this.text.substring(index + 1, found);
        fieldValue = this.getTextWithoutComments(fieldValue).trim();
        console.log(`fieldValue: '${fieldValue}'`)

        this.fieldAccess = fieldAccess;
        this.fieldType = fieldType;
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;

        return found;
    }

    /**
     * Find first index from multiple characters,
     * outside all brackets '{}, (), []', while skipping comments
     * @param chars {string[]}
     * @param iter {Iterator}
     * @param num {int}
     * @returns {int|false}
     */
    indexOfFirstOutsideBracketsSkipComments(chars, iter, num = 1) {
        iter.setBookmark(num);

        const [ index, first ] = this.indexOfFirst(['{', '(', '['].concat(chars), iter);

        iter.gotoBookmark(num);

        // We found ';' (etc) first!
        if (chars.includes(first))
            return index;

        // Skip until after the closing character
        this.skipUntilClosingChar_(first, iter);

        // Recursive function until the next ';' (etc)
        return this.indexOfFirstOutsideBracketsSkipComments(chars, iter, num + 1);
    }

}