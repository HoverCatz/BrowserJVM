class JvmClass {
    constructor() {
        this.accessFlags = 0;
        this.className = '';
        this.superClass = false;
        this.interfaces = [ ];
        this.stack = { };
        this.locals = { };
        this.instructions = { };
        this.tryCatchBlocks = { };
        this.labels = { };
        this.fields = { };
        this.methods = { };
    }
    load(name, desc, locals, instructions, tryCatchBlocks, labels) {
        const name_desc = name + ' ' + desc;
        this.stack[name_desc] = [ ];
        this.locals[name_desc] = locals;
        this.instructions[name_desc] = instructions;
        this.tryCatchBlocks[name_desc] = tryCatchBlocks;
        this.labels[name_desc] = labels;
    }
    addField(access, name, desc) {
        this.fields[name + ' ' + desc] = { 'access': access, 'name': name, 'desc': desc, 'isStatic': ((access & Opcodes.ACC_STATIC) !== 0), value: undefined };
    }
    addMethod(access, name, desc) {
        this.methods[name + ' ' + desc] = { 'access': access, 'name': name, 'desc': desc, 'isStatic': ((access & Opcodes.ACC_STATIC) !== 0) };
    }
    setLocalsOnly(name, desc, locals) {
        this.locals[name + ' ' + desc] = locals;
    }
    newClass() {
        return new JvmClass();
    }
    async execute(name, desc) {
        const name_desc = name + ' ' + desc;
        const debug = 1;
        if (debug) console.log('executing ' + name_desc);
        const stack = this.stack[name_desc];
        const locals = this.locals[name_desc];
        const labels = this.labels[name_desc];
        const instructions = this.instructions[name_desc];
        const func = getRet(this.className);
        const methodInfo = this.methods[name_desc];
        if ((func && func[name_desc] !== false) || (instructions === undefined || !instructions || instructions.length === 0))
        {
            // TODO: Add support for interfaces here
            if (!func) return [ false, null ];
            const ret = methodInfo.isStatic ? func(name_desc, stack, locals) : func(name_desc, stack, locals, this);
            return [ true, ret ];
        }
        const tryCatchBlocks = this.tryCatchBlocks[name_desc];
        const entries = Object.entries(instructions);

        const printOps = false;
        if (printOps)
        {
            console.log('');
            for (let i = 0; i < instructions.length; i++)
            {
                let insn = entries[i];
                let opcode = insn[0];
                let value = insn[1];
                const keys = Object.keys(value);
                opcode = parseInt(keys[0]) || keys[0];
                value = value[opcode];
                console.log('i: ' + i + ', opcode: ' + OpcodesReverse[opcode] + ', value: ', value);
            }
            console.log('');
        }

        let k = 0;
        const autoKill = false;

        for (let i = 0; i < instructions.length; i++)
        {
            if (autoKill && k++ === 100)
            {
                console.warn("Killing script after " + k + " executions.");
                return [false, null];
            }
            let insn = entries[i];

            let opcode = insn[0];
            let value = insn[1];
            const keys = Object.keys(value);

            opcode = parseInt(keys[0]) || keys[0];
            value = value[opcode];

            if (debug) console.log('stack before: ', stack);
            if (debug) console.log('locals before: ', locals);
            if (debug) console.log('i: ' + i + ', opcode: ' + OpcodesReverse[opcode] + ', value: ', value);
            switch (opcode)
            {
                case Opcodes.ASTORE:
                case Opcodes.ISTORE:
                case Opcodes.DSTORE:
                case Opcodes.FSTORE:
                case Opcodes.LSTORE: {
                    const idx = value;
                    locals[idx] = stack.pop();
                } break;
                case Opcodes.IINC: {
                    const idx = value[0];
                    locals[idx] += value[1];
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
                    stack.push(val / val2);
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
                case Opcodes.ALOAD:
                case Opcodes.ILOAD:
                case Opcodes.DLOAD:
                case Opcodes.FLOAD:
                case Opcodes.LLOAD: stack.push(locals[value]); break;
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

                case Opcodes.ARETURN: // Object
                case Opcodes.IRETURN: // int
                case Opcodes.DRETURN: // double
                case Opcodes.FRETURN: // float
                case Opcodes.LRETURN: // long
                    return [ true, stack.pop() ];
                case Opcodes.RETURN:
                    return [ true, null ];
                case Opcodes.ATHROW:
                    // throw new Error(stack.pop()); // TODO: Fix exceptions :D
                    break;
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
                case Opcodes.SWAP:
                    const val2 = stack.pop();
                    const val = stack.pop();
                    stack.push(val2);
                    stack.push(val);
                    break;
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
                case Opcodes.ARRAYLENGTH: {
                    const arr = stack.pop();
                    stack.push(arr.length); // TODO: May need to fix this. Possible fix below:
                    // stack.push(Object.keys(arr).length);
                    break;
                }
                case Opcodes.NOP:
                    /* Nothing! */
                break;
                case Opcodes.ACONST_NULL:
                    stack.push(null);
                break;
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

                case Opcodes.NEWARRAY: {
                    const count = stack.pop();
                    stack.push([...Array(count)].map(_ => null));
                } break;
                case Opcodes.BIPUSH:
                case Opcodes.SIPUSH: {
                    stack.push(value);
                } break;
                case Opcodes.LDC:
                case Opcodes.LDC_W:
                case Opcodes.LDC2_W: {
                    stack.push(value);
                } break;

                case Opcodes.INVOKEVIRTUAL: {
                    // [ opcode, owner, name, descriptor, isInterface ]
                    // methodVisitor.visitMethodInsn(opcode, owner, name, descriptor, isInterface);
                    const clazzName = value[1];
                    const funcName = value[2];
                    const funcDesc = value[3];
                    const isInterface = value[4];

                    let clz = classes[clazzName];
                    if (!clz)
                    {
                        if (debug) console.log('Loading rt class file: ' + ('java/' + java_version + '/' + clazzName + '.class'));
                        const loaded = await loadClass(clazzName);
                        if (!loaded)
                        {
                            console.error("Couldn't load class file: '" + clazzName + "'");
                            break;
                        }
                        clz = classes[clazzName];
                        if (debug) console.info("Loaded class " + clazzName + ": ", clz);
                    }

                    if (debug) console.log('method : ' + clazzName, funcName, funcDesc, isInterface);

                    const locals = { 0: clz };
                    const argsCount = countMethodDescArguments(funcDesc);
                    for (let n = 0; n < argsCount; n++)
                        locals[1 + n] = stack.pop();
                    clz.setLocalsOnly(funcName, funcDesc, locals);

                    if (funcDesc.endsWith(')V'))
                    {
                        const [exit, ret] = await clz.execute(funcName, funcDesc);
                        if (!exit) return [ false, ret ];
                    }
                    else
                    {
                        const [exit, ret] = await clz.execute(funcName, funcDesc);
                        if (!exit) return [ false, null ];
                        stack.push(ret);
                    }
                } break;
                case Opcodes.INVOKESPECIAL:
                case Opcodes.INVOKESTATIC: {
                    // [ opcode, owner, name, descriptor, isInterface ]
                    // methodVisitor.visitMethodInsn(opcode, owner, name, descriptor, isInterface);
                    const clazzName = value[1];
                    const funcName = value[2];
                    const funcDesc = value[3];

                    let clz = await findClass(clazzName);

                    const locals = { };
                    const argsCount = countMethodDescArguments(funcDesc);
                    for (let n = 0; n < argsCount; n++)
                        locals[n] = stack.pop();
                    clz.setLocalsOnly(funcName, funcDesc, locals);

                    if (funcDesc.endsWith(')V'))
                    {
                        const [exit, ret] = await clz.execute(funcName, funcDesc);
                        if (!exit) return [ false, ret ];
                    }
                    else
                    {
                        const [exit, ret] = await clz.execute(funcName, funcDesc);
                        if (!exit) return [ false, null ];
                        stack.push(ret);
                    }
                } break;
                case Opcodes.GETFIELD:
                case Opcodes.GETSTATIC: {
                    // methodVisitor.visitFieldInsn(opcode, owner, name, descriptor)
                    const clazzName = value[1];
                    const fieldName = value[2];
                    const fieldDesc = value[3];

                    let clz = await findClass(clazzName);
                    if (!clz) return [ false, null ];

                    let field = await findField(clz, fieldName, fieldDesc) || undefined;

                    if (debug) console.log('field : ' + clazzName, fieldName, fieldDesc, 'ret: ' + field);
                    if (field === undefined)
                        return [ false, null ];

                    stack.push(field.value);

                } break;
                case Opcodes.PUTFIELD:
                case Opcodes.PUTSTATIC: {
                    // methodVisitor.visitFieldInsn(opcode, owner, name, descriptor)
                    const clazzName = value[1];
                    const fieldName = value[2];
                    const fieldDesc = value[3];

                    let clz = classes[clazzName];
                    if (!clz)
                    {
                        if (debug) console.log('Loading rt class file: ' + ('java/' + java_version + '/' + clazzName + '.class'));
                        const loaded = await loadClass(clazzName);
                        if (!loaded)
                        {
                            console.error("Couldn't load class file: '" + clazzName + "'");
                            break;
                        }
                        clz = classes[clazzName];
                        if (debug) console.info("Loaded class " + clazzName + ": ", clz);
                    }

                    let field;
                    const customRet = getRet(clazzName) || false;
                    if (!customRet)
                        field = clz.fields[fieldName + ' ' + fieldDesc] || undefined;
                    else
                    {
                        field = customRet(fieldName + ' ' + fieldDesc) || (field = clz.fields[fieldName + ' ' + fieldDesc] || false);
                        if (debug) console.log('field : ' + clazzName, fieldName, fieldDesc, 'ret: ' + field);
                    }

                    if (debug) console.log('field : ' + clazzName, fieldName, fieldDesc, 'ret: ' + field);
                    if (field === undefined)
                        return [ false, null ];

                    field.value = stack.pop();

                } break;

                case Opcodes.NEW: {
                    // stack.push(new JvmClass());
                    // TODO: Fix multi-instances
                    stack.push(await findClass(value)); // Should we add .newClass() ?
                    // stack.push((await findClass(value)).newClass());
                } break;

                case Opcodes.MONITORENTER:
                case Opcodes.MONITOREXIT: {
                    // TODO: Nothing perhaps?
                } break;

                case Opcodes.GOTO:
                    i = (value.getIndex() - 1);
                break;
                case Opcodes.IF_ICMPEQ: {
                    const value2 = stack.pop();
                    const value1 = stack.pop();
                    i = value1 === value2 ? (value.getIndex() - 1) : i;
                } break;
                case Opcodes.IF_ICMPNE: {
                    const value2 = stack.pop();
                    const value1 = stack.pop();
                    i = value1 !== value2 ? (value.getIndex() - 1) : i;
                } break;
                case Opcodes.IF_ICMPGT: {
                    const value2 = stack.pop();
                    const value1 = stack.pop();
                    i = value1 > value2 ? (value.getIndex() - 1) : i;
                } break;
                case Opcodes.IF_ICMPLT: {
                    const value2 = stack.pop();
                    const value1 = stack.pop();
                    i = value1 < value2 ? (value.getIndex() - 1) : i;
                } break;
                case Opcodes.IF_ICMPGE: {
                    const value2 = stack.pop();
                    const value1 = stack.pop();
                    i = value1 >= value2 ? (value.getIndex() - 1) : i;
                } break;
                case Opcodes.IF_ICMPLE: {
                    const value2 = stack.pop();
                    const value1 = stack.pop();
                    i = value1 <= value2 ? (value.getIndex() - 1) : i;
                } break;

                case Opcodes.IF_ACMPEQ: i = stack.pop() === stack.pop() ? (value.getIndex() - 1) : i; break;
                case Opcodes.IF_ACMPNE: i = stack.pop() !== stack.pop() ? (value.getIndex() - 1) : i; break;

                case Opcodes.IFEQ: i = stack.pop() === 0 ? (value.getIndex() - 1) : i; break;
                case Opcodes.IFNE: i = stack.pop() !== 0 ? (value.getIndex() - 1) : i; break;
                case Opcodes.IFGT: i = stack.pop() > 0 ? (value.getIndex() - 1) : i; break;
                case Opcodes.IFLT: i = stack.pop() < 0 ? (value.getIndex() - 1) : i; break;
                case Opcodes.IFGE: i = stack.pop() >= 0 ? (value.getIndex() - 1) : i; break;
                case Opcodes.IFLE: i = stack.pop() <= 0 ? (value.getIndex() - 1) : i; break;

                case Opcodes.IFNONNULL: i = stack.pop() !== null ? (value.getIndex() - 1) : i; break;
                case Opcodes.IFNULL: i = !stack.pop() ? (value.getIndex() - 1) : i; break;

                // Custom instructions :D
                // case 'append': {
                //     const count = value[0];
                //     let result = '';
                //     for (let i = 0; i < count; i++)
                //         result = stack.pop() + result;
                //     stack.push(result);
                // } break;
                // case 'println': {
                //     const val = stack.pop();
                //     if (debug) console.log('println(' + val + ')');
                // } break;
                default:
                    console.error('Unknown instruction: ' + opcode + ' [' + OpcodesReverse[opcode] + ']');
            }
            if (debug) console.log('stack after: ', stack);
            if (debug) console.log('locals after: ', locals);
            if (debug) console.log('');
        }
        return [ true, null ];
    }
}

const loadClass = async (classToLoad) => {
    const response = await fetch('java.' + java_version + '/' + classToLoad + '.class');
    if (response.status !== 200)
        return false;
    const data = await response.blob();
    const buffer = await data.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    return await parseClassFile(bytes);
}

const findClass = async (clazzName) => {
    let clz = classes[clazzName];
    if (!clz)
    {
        if (debug) console.log('Loading rt class file: ' + ('java/' + java_version + '/' + clazzName + '.class'));
        const loaded = await loadClass(clazzName);
        if (!loaded)
        {
            console.error("Couldn't load class file: '" + clazzName + "'");
            return false;
        }
        clz = classes[clazzName];
        if (debug) console.info("Loaded class " + clazzName + ": ", clz);
    }
    return clz;
}

const findField = async (clz, name, desc) => {
    let field;
    if (debug) console.log('findField:', clz.className);
    const customRet = getRet(clz.className) || false;
    if (!customRet)
        field = field || clz.fields[name + ' ' + desc] || undefined;
    else
    {
        field = customRet(name + ' ' + desc) || (field = field || clz.fields[name + ' ' + desc] || false);
        if (debug) console.log('field : ' + clz.className, name, + desc, 'ret: ' + field);
    }
    if (!field)
        for (const [_, itz] of Object.entries(clz.interfaces))
        {
            field = await findField(itz, name, desc);
            console.log('itz field: ', itz, field, name, desc);
            if (field !== undefined)
                break;
        }
    if (!field)
        if (clz.superClass)
        {
            field = await findField(clz.superClass, name, desc);
            console.log('itz field: ', clz.superClass, field, name, desc);
        }
    return field;
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
const getRet = name => customRets[name];
const requireClz = clz => {
    if (!clz) throw new Error("'clz' cannot be null here!");
}
const initRets = async () =>
{
    const mappings = {
        'java/lang/Class': 'java_lang_Class.js',
        'java/lang/System': 'java_lang_System.js',
        'java/lang/String': 'java_lang_String.js',
        'java/io/PrintStream': 'java_io_PrintStream.js',
    };
    for (const [clazzName, jsFile] of Object.entries(mappings))
    {
        const loaded = await loadClass(clazzName);
        if (!loaded) throw new Error("Failed loading rt class '" + clazzName + "'.");
        await loadScript('js/natives.' + java_version + '/' + jsFile);
    }
}

// const test = new JvmClass();
//
// test.load('test', {
//     0: test, // this
//     1: 64,
//     2: " Hello world ",
//     3: ":D"
// }, [
//     {[Opcodes.IINC]    : [ 1, 5 ]},
//     {[Opcodes.ILOAD]   : [ 1 ]}, // 69
//     {[Opcodes.ALOAD]   : [ 2 ]},
//     {[Opcodes.ALOAD]   : [ 3 ]},
//     {'append'          : [ 3 ]}, // count
//     {[Opcodes.ARETURN] : [   ]}
// ]);
// const ret = test.execute('test');
// console.log(ret); // prints 'Hello World :D'
//
// test.load('add', {
//     0: 50,
//     1: 45
// }, [
//     {[Opcodes.ILOAD]   : [ 0 ]},
//     {[Opcodes.ILOAD]   : [ 1 ]},
//     {[Opcodes.IADD]    : [   ]},
//     {[Opcodes.IRETURN] : [   ]}
// ]);
// const ret2 = test.execute('add');
// console.log(ret2); // prints '95'
//
// test.load('shift', {
//     0: 5,
//     1: 22
// }, [
//     {[Opcodes.ILOAD]   : [ 0 ]},
//     {[Opcodes.ILOAD]   : [ 1 ]},
//     {[Opcodes.ISHL]    : [   ]},
//     {[Opcodes.IRETURN] : [   ]}
// ]);
// const ret3 = test.execute('shift');
// console.log(ret3); // prints '20971520'
//
// test.load('shift2', {
//     0: 22,
//     1: 5
// }, [
//     {[Opcodes.ILOAD]   : [ 0 ]},
//     {[Opcodes.ILOAD]   : [ 1 ]},
//     {[Opcodes.ISHL]    : [   ]},
//     {[Opcodes.IRETURN] : [   ]}
// ]);
// const ret4 = test.execute('shift2');
// console.log(ret4); // prints '704'

function cleanStringify(object) {
    if (object && typeof object === 'object')
        object = copyWithoutCircularReferences([object], object);
    return JSON.stringify(object);

    function copyWithoutCircularReferences(references, object) {
        const cleanObject = {};
        Object.keys(object).forEach(function(key) {
            const value = object[key];
            if (value && typeof value === 'object') {
                if (references.indexOf(value) < 0) {
                    references.push(value);
                    if (value instanceof JvmClass)
                        cleanObject[key] = '<JvmClass>';
                    else
                        cleanObject[key] = copyWithoutCircularReferences(references, value);
                    references.pop();
                }
                else
                    cleanObject[key] = '###_Circular_###';
            } else if (typeof value !== 'function') {
                cleanObject[key] = value;
            }
        });
        return cleanObject;
    }
}
