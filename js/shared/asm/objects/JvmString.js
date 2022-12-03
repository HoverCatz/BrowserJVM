class JvmString extends JvmObject {

    /**
     * @type {string}
     */
    stringValue;

    /**
     * @type {number}
     */
    stringLength;

    /**
     * @param value {string}
     */
    constructor(value) {
        super();
        this.value = this;
        this.stringValue = value;
        this.stringLength = value.length;
    }

    /**
     * Gets the length of the string
     * @returns {number}
     */
    getLength() {
        return this.stringLength;
    }

    /**
     * Shorten string (or don't)
     * @param length {number} New length
     */
    setLength(length) {
        if (length < 0)
            throw new JvmError('String index out of range: ' + length, 'java/lang/StringIndexOutOfBoundsException');
        if (length < this.stringLength) // Substring it
            this.stringValue = this.stringValue.substring(0, length);
    }

    /**
     * Return the character at index
     * @param index {number}
     * @returns {string}
     */
    getCharAt(index) {
        if (index < 0 || index >= this.stringLength)
            throw new JvmError('String index out of range: ' + index, 'java/lang/StringIndexOutOfBoundsException');
        return this.stringValue[index];
    }

    /**
     * Sets the character at index
     * @param index {number}
     * @param char {string|JvmChar}
     */
    setCharAt(index, char) {
        if (index < 0 || index >= this.stringLength)
            throw new JvmError('String index out of range: ' + index, 'java/lang/StringIndexOutOfBoundsException');
        if (char instanceof JvmChar)
            char = String.fromCharCode(char.get());
        this.stringValue[index] = char;
    }

    /**
     * Append {@link str} to current string instance
     * @param str {string|JvmString}
     */
    append(str) {
        if (str instanceof JvmString)
            str = str.getString();
        this.stringValue += str;
        this.stringLength = this.stringValue.length;
    }

    /**
     * Get full string
     * @returns {string}
     */
    getString() {
        return this.stringValue;
    }

    get() {
        return this.getString();
    }

    /**
     * Set full string
     * @param string
     */
    setString(string) {
        this.stringValue = string;
    }

    static of(value) {
        return new JvmString(value);
    }

}