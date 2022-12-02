class JvmLabel {

    /** @type int */ index;
    /** @type int|false */ lineNumber;

    /**
     * @param index {int}
     * @param lineNumber {int|false}
     */
    constructor(index, lineNumber = false) {
        this.index = index;
        this.lineNumber = lineNumber;
    }

    /**
     * Get the current bytecode instruction index
     * @returns {int}
     */
    getIndex() {
        return this.index;
    }

    /**
     * Get the current line-number (or false if none)
     * @returns {int|false}
     */
    getLineNumber() {
        return this.lineNumber;
    }

    /**
     * Create label by bytecode instruction index
     * @param index {int}
     * @param lineNumber {int|false}
     * @returns {JvmLabel}
     */
    static createLabel(index, lineNumber = false) {
        return new JvmLabel(index, lineNumber);
    }

}