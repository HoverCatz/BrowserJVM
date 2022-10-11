class Common {
    constructor() {
        this.access = 0;
    }
    isStatic = () => (this.access & Opcodes.ACC_STATIC) !== 0;
}

class JvmClass extends Common {
    constructor() {
        super();
        this.initialized = false;

        this.classObject = false;
        this.superClass = false;
        this.interfaces = { };
        this.name = '';
        this.fields = { };
        this.functions = { };

        this.fieldsCache = { };
        this.functionsCache = { };

        this.owners = [ ];
    }
    addInterface(itz) {
        itz.owners.push(this);
        this.interfaces[itz.name] = itz;
    }
    addField(field) {
        field.owner = this;
        this.fields[field.name + ' ' + field.desc] = field;
    }
    findField(name, desc, checkedList = [ ]) {
        const name_desc = name + ' ' + desc;
        if (name_desc in this.fieldsCache)
            return this.fieldsCache[name_desc];
        checkedList.push(this.name);
        let field = this.fields[name_desc];
        if (!field && this.superClass)
            field = this.superClass.findField(name, desc);
        if (!field && Object.keys(this.interfaces).length > 0)
            for (const [_, itzClz] of Object.entries(this.interfaces))
            {
                field = itzClz.findField(name, desc);
                if (field) break;
            }
        console_println(field, this.owner)
        if (!field && this.owner && !(this.owner.name in checkedList))
        {
            console_println('searching owner: ' + this.owner.name)
            field = this.owner.findField(name, desc, checkedList);
        }
        if (field)
            this.fieldsCache[name_desc] = field;
        return field;
    }
    addFunction(func) {
        func.owner = this;
        this.functions[func.name + ' ' + func.desc] = func;
    }
    findFunction(name, desc) {
        const name_desc = name + ' ' + desc;
        if (name_desc in this.functionsCache)
            return this.functionsCache[name_desc];
        let func = this.functions[name_desc];
        if (!func && this.superClass)
            func = this.superClass.findFunction(name, desc);
        if (!func && this.interfaces.length > 0)
            for (const [_, itzClz] of this.interfaces)
            {
                func = itzClz.findFunction(name, desc);
                if (func) break;
            }
        if (func)
            this.functionsCache[name_desc] = func;
        return func;
    }
    isSuperClass(clazzName) {
        const superClass = this.superClass;
        if (!superClass)
            return false;
        if (superClass.name === clazzName)
            return true;
        return superClass.isSuperClass(clazzName);
    }
    toString() {
        return 'class ' + this.name;
    }
    async newInstance() {
        // Create a new instance of this class
        const copy = new JvmClass();
        copy.initialized = true;
        copy.access = this.access;
        if (this.superClass)
        {
            copy.superClass = await this.superClass.newInstance();
            copy.superClass.owners.push(copy);
        }
        for (const [itzName, itzClz] of Object.entries(this.interfaces))
        {
            const itzCopy = await itzClz.newInstance();
            itzCopy.owners.push(copy);
            copy.interfaces[itzName] = itzCopy;
        }
        copy.name = this.name;
        for (const [name_desc, value] of Object.entries(this.fields))
        {
            const field = value.copy();
            field.owner = copy;
            copy.fields[name_desc] = field;
        }
        for (const [name_desc, value] of Object.entries(this.functions))
        {
            const func = value.copy();
            func.owner = copy;
            copy.functions[name_desc] = func;
        }
        return copy;
    }
}

class JvmField extends Common {
    constructor() {
        super();
        this.name = '';
        this.desc = '';
        this.defaultValue = undefined; // for `final` fields
        this.value = undefined;
        this.owner = false;
    }
    copy() {
        const copy = new JvmField();
        copy.access = this.access;
        copy.name = this.name;
        copy.desc = this.desc;
        if (this.defaultValue !== undefined)
            copy.value = copy.defaultValue = this.defaultValue;
        // Leave value default
        return copy;
    }
    get() {
        verifyFieldAccess(this);
        return this.value;
    }
    set(value) {
        verifyFieldAccess(this);
        this.value = value;
    }
    put(value) {
        verifyFieldAccess(this);
        this.value = value;
    }
}

