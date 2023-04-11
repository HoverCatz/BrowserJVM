class JavaSourceFunctionReader extends JavacUtils {

    /** @type int */
    functionAccess;

    /** @type string */
    functionReturnType;

    /** @type string */
    functionName;

    /**
     * @param text {string}
     * @param index {int}
     * @param itemType {string|ClassItemType}
     * @returns {int|false}
     */
    process(text, index, itemType) {
        const [ open, close, functionBlockText ] = this.findOpenCloseRange(text, 0, '{', '}');
        const functionInformation = text.substring(0, open - 1);

        this.parseFunctionHeader(functionInformation.trim());

        this.parseFunctionCode(functionBlockText.trim());

        return index + close;
    }

    /**
     * Parse function header (access flags, return type, function name, arguments, throws)
     * @param text {string}
     */
    parseFunctionHeader(text) {
        const iter = new Iterator(text);

        const accessFlags = this.readAccessFlags(iter);
        console.log(`function access flags: ${this.accessFlagsToString(accessFlags)}`)
        this.functionAccess = accessFlags;

        // TODO: Read return type (if any, might be a constructor)

    }

    /**
     * Parse function code (all code inside curly brackets)
     * @param text {string}
     */
    parseFunctionCode(text) {
        console.log(text)
    }

}