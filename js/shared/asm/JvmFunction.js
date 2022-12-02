class JvmFunction {

    /** @type JvmClass */ ownerClass;

    /** @type number */ accessFlags;
    /** @type string */ functionName;
    /** @type string */ functionDesc;
    /** @type boolean */ isStaticInstance;

    /** @type INode[] */ instructions;
    /** @type JvmTryCatch[] */ tryCatches;

    /** @type boolean */ isLoaded = false;

    // Asm
    /** @type string|null */ signature = null;
    /** @type [] */ exceptions;

    static staticInstances = {}; // Key: 'packageAndClassName functionName(functionDesc)'

    constructor(ownerClass, accessFlags, functionName, functionDesc) {
        this.ownerClass = ownerClass;
        if (!!functionName) {
            this.accessFlags = accessFlags;
            this.functionName = functionName;
            this.functionDesc = functionDesc;
            this.isStaticInstance = isStatic(accessFlags);
            this.exceptions = [];
        }
    }

    /**
     Only meant to be used directly by ASM
     */
    asmLoad(accessFlags, functionName, functionDesc, signature, exceptions) {
        this.accessFlags = accessFlags;
        this.functionName = functionName;
        this.functionDesc = functionDesc;
        this.signature = signature;
        this.exceptions = exceptions;
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
    execute(locals = [], stack = new JvmStack()) {
        if (!this.isLoaded) {
            throw new Error(`Function ${this.getPath()} isn't loaded.`);
        }
        this.#assertArgumentCount(locals);
        let pointer = 0;
        let lineNumber = -1;
        let lastOpcode = -1;
        const refs = {
            'pointer': pointer,
            'lineNumber': lineNumber
        };
        const len = this.instructions.length;
        // Loop through all instructions
        while (pointer >= 0 && pointer < len) {
            try {
                // Current pointer position
                const pc = pointer;

                // A referenced list of the Pointer but also the lineNumber
                refs.pc = pc;
                refs.lineNumber = lineNumber;

                // Retrieve current instruction
                const insn = this.instructions[pc];

                // Set the last opcode used (for error messages)
                lastOpcode = insn.opcode;

                // Actually execute instruction
                insn.execute(locals, stack, refs);

                // Check return value
                if (insn.doReturn) {
                    this.assertReturnType(lastOpcode);
                    return insn.retValue;
                }

                // Check return void
                if (refs.pc === -1) // -1 means Return
                    break;

                // Only go to next instruction if we didn't jump elsewhere
                if (pc === pointer)
                    pointer++;

                // Set the current lineNumber
                lineNumber = refs.lineNumber;
            } catch (e) {
                if (e instanceof JvmError) {
                    if (lineNumber >= 0)
                        console.error(`${e.type.replaceAll('/', '.')}: ${e.message}\n` +
                            `\tat ${this.ownerClass.className}.${this.functionName}(${this.ownerClass.className}:${lineNumber})`);
                        // console.error('Error `' + e.message + '` at line #' + lineNumber + ' ' +
                    //     '(instruction index #' + pointer + ', instruction `' + OpcodesReverse[lastOpcode] + '`)');
                    else
                        console.error(`${e.type.replaceAll('/', '.')}: ${e.message}\n` +
                            `\tat ${this.ownerClass.className}.${this.functionName}(${this.ownerClass.className}:?)`);
                    // console.error(e.type.replaceAll('/', '.') + ' `' + e.message + '` at unknown line ' +
                    //     '(instruction index #' + pointer + ', instruction `' + OpcodesReverse[lastOpcode] + '`)');
                } else {
                    console.error(e)
                }
                // TODO: Catch error, jump to handler
                // Use `lineNumber` if available.
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
        if (this.isStaticInstance)
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
        const isStaticFunction = this.isStaticInstance;
        if (useStatic && !isStaticFunction) {
            throw new Error('Function `' + this.getPath() + '` isn\'t static.');
        }
        if (!useStatic && isStaticFunction) {
            throw new Error('Function `' + this.getPath() + '` is static.');
        }
        const functionName = this.functionName;
        const functionDesc = this.functionDesc;
        const owner = this.ownerClass;
        if (isStaticFunction) {
            const ownerPkg = (owner.package.length > 0) ? (owner.package + '/') : '';
            const ownerClassName = owner.className;
            staticKey = ownerPkg + ownerClassName + ' ' + functionName + ' ' + functionDesc;
            if (staticKey in JvmFunction.staticInstances) {
                console.log('returning an existing static function');
                return JvmFunction.staticInstances[staticKey];
            }
        }
        const func = new JvmFunction(owner, accessFlags, functionName, functionDesc);
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
     * Returns the local function path to this Function.
     * @returns {string}
     */
    getFuncPath() {
        return this.functionName + '' + this.functionDesc;
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

    /**
     * Verify the return-type with the opcode
     * @param opcode
     */
    assertReturnType(opcode) {
        if (opcode === Opcodes.ARETURN) return true;
        const type = getReturnType(this.functionDesc);
        if ((opcode === Opcodes.IRETURN && (
                type === 'Z' || type === 'B' ||
                type === 'C' || type === 'S' || type === 'I')) ||
                (opcode === Opcodes.LRETURN && type === 'L') ||
                (opcode === Opcodes.FRETURN && type === 'F') ||
                (opcode === Opcodes.DRETURN && type === 'D'))
            return true;
        throw new Error(`Wrong return opcode '${OpcodesReverse[opcode]}' for function '${this.getFuncPath()}'`);
    }

    #assertArgumentCount(locals) {
        let argumentTypes = getArgumentTypes(this.functionDesc).length;
        if (!this.isStaticInstance) argumentTypes++;
        if (argumentTypes != locals.length)
            throw new JvmError(`Wrong amount of arguments (${locals.length}) provided for method '${this.getFuncPath()}'! Expecting ${argumentTypes}.`);
    }

}