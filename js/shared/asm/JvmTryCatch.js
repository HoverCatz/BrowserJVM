class JvmTryCatch {

    /** @type JvmLabel */ start;
    /** @type JvmLabel */ end;
    /** @type JvmLabel */ handler;
    /** @type string|JvmClass|null */ catchType;

    /**
     * @param start {JvmLabel}
     * @param end {JvmLabel}
     * @param handler {JvmLabel}
     * @param catchType {string|JvmClass|null}
     */
    constructor(start, end, handler, catchType) {
        this.start = start;
        this.end = end;
        this.handler = handler;
        this.catchType = catchType;
    }

    /** @returns {JvmLabel} */
    getStart() {
        return this.start;
    }

    /** @returns {JvmLabel} */
    getEnd() {
        return this.end;
    }

    /** @returns {JvmLabel} */
    getHandler() {
        return this.handler;
    }

    /** @returns {string|JvmClass|null} */
    getCatchType() {
        return this.catchType;
    }

}