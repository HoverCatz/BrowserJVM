class JvmFunction {

    ownerClass; // JvmClass

    accessFlags; // int
    functionName; // String
    functionDesc; // String
    isStaticInstance; // boolean

    instructions; // INode[]
    tryCatches; // JvmTryCatch[]

    isLoaded = false;

    static staticInstances = {}; // Key: 'ownerPackage/ownerClassName functionNameFunctionDesc'

    constructor(ownerClass, accessFlags, functionName, functionDesc) {
        this.ownerClass = ownerClass;
        this.accessFlags = accessFlags;
        this.functionName = functionName;
        this.functionDesc = functionDesc;
        this.isStaticInstance = isStatic(accessFlags);
    }

    /**
     * Load the instruction-set and the try-catches
     * @param instructions
     * @param tryCatches
     */
    load(instructions = {}, tryCatches = {}) {
        if (this.isLoaded) {
            throw new Error('Function already loaded.');
        }
        this.instructions = instructions;
        this.tryCatches = tryCatches;
        this.isLoaded = true;
    }

    /**
     * Execute this function
     * @returns {null|*}
     */
    execute(locals = [...Array(0)], stack = []) {
        if (!this.isLoaded) {
            throw new Error('Function `' + this.getPath() + '` isn\'t loaded.');
        }
        let pointer = 0;
        let lineNumber = 0;
        const len = this.instructions.length;
        // Loop through all instructions
        while (pointer >= 0 && pointer < len) {
            try {
                const pc = pointer;
                // Retrieve current instruction
                const insn = this.instructions[pc];
                // Actually execute instruction
                insn.execute(locals, stack);
                // Check return value
                if (insn.doReturn) {
                    return insn.retValue;
                }
                // Only go to next instruction if we didn't jump elsewhere
                if (pc === pointer)
                    pointer++;
            } catch (e) {
                // TODO: Catch error, jump to handler
                break;
            }
        }
    }

    /**
     * Get or create a new instance (static or not) of this Function.
     * @returns {JvmFunction}
     * @throws {Error}
     */
    getOrCreate() {
        if (isStatic(this.accessFlags))
            return this.newInstance(true);
        return this.newInstance();
    }

    /**
     * Create new instance, or get the existing static instance.
     * @returns {JvmFunction}
     * @throws {Error}
     */
    newInstance(useStatic = false) {
        let staticKey;
        const accessFlags = this.accessFlags;
        const isStaticFunction = isStatic(accessFlags);
        if (useStatic && !isStaticFunction) {
            throw new Error('Function `' + this.getPath() + '` isn\'t static.');
        }
        if (!useStatic && isStaticFunction) {
            throw new Error('Function `' + this.getPath() + '` is static.');
        }
        const functionName = this.functionName;
        const owner = this.ownerClass;
        if (isStaticFunction) {
            const ownerPkg = (owner.package.length > 0) ? (owner.package + '/') : '';
            const ownerClassName = owner.className;
            staticKey = ownerPkg + ownerClassName + ' ' + functionName + ' ' + this.functionDesc;
            if (staticKey in JvmFunction.staticInstances) {
                console.log('returning an existing static function');
                return JvmFunction.staticInstances[staticKey];
            }
        }
        const func = new JvmFunction(owner, accessFlags, functionName);
        func.load(this.instructions);
        if (isStaticFunction) {
            console.log('creating a new static function:', staticKey);
            JvmFunction.staticInstances[staticKey] = func;
        } else {
            console.log('creating a new function instance');
        }
        return func;
    }

    /**
     * Return either an existing or new non-static instance, or throws an Error if the function is static.
     * @returns {JvmFunction}
     * @throws {Error}
     */
    getOrCreateNonStaticInstance() {
        if (isStatic(this.accessFlags)) {
            throw new Error('Function `' + this.getPath() + '` is static.');
        }
        return this.newInstance();
    }

    /**
     * Return either an existing or new static instance, or throws an Error if the function isn't static.
     * @returns {JvmFunction}
     * @throws {Error}
     */
    getOrCreateStaticInstance() {
        if (!isStatic(this.accessFlags)) {
            throw new Error('Function `' + this.getPath() + '` isn\'t static.');
        }
        return this.newInstance(true);
    }

    /**
     * Returns the path to this Function.
     * @returns {string}
     */
    getPath() {
        return this.ownerClass.getPath() + ' ' + this.functionName + '' + this.functionDesc;
    }

    /**
     * Returns the dotted path to this Function.
     * @returns {string}
     */
    getDottedPath() {
        return this.ownerClass.getDottedPath() + ' ' + this.functionName + '' + this.functionDesc;
    }

}