class JvmFunction extends Common {
    constructor() {
        super();
        this.name = '';
        this.desc = '';
        this.insns = [ ];
        this.tryCatchBlocks = [ ];
        this.owner = false; // reference to JvmClass
    }
    copy() {
        const copy = new JvmFunction();
        copy.access = this.access;
        copy.name = this.name;
        copy.desc = this.desc;
        copy.insns = cloneList(this.insns);
        // Leave stack default
        copy.tryCatchBlocks = cloneList(this.tryCatchBlocks);
        // Leave owner default
        return copy;
    }
    async execute(stack = [], locals = {}) {
        // TODO: Move `stack` to the arguments
        const debug = 1;
        if (debug) console_println('executing ' + (this.owner.name !== undefined ? (this.owner.name + ' ') : '') + this.name + this.desc)
        const insns = this.insns;
        const owner = this.owner;

        // Check custom override
        const ownerName = owner.name;
        const name_desc = this.name + ' ' + this.desc;
        if (hasRet(ownerName, name_desc))
            return getRet(ownerName)(name_desc, stack, locals, owner);

        let pointer = 0;
        const max = insns.length;
        while (pointer >= 0 && pointer < max)
        {
            try
            {
                const pc = pointer;
                const insn = insns[pc];
                const opcode = firstKey(insn);
                const input = insn[opcode];

                if (debug) console_println('')
                if (debug) console_println('stack1=', stack)
                if (debug) console_println('    ', pc, opcode + ' [' + OpcodesReverse[opcode] + ']', 'input=', input);

                switch (opcode)
                {
                    case Opcodes.NOP: break;
                    case Opcodes.ACONST_NULL: stack.push(null); break;
                    case Opcodes.ICONST_M1:
                        stack.push(-1);
                        break;
                    case Opcodes.ICONST_0:
                    case Opcodes.LCONST_0:
                    case Opcodes.FCONST_0:
                    case Opcodes.DCONST_0:
                        stack.push(0);
                        break;
                    case Opcodes.ICONST_1:
                    case Opcodes.LCONST_1:
                    case Opcodes.FCONST_1:
                    case Opcodes.DCONST_1:
                        stack.push(1);
                        break;
                    case Opcodes.ICONST_2:
                    case Opcodes.FCONST_2:
                        stack.push(2);
                        break;
                    case Opcodes.ICONST_3:
                        stack.push(3);
                        break;
                    case Opcodes.ICONST_4:
                        stack.push(4);
                        break;
                    case Opcodes.ICONST_5:
                        stack.push(5);
                        break;

                    case Opcodes.BIPUSH:
                    case Opcodes.SIPUSH: {
                        stack.push(input);
                    } break;

                    case Opcodes.LDC:
                    case Opcodes.LDC_W:
                    case Opcodes.LDC2_W: {
                        if (input[0] !== 7)
                            stack.push(input[1]);
                        else
                            stack.push(await findClass(input[1].substring(1, input[1].length - 1)));
                    } break;

                    case Opcodes.ALOAD:
                    case Opcodes.ILOAD:
                    case Opcodes.DLOAD:
                    case Opcodes.FLOAD:
                    case Opcodes.LLOAD: stack.push(locals[input]); break;
                    case Opcodes.ILOAD_0:
                    case Opcodes.LLOAD_0:
                    case Opcodes.FLOAD_0:
                    case Opcodes.DLOAD_0:
                    case Opcodes.ALOAD_0: stack.push(locals[0]); break;
                    case Opcodes.ILOAD_1:
                    case Opcodes.LLOAD_1:
                    case Opcodes.FLOAD_1:
                    case Opcodes.DLOAD_1:
                    case Opcodes.ALOAD_1: stack.push(locals[1]); break;
                    case Opcodes.ILOAD_2:
                    case Opcodes.LLOAD_2:
                    case Opcodes.FLOAD_2:
                    case Opcodes.DLOAD_2:
                    case Opcodes.ALOAD_2: stack.push(locals[2]); break;
                    case Opcodes.ILOAD_3:
                    case Opcodes.LLOAD_3:
                    case Opcodes.FLOAD_3:
                    case Opcodes.DLOAD_3:
                    case Opcodes.ALOAD_3: stack.push(locals[3]); break;

                    case Opcodes.IALOAD:
                    case Opcodes.LALOAD:
                    case Opcodes.FALOAD:
                    case Opcodes.DALOAD:
                    case Opcodes.AALOAD:
                    case Opcodes.BALOAD:
                    case Opcodes.CALOAD:
                    case Opcodes.SALOAD:
                    {
                        const idx = stack.pop();
                        const arr = stack.pop();
                        stack.push(arr[idx]);
                    } break;

                    case Opcodes.ISTORE:
                    case Opcodes.LSTORE:
                    case Opcodes.FSTORE:
                    case Opcodes.DSTORE:
                    case Opcodes.ASTORE: locals[input] = stack.pop(); break;
                    case Opcodes.ISTORE_0:
                    case Opcodes.LSTORE_0:
                    case Opcodes.FSTORE_0:
                    case Opcodes.DSTORE_0:
                    case Opcodes.ASTORE_0: locals[0] = stack.pop(); break;
                    case Opcodes.ISTORE_1:
                    case Opcodes.LSTORE_1:
                    case Opcodes.FSTORE_1:
                    case Opcodes.DSTORE_1:
                    case Opcodes.ASTORE_1: locals[1] = stack.pop(); break;
                    case Opcodes.ISTORE_2:
                    case Opcodes.LSTORE_2:
                    case Opcodes.FSTORE_2:
                    case Opcodes.DSTORE_2:
                    case Opcodes.ASTORE_2: locals[2] = stack.pop(); break;
                    case Opcodes.ISTORE_3:
                    case Opcodes.LSTORE_3:
                    case Opcodes.FSTORE_3:
                    case Opcodes.DSTORE_3:
                    case Opcodes.ASTORE_3: locals[3] = stack.pop(); break;

                    case Opcodes.IASTORE:
                    case Opcodes.LASTORE:
                    case Opcodes.FASTORE:
                    case Opcodes.DASTORE:
                    case Opcodes.AASTORE:
                    case Opcodes.BASTORE:
                    case Opcodes.CASTORE:
                    case Opcodes.SASTORE:
                    {
                        const val = stack.pop();
                        const idx = stack.pop();
                        const arr = stack.pop();
                        arr[idx] = val;
                    } break;

                    case Opcodes.POP:
                        stack.pop();
                        break;
                    case Opcodes.POP2:
                        stack.pop();
                        stack.pop();
                        break;
                    case Opcodes.DUP: {
                        const val = stack.pop();
                        stack.push(val);
                        stack.push(val);
                    } break;
                    case Opcodes.DUP_X1: {
                        const val2 = stack.pop();
                        const val = stack.pop();
                        stack.push(val);
                        stack.push(val2);
                        stack.push(val);
                    } break;
                    case Opcodes.DUP_X2: {
                        const val3 = stack.pop();
                        const val2 = stack.pop();
                        const val = stack.pop();
                        stack.push(val);
                        stack.push(val2);
                        stack.push(val3);
                        stack.push(val);
                    } break;
                    case Opcodes.DUP2: {
                        const val2 = stack.pop();
                        const val = stack.pop();
                        stack.push(val);
                        stack.push(val2);
                        stack.push(val);
                        stack.push(val2);
                    } break;
                    case Opcodes.DUP2_X1: {
                        const val3 = stack.pop();
                        const val2 = stack.pop();
                        const val = stack.pop();
                        stack.push(val);
                        stack.push(val2);
                        stack.push(val3);
                        stack.push(val);
                        stack.push(val2);
                    } break;
                    case Opcodes.DUP2_X2: {
                        const val4 = stack.pop();
                        const val3 = stack.pop();
                        const val2 = stack.pop();
                        const val = stack.pop();
                        stack.push(val);
                        stack.push(val2);
                        stack.push(val3);
                        stack.push(val4);
                        stack.push(val);
                        stack.push(val2);
                    } break;
                    case Opcodes.SWAP: {
                        const val2 = stack.pop();
                        const val = stack.pop();
                        stack.push(val2);
                        stack.push(val);
                    } break;

                    case Opcodes.IADD:
                    case Opcodes.DADD:
                    case Opcodes.FADD:
                    case Opcodes.LADD: {
                        const val2 = stack.pop();
                        const val = stack.pop();
                        stack.push(val + val2);
                    } break;
                    case Opcodes.ISUB:
                    case Opcodes.FSUB:
                    case Opcodes.DSUB:
                    case Opcodes.LSUB: {
                        const val2 = stack.pop();
                        const val = stack.pop();
                        stack.push(val - val2);
                    } break;
                    case Opcodes.IMUL:
                    case Opcodes.FMUL:
                    case Opcodes.DMUL:
                    case Opcodes.LMUL: {
                        const val2 = stack.pop();
                        const val = stack.pop();
                        stack.push(val * val2);
                    } break;
                    case Opcodes.IDIV:
                    case Opcodes.FDIV:
                    case Opcodes.DDIV:
                    case Opcodes.LDIV: {
                        const val2 = stack.pop();
                        const val = stack.pop();
                        const result = val / val2;
                        // if (!isFinite(result))
                        // {
                        //     const err = (await findClass('java/lang/ArithmeticException')).newClass();
                        //     err.setLocalsOnly('<init>', '(Ljava/lang/String;)V', {0: err, 1: 'Result was not finite: ' + result});
                        //     throw err;
                        // }
                        stack.push(result);
                    } break;
                    case Opcodes.IREM:
                    case Opcodes.FREM:
                    case Opcodes.DREM:
                    case Opcodes.LREM: {
                        const val2 = stack.pop();
                        const val = stack.pop();
                        stack.push(val % val2);
                    } break;
                    case Opcodes.INEG:
                    case Opcodes.FNEG:
                    case Opcodes.DNEG:
                    case Opcodes.LNEG: {
                        const val = stack.pop();
                        stack.push(-val);
                    } break;
                    case Opcodes.ISHL:
                    case Opcodes.LSHL: {
                        const val2 = stack.pop();
                        const val = stack.pop();
                        stack.push(val << val2);
                    } break;
                    case Opcodes.ISHR:
                    case Opcodes.LSHR: {
                        const val2 = stack.pop();
                        const val = stack.pop();
                        stack.push(val >> val2);
                    } break;
                    case Opcodes.IUSHR:
                    case Opcodes.LUSHR: {
                        const val2 = stack.pop();
                        const val = stack.pop();
                        stack.push(val >>> val2);
                    } break;
                    case Opcodes.IAND:
                    case Opcodes.LAND: {
                        const val2 = stack.pop();
                        const val = stack.pop();
                        stack.push(val & val2);
                    } break;
                    case Opcodes.IOR:
                    case Opcodes.LOR: {
                        const val2 = stack.pop();
                        const val = stack.pop();
                        stack.push(val | val2);
                    } break;
                    case Opcodes.IXOR:
                    case Opcodes.LXOR: {
                        const val2 = stack.pop();
                        const val = stack.pop();
                        stack.push(val ^ val2);
                    } break;

                    case Opcodes.IINC: {
                        const idx = input[0];
                        locals[idx] += input[1];
                    } break;

                    case Opcodes.I2L:
                    case Opcodes.I2F:
                    case Opcodes.I2D:
                    case Opcodes.L2I:
                    case Opcodes.L2F:
                    case Opcodes.L2D:
                    case Opcodes.F2I:
                    case Opcodes.F2L:
                    case Opcodes.F2D:
                    case Opcodes.D2I:
                    case Opcodes.D2L:
                    case Opcodes.D2F:
                    case Opcodes.I2B:
                    case Opcodes.I2C:
                    case Opcodes.I2S:
                    {
                        const val = stack.pop();
                        // TODO: Do we cast here, or does js do this for us?
                        stack.push(val);
                    } break;

                    case Opcodes.LCMP: {
                        const y = stack.pop();
                        const x = stack.pop();
                        const cmp = (x < y) ? -1 : ((x === y) ? 0 : 1);
                        stack.push(cmp);
                    } break;
                    case Opcodes.FCMPG: {
                        const y = stack.pop();
                        const x = stack.pop();
                        if (isNaN(x) || isNaN(y))
                            stack.push(1);
                        else
                        {
                            const cmp = (x < y) ? -1 : ((x === y) ? 0 : 1);
                            stack.push(cmp);
                        }
                    } break;
                    case Opcodes.FCMPL: {
                        const y = stack.pop();
                        const x = stack.pop();
                        if (isNaN(x) || isNaN(y))
                            stack.push(-1);
                        else
                        {
                            const cmp = (x < y) ? -1 : ((x === y) ? 0 : 1);
                            stack.push(cmp);
                        }
                    } break;
                    case Opcodes.DCMPG: {
                        const y = stack.pop();
                        const x = stack.pop();
                        if (isNaN(x) || isNaN(y))
                            stack.push(1);
                        else
                        {
                            if (x < y) stack.push(-1);
                            if (x > y) stack.push(1);
                            // TODO: Do we need to get bits from double value?
                            stack.push(0);
                        }
                    } break;
                    case Opcodes.DCMPL: {
                        const y = stack.pop();
                        const x = stack.pop();
                        if (isNaN(x) || isNaN(y))
                            stack.push(-1);
                        else
                        {
                            if (x < y) stack.push(-1);
                            if (x > y) stack.push(1);
                            // TODO: Do we need to get bits from double value?
                            stack.push(0);
                        }
                    } break;

                    case Opcodes.IFEQ: pointer = stack.pop() === 0 ? (input.getIndex() - 1) : pointer; break;
                    case Opcodes.IFNE: pointer = stack.pop() !== 0 ? (input.getIndex() - 1) : pointer; break;
                    case Opcodes.IFGT: pointer = stack.pop() > 0 ? (input.getIndex() - 1) : pointer; break;
                    case Opcodes.IFLT: pointer = stack.pop() < 0 ? (input.getIndex() - 1) : pointer; break;
                    case Opcodes.IFGE: pointer = stack.pop() >= 0 ? (input.getIndex() - 1) : pointer; break;
                    case Opcodes.IFLE: pointer = stack.pop() <= 0 ? (input.getIndex() - 1) : pointer; break;

                    case Opcodes.IF_ICMPEQ: {
                        const value2 = stack.pop();
                        const value1 = stack.pop();
                        pointer = value1 === value2 ? (input.getIndex() - 1) : pointer;
                    } break;
                    case Opcodes.IF_ICMPNE: {
                        const value2 = stack.pop();
                        const value1 = stack.pop();
                        pointer = value1 !== value2 ? (input.getIndex() - 1) : pointer;
                    } break;
                    case Opcodes.IF_ICMPGT: {
                        const value2 = stack.pop();
                        const value1 = stack.pop();
                        pointer = value1 > value2 ? (input.getIndex() - 1) : pointer;
                    } break;
                    case Opcodes.IF_ICMPLT: {
                        const value2 = stack.pop();
                        const value1 = stack.pop();
                        pointer = value1 < value2 ? (input.getIndex() - 1) : pointer;
                    } break;
                    case Opcodes.IF_ICMPGE: {
                        const value2 = stack.pop();
                        const value1 = stack.pop();
                        pointer = value1 >= value2 ? (input.getIndex() - 1) : pointer;
                    } break;
                    case Opcodes.IF_ICMPLE: {
                        const value2 = stack.pop();
                        const value1 = stack.pop();
                        pointer = value1 <= value2 ? (input.getIndex() - 1) : pointer;
                    } break;
                    case Opcodes.GOTO:
                        pointer = (input.getIndex() - 1);
                        break;

                    case Opcodes.IRETURN: // int
                    case Opcodes.DRETURN: // double
                    case Opcodes.FRETURN: // float
                    case Opcodes.LRETURN: // long
                    case Opcodes.ARETURN: // Object
                        return stack.pop();
                    case Opcodes.RETURN:
                        return;

                    case Opcodes.GETSTATIC:
                    case Opcodes.GETFIELD: {
                        const [ _, clazzName, fieldName, fieldDesc ] = input;
                        let clazz;
                        if (opcode === Opcodes.GETFIELD)
                            clazz = stack.pop(); // JvmClass
                        else
                            clazz = await findClass(clazzName);
                        const field = clazz.findField(fieldName, fieldDesc);
                        stack.push(field.get());
                    } break;
                    case Opcodes.PUTSTATIC:
                    case Opcodes.PUTFIELD: {
                        const [ _, clazzName, fieldName, fieldDesc ] = input;
                        const value = stack.pop();
                        let clazz;
                        if (opcode === Opcodes.PUTFIELD)
                            clazz = stack.pop(); // JvmClass
                        else
                            clazz = await findClass(clazzName);
                        if (debug) console_println('PUTFIELD', value, clazz, fieldName, fieldDesc)
                        const field = clazz.findField(fieldName, fieldDesc);
                        field.set(value);
                    } break;

                    case Opcodes.INVOKESPECIAL: {
                        const [ _, clazzName, funcName, funcDesc ] = input;
                        if (funcName === '<init>') // <init>()V
                        {
                            if (debug) console_println('SPECIAL', 'clazzName:', clazzName, ', stack:', stack)
                            if (clazzName === owner.name)
                            {
                                // Self
                                const argsCount = countMethodDescArguments(funcDesc);
                                const args = [ owner ];
                                for (let i = 0; i < argsCount; i++)
                                    args.push(stack.pop());

                                const ref = stack.pop(); // Reference (probably always an instance of self)
                                const init = ref.findFunction(funcName, funcDesc);

                                await init.execute([], args);
                                stack.push(ref);

                                break;
                            }
                            else
                            if (owner.isSuperClass(clazzName))
                            {
                                // Extends

                                const init = owner.superClass.findFunction(funcName, funcDesc);

                                const argsCount = countMethodDescArguments(funcDesc);
                                const args = [ owner ];
                                for (let i = 0; i < argsCount; i++)
                                    args.push(stack.pop());

                                const ref = stack.pop(); // Reference (probably always an instance of self)
                                await init.execute([], args);
                                stack.push(ref);

                                break;
                            }
                        }
                        // Don't break on purpose
                    }
                    case Opcodes.INVOKEVIRTUAL: {
                        const [ _, clazzName, funcName, funcDesc ] = input;
                        if (clazzName === 'java/lang/Class')
                        {

                            const argsCount = countMethodDescArguments(funcDesc);
                            const args = [ null ];
                            for (let i = 0; i < argsCount; i++)
                                args.push(stack.pop());

                            let clazz = stack.pop(); // JvmClass
                            if (clazz.classObject)
                                clazz = clazz.classObject;
                            else
                                clazz = await clazz.findFunction('getClass', '()Ljava/lang/Class;').execute();
                            args[0] = owner;

                            const func = clazz.findFunction(funcName, funcDesc);

                            const result = await func.execute([], args);
                            if (result)
                                stack.push(result);

                            break;
                        }
                        // Don't break on purpose
                    }
                    case Opcodes.INVOKESTATIC:
                    case Opcodes.INVOKEINTERFACE: {
                        const [ _, clazzName, funcName, funcDesc ] = input;

                        const argsCount = countMethodDescArguments(funcDesc);
                        const args = [ ];

                        let clazz;
                        if (opcode !== Opcodes.INVOKESTATIC)
                            args.push(null);
                        else
                            clazz = await findClass(clazzName);

                        for (let i = 0; i < argsCount; i++)
                            args.push(stack.pop());

                        if (opcode !== Opcodes.INVOKESTATIC)
                            args[0] = clazz = stack.pop(); // JvmClass

                        const func = clazz.findFunction(funcName, funcDesc);
                        const result = await func.execute([], args);

                        if (result)
                            stack.push(result);

                    } break;

                    case Opcodes.NEW: {
                        stack.push(await (await findClass(input)).newInstance());
                    } break;
                    case Opcodes.NEWARRAY: {
                        const count = stack.pop();
                        stack.push([...Array(count)].map(_ => null));
                    } break;
                    case Opcodes.ANEWARRAY: {
                        throw 'not implemented yet';
                    } break;
                    case Opcodes.ARRAYLENGTH: {
                        const arr = stack.pop();
                        stack.push(arr.length); // TODO: May need to fix this. Possible fix below:
                        // stack.push(Object.keys(arr).length);
                    } break;
                    case Opcodes.ATHROW: {
                        throw input;
                    } break;
                    case Opcodes.CHECKCAST: {

                    } break;
                    case Opcodes.INSTANCEOF: {

                    } break;
                    case Opcodes.MONITORENTER: {

                    } break;
                    case Opcodes.MONITOREXIT: {

                    } break;
                    case Opcodes.MULTIANEWARRAY: {
                        throw 'not implemented yet';
                    } break;
                    case Opcodes.IFNULL: pointer = !stack.pop() ? (input.getIndex() - 1) : pointer; break;
                    case Opcodes.IFNONNULL: pointer = stack.pop() !== null ? (input.getIndex() - 1) : pointer; break;

                    default:
                        throw new Error('Opcode `' + opcode + ' [' + OpcodesReverse[opcode] + ']` not implemented');

                }
                if (debug) console_println('stack2=', stack)

                if (pc === pointer)
                    pointer++;
            }
            catch (error)
            {
                console.error(error);
                break;
            }
        }
    }
}

