class JvmFunction {

    ownerClass; // JvmClass
    accessFlags; // int
    functionName; // String
    functionArgs; // String[]
    instructions; // INode[]

    isLoaded = false;

    constructor(ownerClass, accessFlags, functionName, functionArgs) {
        this.ownerClass = ownerClass;
        this.accessFlags = accessFlags;
        this.functionName = functionName;
        this.functionArgs = functionArgs;
    }

    load(instructions = {}) {
        if (this.isLoaded) {
            throw new Error('Function already loaded.');
        }
        this.instructions = instructions;
        this.isLoaded = true;
    }

    get execute() {
        let pointer = 0;
        const len = this.instructions.length;
        while (pointer < len) {
            const insn = this.instructions[pointer];
            insn.execute();
        }
    }

}