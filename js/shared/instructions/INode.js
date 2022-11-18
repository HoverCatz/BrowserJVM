// Interface for any Instruction
class INode {

    opcode;

    hasExecuted;

    input; // An array of input objects
    original; // Clone of `input`

    currentInput; // The index into `input`

    retValue; // The object to return
    doReturn;

    constructor(opcode, input) {
        this.opcode = opcode;
        this.original = input;
        this.reset();
    }

    get execute() {
        if (this.hasExecuted)
            this.reset();
        else
            this.hasExecuted = true;
    }

    reset() {
        this.input = this.original == null ? null : deepCloneObject(this.original);
        this.currentInput = 0;
        this.retValue = null;
        this.doReturn = false;
    }

    returnObject(obj) {
        this.retValue = obj;
        this.doReturn = true;
    }

    get next() {
        return this.input[currentIndex++];
    }

    get nextInt() {
        const obj = this.input[currentIndex++];
        return castObjectTo(obj, 'int');
    }

    get nextString() {
        const obj = this.input[currentIndex++];
        return castObjectTo(obj, 'string');
    }

    get nextBoolean() {
        const obj = this.input[currentIndex++];
        return castObjectTo(obj, 'boolean');
    }

}