// https://stackoverflow.com/questions/950087/how-do-i-include-a-javascript-file-in-another-javascript-file
function loadScript(url) {
    return new Promise((resolve, _) =>
    {
        // Adding the script tag to the head as suggested before
        const head = document.head;
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = resolve;
        script.onload = resolve;

        // Fire the loading
        head.appendChild(script);
    });
}

const customRets = { };
const customRetsHas = { };
const getRet = name => customRets[name];
const hasRet = (name, name_desc) => customRets[name] && customRetsHas[name] && customRetsHas[name](name_desc);
const requireClz = clz => { if (!clz) throw new Error("'clz' cannot be null here!"); }
const initRets = async () =>
{
    const mappings = {
        'java/lang/Object': 'java_lang_Object.js',
        'java/lang/Class': 'java_lang_Class.js',
        'java/lang/System': 'java_lang_System.js',
        'java/lang/String': 'java_lang_String.js',
        'java/lang/Throwable': 'java_lang_Throwable.js',
        'java/io/PrintStream': 'java_io_PrintStream.js',
        '.1': 'obzcu_re_testing_Test.js',
        '.2': 'obzcu_re_testing_Second.js',
        '.3': 'obzcu_re_testing_Third.js',
        '.4': 'obzcu_re_testing_Fourth.js',
    };
    for (const [clazzName, jsFile] of Object.entries(mappings))
    {
        if (clazzName && !clazzName.startsWith('.'))
        {
            const loaded = await loadClass(clazzName);
            if (!loaded) throw new Error("Failed loading rt class '" + clazzName + "'.");
        }
        await loadScript('js/natives.' + java_version + '/' + jsFile);
    }
}
const loadClass = async (classToLoad, local = false) => {
    const url = local ? ('testing/' + classToLoad.substring(classToLoad.lastIndexOf('/') + 1) + '.class') : ('java.' + java_version + '/' + classToLoad + '.class');
    const response = await fetch(url);
    if (response.status !== 200)
    {
        if (!local) return loadClass(classToLoad, true);
        return false;
    }
    const data = await response.blob();
    const buffer = await data.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    return await parseClassFile(bytes);
}
const findClass = async (clazzName) => {
    let clz = classes[clazzName];
    if (!clz)
    {
        if (debug) console_println('Loading rt class file: ' + ('java/' + java_version + '/' + clazzName + '.class'));
        const loaded = await loadClass(clazzName);
        if (!loaded)
        {
            console.error("Couldn't load class file: '" + clazzName + "'");
            return false;
        }
        clz = classes[clazzName];
        if (debug) console.info("Loaded class " + clazzName + ": ", clz);
        await clz.findFunction('<clinit>', '()V').execute();
        if (debug) console.info("Static initialized class " + clazzName + ": ", clz);
    }
    return clz;
}