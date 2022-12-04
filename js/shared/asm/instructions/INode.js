// Interface for any Instruction
class INode {

    opcode; // The instruction opcode
    opcodeRev; // The named instruction opcode

    hasExecuted;

    input; // An array of input objects
    original; // Clone of `input`

    currentInput; // The index into `input`

    retValue; // The object to return
    doReturn;

    constructor(opcode, input) {
        this.opcode = opcode;
        this.opcodeRev = OpcodesReverse[opcode];
        this.original = input;
        this.reset();
    }

    execute() {
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
        this.hasExecuted = false;
    }

    returnObject(obj) {
        this.retValue = obj;
        this.doReturn = true;
    }

    next() {
        return this.input[this.currentInput++];
    }

    nextInt() {
        const obj = this.input[this.currentInput++];
        return castObjectTo(obj, 'int');
    }

    nextString() {
        const obj = this.input[this.currentInput++];
        return castObjectTo(obj, 'string');
    }

    nextBoolean() {
        const obj = this.input[this.currentInput++];
        return castObjectTo(obj, 'boolean');
    }

}