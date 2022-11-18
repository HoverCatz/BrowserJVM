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
        this.input = input;
        this.original = this.clone();
    }

    get execute() {
        if (this.hasExecuted)
            this.reset();
        else
            this.hasExecuted = true;
    }

    reset() {
        this.input = this.original == null ? null : this.clone();
        this.currentInput = 0;
        this.retValue = null;
        this.doReturn = false;
    }

    returnObject(obj) {
        this.retValue = obj;
        this.doReturn = true;

    }

    clone() {
        // Clone originals to input
        // then return the cloned list
        const len = this.input.length;
        const original = [...len];
        for (let i = 0; i < len; i++) {
            const obj = this.input[i];
            original[i] = cloneObject(obj);
        }
        return original;
    }

    get

}