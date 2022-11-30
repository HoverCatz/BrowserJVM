class InsnNode extends INode {

    constructor(opcode, input = []) {
        super(opcode, input);
    }

    execute(locals, stack, output) {
        super.execute();
        console.log('executing InsnNode.\n\t\tOpcode: ' + OpcodesReverse[this.opcode] + '.\n\t\t' +
            'Input:`', this.input, '`.\n\t\tLocals:`', locals, '`.\n\t\tStack:`', stack, '`');
        switch (this.opcode) {

            case Opcodes.NOP:
                break; // Do nothing!
            case Opcodes.ACONST_NULL:
                stack.push(JvmNull.get());
                break;

            case Opcodes.ICONST_0:
                stack.push(JvmInteger.of(0));
                break;
            case Opcodes.ICONST_1:
                stack.push(JvmInteger.of(1));
                break;
            case Opcodes.ICONST_2:
                stack.push(JvmInteger.of(2));
                break;
            case Opcodes.ICONST_3:
                stack.push(JvmInteger.of(3));
                break;
            case Opcodes.ICONST_4:
                stack.push(JvmInteger.of(4));
                break;
            case Opcodes.ICONST_5:
                stack.push(JvmInteger.of(5));
                break;

            case Opcodes.LCONST_0:
                stack.push(JvmLong.of(0));
                break;
            case Opcodes.LCONST_1:
                stack.push(JvmLong.of(1));
                break;

            case Opcodes.FCONST_0:
                stack.push(JvmFloat.of(0));
                break;
            case Opcodes.FCONST_1:
                stack.push(JvmFloat.of(1));
                break;
            case Opcodes.FCONST_2:
                stack.push(JvmFloat.of(2));
                break;

            case Opcodes.DCONST_0:
                stack.push(JvmDouble.of(0));
                break;
            case Opcodes.DCONST_1:
                stack.push(JvmDouble.of(1));
                break;

            case Opcodes.POP:
                stack.pop();
                break;
            case Opcodes.POP2:
                stack.pop();
                if (stack.length > 0) // Just in case!
                    stack.pop();
                break;

            case Opcodes.DUP: {
                const obj = stack.pop();
                stack.push(obj);
                stack.push(obj);
            } break;
            case Opcodes.DUP_X1: {
                const obj = stack.pop();
                const obj2 = stack.pop();
                stack.push(obj);
                stack.push(obj2);
                stack.push(obj);
            } break;
            case Opcodes.DUP_X2: {
                const obj = stack.pop();
                const obj2 = stack.pop();
                const obj3 = stack.pop();
                stack.push(obj);
                stack.push(obj3);
                stack.push(obj2);
                stack.push(obj);
            } break;
            case Opcodes.DUP2: {
                const obj = stack.pop();
                const obj2 = stack.pop();
                stack.push(obj2);
                stack.push(obj);
                stack.push(obj2);
                stack.push(obj);
            } break;
            case Opcodes.DUP2_X1: {
                const obj = stack.pop();
                const obj2 = stack.pop();
                const obj3 = stack.pop();
                stack.push(obj2);
                stack.push(obj);
                stack.push(obj3);
                stack.push(obj2);
                stack.push(obj);
            } break;
            case Opcodes.DUP2_X2: {
                const obj = stack.pop();
                const obj2 = stack.pop();
                const obj3 = stack.pop();
                const obj4 = stack.pop();
                stack.push(obj2);
                stack.push(obj);
                stack.push(obj4);
                stack.push(obj3);
                stack.push(obj2);
                stack.push(obj);
            } break;

            case Opcodes.SWAP: {
                const obj = stack.pop();
                const obj2 = stack.pop();
                stack.push(obj);
                stack.push(obj2);
            } break;

            case Opcodes.IADD: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'I');
                const val = stack.pop();
                assertAsmType(1, val, 'I');
                stack.push(val.addWithOther(val2));
            } break;
            case Opcodes.LADD: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'J');
                const val = stack.pop();
                assertAsmType(1, val, 'J');
                stack.push(val.addWithOther(val2));
            } break;
            case Opcodes.FADD: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'F');
                const val = stack.pop();
                assertAsmType(1, val, 'F');
                stack.push(val.addWithOther(val2));
            } break;
            case Opcodes.DADD: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'D');
                const val = stack.pop();
                assertAsmType(1, val, 'D');
                stack.push(val.addWithOther(val2));
            } break;

            case Opcodes.ISUB: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'I');
                const val = stack.pop();
                assertAsmType(1, val, 'I');
                stack.push(val.subWithOther(val2));
            } break;
            case Opcodes.LSUB: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'J');
                const val = stack.pop();
                assertAsmType(1, val, 'J');
                stack.push(val.subWithOther(val2));
            } break;
            case Opcodes.FSUB: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'F');
                const val = stack.pop();
                assertAsmType(1, val, 'F');
                stack.push(val.subWithOther(val2));
            } break;
            case Opcodes.DSUB: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'D');
                const val = stack.pop();
                assertAsmType(1, val, 'D');
                stack.push(val.subWithOther(val2));
            } break;

            case Opcodes.IMUL: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'I');
                const val = stack.pop();
                assertAsmType(1, val, 'I');
                stack.push(val.mulWithOther(val2));
            } break;
            case Opcodes.LMUL: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'J');
                const val = stack.pop();
                assertAsmType(1, val, 'J');
                stack.push(val.mulWithOther(val2));
            } break;
            case Opcodes.FMUL: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'F');
                const val = stack.pop();
                assertAsmType(1, val, 'F');
                stack.push(val.mulWithOther(val2));
            } break;
            case Opcodes.DMUL: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'D');
                const val = stack.pop();
                assertAsmType(1, val, 'D');
                stack.push(val.mulWithOther(val2));
            } break;

            case Opcodes.IDIV: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'I');
                if (val2.get() === 0)
                    // TODO: Actually create a new instance of this error
                    throw new JvmError('/ by zero', 'java/lang/ArithmeticException');
                const val = stack.pop();
                assertAsmType(1, val, 'I');
                stack.push(val.divWithOther(val2));
            } break;
            case Opcodes.LDIV: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'J');
                if (val2.get() === 0n)
                    throw new JvmError('/ by zero', 'java/lang/ArithmeticException');
                const val = stack.pop();
                assertAsmType(1, val, 'J');
                stack.push(val.divWithOther(val2));
            } break;
            case Opcodes.FDIV: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'F');
                const val = stack.pop();
                assertAsmType(1, val, 'F');
                stack.push(val.divWithOther(val2));
            } break;
            case Opcodes.DDIV: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'D');
                const val = stack.pop();
                assertAsmType(1, val, 'D');
                stack.push(val.divWithOther(val2));
            } break;

            case Opcodes.IREM: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'I');
                const val = stack.pop();
                assertAsmType(1, val, 'I');
                stack.push(val.remWithOther(val2));
            } break;
            case Opcodes.LREM: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'J');
                const val = stack.pop();
                assertAsmType(1, val, 'J');
                stack.push(val.remWithOther(val2));
            } break;
            case Opcodes.FREM: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'F');
                const val = stack.pop();
                assertAsmType(1, val, 'F');
                stack.push(val.remWithOther(val2));
            } break;
            case Opcodes.DREM: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'D');
                const val = stack.pop();
                assertAsmType(1, val, 'D');
                stack.push(val.remWithOther(val2));
            } break;

            case Opcodes.INEG: {
                const val = stack.pop();
                assertAsmType(1, val, 'I');
                stack.push(val.neg());
            } break;
            case Opcodes.LNEG: {
                const val = stack.pop();
                assertAsmType(1, val, 'J');
                stack.push(val.neg());
            } break;
            case Opcodes.FNEG: {
                const val = stack.pop();
                assertAsmType(1, val, 'F');
                stack.push(val.neg());
            } break;
            case Opcodes.DNEG: {
                const val = stack.pop();
                assertAsmType(1, val, 'D');
                stack.push(val.neg());
            } break;

            case Opcodes.ISHL: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'I');
                const val = stack.pop();
                assertAsmType(1, val, 'I');
                stack.push(val.shlWithOther(val2));
            } break;
            case Opcodes.LSHL: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'J');
                const val = stack.pop();
                assertAsmType(1, val, 'J');
                stack.push(val.shlWithOther(val2));
            } break;

            case Opcodes.ISHR: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'I');
                const val = stack.pop();
                assertAsmType(1, val, 'I');
                stack.push(val.shrWithOther(val2));
            } break;
            case Opcodes.LSHR: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'J');
                const val = stack.pop();
                assertAsmType(1, val, 'J');
                stack.push(val.shrWithOther(val2));
            } break;

            case Opcodes.IUSHR: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'I');
                const val = stack.pop();
                assertAsmType(1, val, 'I');
                stack.push(val.ushrWithOther(val2));
            } break;
            case Opcodes.LUSHR: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'J');
                const val = stack.pop();
                assertAsmType(1, val, 'J');
                stack.push(val.ushrWithOther(val2));
            } break;

            case Opcodes.IAND: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'I');
                const val = stack.pop();
                assertAsmType(1, val, 'I');
                stack.push(val.andWithOther(val2));
            } break;
            case Opcodes.LAND: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'J');
                const val = stack.pop();
                assertAsmType(1, val, 'J');
                stack.push(val.andWithOther(val2));
            } break;

            case Opcodes.IOR: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'I');
                const val = stack.pop();
                assertAsmType(1, val, 'I');
                stack.push(val.orWithOther(val2));
            } break;
            case Opcodes.LOR: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'J');
                const val = stack.pop();
                assertAsmType(1, val, 'J');
                stack.push(val.orWithOther(val2));
            } break;

            case Opcodes.IXOR: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'I');
                const val = stack.pop();
                assertAsmType(1, val, 'I');
                stack.push(val.xorWithOther(val2));
            } break;
            case Opcodes.LXOR: {
                const val2 = stack.pop();
                assertAsmType(2, val2, 'J');
                const val = stack.pop();
                assertAsmType(1, val, 'J');
                stack.push(val.xorWithOther(val2));
            } break;

            case Opcodes.IRETURN: {
                let val = stack.pop();
                if (val instanceof JvmByte ||
                    val instanceof JvmChar ||
                    val instanceof JvmShort ||
                    val instanceof JvmInteger ||
                    val instanceof Boolean ||
                    compareTypes(val, 'Z')) {
                    this.returnObject(val);
                } else {
                    throw new Error(`Wrong IRETURN type: ${getTypeString(val)}, asmType 'B', 'C', 'S', 'I', or 'Z', required.`);
                }
            } break;
            case Opcodes.LRETURN: {
                let val = stack.pop();
                if (!(val instanceof JvmLong))
                    throw new Error(`Wrong LRETURN type: ${getTypeString(val)}, asmType 'J' required.`);
                this.returnObject(val);
            } break;
            case Opcodes.FRETURN: {
                let val = stack.pop();
                if (!(val instanceof JvmFloat))
                    throw new Error(`Wrong FRETURN type: ${getTypeString(val)}, asmType 'F' required.`);
                this.returnObject(val);
            } break;
            case Opcodes.DRETURN: {
                let val = stack.pop();
                if (!(val instanceof JvmDouble))
                    throw new Error(`Wrong DRETURN type: ${getTypeString(val)}, asmType 'D' required.`);
                this.returnObject(val);
            } break;
            case Opcodes.ARETURN: {
                this.returnObject(stack.pop());
            } break;
            case Opcodes.RETURN: {
                output[0] = -1; // Jump to `-1` which means normal RETURN without a value.
            } break;
        }
    }

}