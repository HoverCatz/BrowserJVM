class JvmTryCatch {

    start; // int
    end; // int
    handler; // int
    type; // JvmClass

    constructor(start, end, handler, type) {
        this.start = start;
        this.end = end;
        this.handler = handler;
        this.type = type;
    }

}