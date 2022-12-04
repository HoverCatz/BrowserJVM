class InsnNode extends INode {

    constructor(opcode) {
        super(opcode, []);
    }

    execute(locals, stack, refs) {
        super.execute();
        console.log('executing InsnNode.\n\t\tOpcode: ' + OpcodesReverse[this.opcode] + '.\n\t\t' +
            'Input:`', this.input, '`.\n\t\tLocals:`', locals, '`.\n\t\tStack:`', stack, '`');
        switch (this.opcode) {

            case Opcodes.NOP:
                break; // Do nothing!
            case Opcodes.ACONST_NULL:
                stack.push(null);
                break;

            case Opcodes.ICONST_M1:
                stack.push(JvmInteger.of(-0));
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

            case Opcodes.BALOAD: {
                const index = stack.pop();
                const array = stack.pop();
                assertJvmType(1, array, 'JvmArray');
                const object = array.getItem(index);
                assertJvmType(1, object, 'B');
                stack.push(object);
            } break;
            case Opcodes.CALOAD: {
                const index = stack.pop();
                const array = stack.pop();
                assertJvmType(1, array, 'JvmArray');
                const object = array.getItem(index);
                assertJvmType(1, object, 'C');
                stack.push(object);
            } break;
            case Opcodes.SALOAD: {
                const index = stack.pop();
                const array = stack.pop();
                assertJvmType(1, array, 'JvmArray');
                const object = array.getItem(index);
                assertJvmType(1, object, 'S');
                stack.push(object);
            } break;
            case Opcodes.IALOAD: {
                const index = stack.pop();
                const array = stack.pop();
                assertJvmType(1, array, 'JvmArray');
                const object = array.getItem(index);
                assertJvmType(1, object, 'I');
                stack.push(object);
            } break;
            case Opcodes.LALOAD: {
                const index = stack.pop();
                const array = stack.pop();
                assertJvmType(1, array, 'JvmArray');
                const object = array.getItem(index);
                assertJvmType(1, object, 'J');
                stack.push(object);
            } break;
            case Opcodes.FALOAD: {
                const index = stack.pop();
                const array = stack.pop();
                assertJvmType(1, array, 'JvmArray');
                const object = array.getItem(index);
                assertJvmType(1, object, 'F');
                stack.push(object);
            } break;
            case Opcodes.DALOAD: {
                const index = stack.pop();
                const array = stack.pop();
                assertJvmType(1, array, 'JvmArray');
                const object = array.getItem(index);
                assertJvmType(1, object, 'D');
                stack.push(object);
            } break;
            case Opcodes.AALOAD: {
                const index = stack.pop();
                const array = stack.pop();
                assertJvmType(1, array, 'JvmArray');
                stack.push(array.getItem(index));
            } break;

            case Opcodes.BASTORE: {
                const value = stack.pop();
                assertJvmType(1, value, 'B');
                const index = stack.pop();
                const array = stack.pop();
                assertJvmType(1, array, 'JvmArray');
                array.setItem(index, value);
            } break;
            case Opcodes.CASTORE: {
                const value = stack.pop();
                assertJvmType(1, value, 'C');
                const index = stack.pop();
                const array = stack.pop();
                assertJvmType(1, array, 'JvmArray');
                array.setItem(index, value);
            } break;
            case Opcodes.IASTORE: {
                const value = stack.pop();
                assertJvmType(1, value, 'I');
                const index = stack.pop();
                const array = stack.pop();
                assertJvmType(1, array, 'JvmArray');
                array.setItem(index, value);
            } break;
            case Opcodes.LASTORE: {
                const value = stack.pop();
                assertJvmType(1, value, 'L');
                const index = stack.pop();
                const array = stack.pop();
                assertJvmType(1, array, 'JvmArray');
                array.setItem(index, value);
            } break;
            case Opcodes.FASTORE: {
                const value = stack.pop();
                assertJvmType(1, value, 'F');
                const index = stack.pop();
                const array = stack.pop();
                assertJvmType(1, array, 'JvmArray');
                array.setItem(index, value);
            } break;
            case Opcodes.DASTORE: {
                const value = stack.pop();
                assertJvmType(1, value, 'D');
                const index = stack.pop();
                const array = stack.pop();
                assertJvmType(1, array, 'JvmArray');
                array.setItem(index, value);
            } break;
            case Opcodes.AASTORE: {
                const value = stack.pop();
                const index = stack.pop();
                const array = stack.pop();
                assertJvmType(1, array, 'JvmArray');
                array.setItem(index, value);
            } break;

            case Opcodes.POP:
                stack.pop();
                break;
            case Opcodes.POP2:
                const obj = stack.pop();
                if (!isWide(obj))
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
                if (isWide(obj2)) {
                    stack.push(obj);
                    stack.push(obj2);
                    stack.push(obj);
                } else {
                    const obj3 = stack.pop();
                    stack.push(obj);
                    stack.push(obj3);
                    stack.push(obj2);
                    stack.push(obj);
                }
            } break;
            case Opcodes.DUP2: {
                const obj = stack.pop();
                if (isWide(obj)) {
                    stack.push(obj);
                    stack.push(obj);
                } else {
                    const obj2 = stack.pop();
                    stack.push(obj2);
                    stack.push(obj);
                    stack.push(obj2);
                    stack.push(obj);
                }
            } break;
            case Opcodes.DUP2_X1: {
                const obj = stack.pop();
                const obj2 = stack.pop();
                if (isWide(obj2)) {
                    stack.push(obj);
                    stack.push(obj2);
                    stack.push(obj);
                } else {
                    const obj3 = stack.pop();
                    stack.push(obj2);
                    stack.push(obj);
                    stack.push(obj3);
                    stack.push(obj2);
                    stack.push(obj);
                }
            } break;
            case Opcodes.DUP2_X2: {
                const obj = stack.pop();
                const obj2 = stack.pop();
                if (isWide(obj)) {
                    if (isWide(obj2)) {
                        stack.push(obj);
                        stack.push(obj2);
                        stack.push(obj);
                    } else {
                        const obj3 = stack.pop();
                        stack.push(obj);
                        stack.push(obj3);
                        stack.push(obj2);
                        stack.push(obj);
                    }
                } else {
                    const obj3 = stack.pop();
                    if (isWide(obj3)) {
                        stack.push(obj2);
                        stack.push(obj);
                        stack.push(obj3);
                        stack.push(obj2);
                        stack.push(obj);
                    } else {
                        const obj4 = stack.pop();
                        stack.push(obj2);
                        stack.push(obj);
                        stack.push(obj4);
                        stack.push(obj3);
                        stack.push(obj2);
                        stack.push(obj);
                    }
                }
            } break;

            case Opcodes.SWAP: {
                const obj = stack.pop();
                const obj2 = stack.pop();
                stack.push(obj);
                stack.push(obj2);
            } break;

            case Opcodes.IADD: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'I');
                const val = stack.pop();
                assertJvmType(1, val, 'I');
                stack.push(val.addWithOther(val2));
            } break;
            case Opcodes.LADD: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'J');
                const val = stack.pop();
                assertJvmType(1, val, 'J');
                stack.push(val.addWithOther(val2));
            } break;
            case Opcodes.FADD: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'F');
                const val = stack.pop();
                assertJvmType(1, val, 'F');
                stack.push(val.addWithOther(val2));
            } break;
            case Opcodes.DADD: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'D');
                const val = stack.pop();
                assertJvmType(1, val, 'D');
                stack.push(val.addWithOther(val2));
            } break;

            case Opcodes.ISUB: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'I');
                const val = stack.pop();
                assertJvmType(1, val, 'I');
                stack.push(val.subWithOther(val2));
            } break;
            case Opcodes.LSUB: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'J');
                const val = stack.pop();
                assertJvmType(1, val, 'J');
                stack.push(val.subWithOther(val2));
            } break;
            case Opcodes.FSUB: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'F');
                const val = stack.pop();
                assertJvmType(1, val, 'F');
                stack.push(val.subWithOther(val2));
            } break;
            case Opcodes.DSUB: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'D');
                const val = stack.pop();
                assertJvmType(1, val, 'D');
                stack.push(val.subWithOther(val2));
            } break;

            case Opcodes.IMUL: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'I');
                const val = stack.pop();
                assertJvmType(1, val, 'I');
                stack.push(val.mulWithOther(val2));
            } break;
            case Opcodes.LMUL: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'J');
                const val = stack.pop();
                assertJvmType(1, val, 'J');
                stack.push(val.mulWithOther(val2));
            } break;
            case Opcodes.FMUL: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'F');
                const val = stack.pop();
                assertJvmType(1, val, 'F');
                stack.push(val.mulWithOther(val2));
            } break;
            case Opcodes.DMUL: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'D');
                const val = stack.pop();
                assertJvmType(1, val, 'D');
                stack.push(val.mulWithOther(val2));
            } break;

            case Opcodes.IDIV: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'I');
                if (val2.get() === 0)
                    // TODO: Actually create a new instance of this error
                    throw new JvmError('/ by zero', 'java/lang/ArithmeticException');
                const val = stack.pop();
                assertJvmType(1, val, 'I');
                stack.push(val.divWithOther(val2));
            } break;
            case Opcodes.LDIV: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'J');
                if (val2.get() === 0n)
                    // TODO: Actually create a new instance of this error
                    throw new JvmError('/ by zero', 'java/lang/ArithmeticException');
                const val = stack.pop();
                assertJvmType(1, val, 'J');
                stack.push(val.divWithOther(val2));
            } break;
            case Opcodes.FDIV: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'F');
                const val = stack.pop();
                assertJvmType(1, val, 'F');
                stack.push(val.divWithOther(val2));
            } break;
            case Opcodes.DDIV: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'D');
                const val = stack.pop();
                assertJvmType(1, val, 'D');
                stack.push(val.divWithOther(val2));
            } break;

            case Opcodes.IREM: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'I');
                if (val2.get() === 0)
                    // TODO: Actually create a new instance of this error
                    throw new JvmError('/ by zero', 'java/lang/ArithmeticException');
                const val = stack.pop();
                assertJvmType(1, val, 'I');
                stack.push(val.remWithOther(val2));
            } break;
            case Opcodes.LREM: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'J');
                if (val2.get() === 0)
                    // TODO: Actually create a new instance of this error
                    throw new JvmError('/ by zero', 'java/lang/ArithmeticException');
                const val = stack.pop();
                assertJvmType(1, val, 'J');
                stack.push(val.remWithOther(val2));
            } break;
            case Opcodes.FREM: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'F');
                const val = stack.pop();
                assertJvmType(1, val, 'F');
                stack.push(val.remWithOther(val2));
            } break;
            case Opcodes.DREM: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'D');
                const val = stack.pop();
                assertJvmType(1, val, 'D');
                stack.push(val.remWithOther(val2));
            } break;

            case Opcodes.INEG: {
                const val = stack.pop();
                assertJvmType(1, val, 'I');
                stack.push(val.neg());
            } break;
            case Opcodes.LNEG: {
                const val = stack.pop();
                assertJvmType(1, val, 'J');
                stack.push(val.neg());
            } break;
            case Opcodes.FNEG: {
                const val = stack.pop();
                assertJvmType(1, val, 'F');
                stack.push(val.neg());
            } break;
            case Opcodes.DNEG: {
                const val = stack.pop();
                assertJvmType(1, val, 'D');
                stack.push(val.neg());
            } break;

            case Opcodes.ISHL: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'I');
                const val = stack.pop();
                assertJvmType(1, val, 'I');
                stack.push(val.shlWithOther(val2));
            } break;
            case Opcodes.LSHL: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'J');
                const val = stack.pop();
                assertJvmType(1, val, 'J');
                stack.push(val.shlWithOther(val2));
            } break;

            case Opcodes.ISHR: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'I');
                const val = stack.pop();
                assertJvmType(1, val, 'I');
                stack.push(val.shrWithOther(val2));
            } break;
            case Opcodes.LSHR: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'J');
                const val = stack.pop();
                assertJvmType(1, val, 'J');
                stack.push(val.shrWithOther(val2));
            } break;

            case Opcodes.IUSHR: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'I');
                const val = stack.pop();
                assertJvmType(1, val, 'I');
                stack.push(val.ushrWithOther(val2));
            } break;
            case Opcodes.LUSHR: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'J');
                const val = stack.pop();
                assertJvmType(1, val, 'J');
                stack.push(val.ushrWithOther(val2));
            } break;

            case Opcodes.IAND: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'I');
                const val = stack.pop();
                assertJvmType(1, val, 'I');
                stack.push(val.andWithOther(val2));
            } break;
            case Opcodes.LAND: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'J');
                const val = stack.pop();
                assertJvmType(1, val, 'J');
                stack.push(val.andWithOther(val2));
            } break;

            case Opcodes.IOR: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'I');
                const val = stack.pop();
                assertJvmType(1, val, 'I');
                stack.push(val.orWithOther(val2));
            } break;
            case Opcodes.LOR: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'J');
                const val = stack.pop();
                assertJvmType(1, val, 'J');
                stack.push(val.orWithOther(val2));
            } break;

            case Opcodes.IXOR: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'I');
                const val = stack.pop();
                assertJvmType(1, val, 'I');
                stack.push(val.xorWithOther(val2));
            } break;
            case Opcodes.LXOR: {
                const val2 = stack.pop();
                assertJvmType(2, val2, 'J');
                const val = stack.pop();
                assertJvmType(1, val, 'J');
                stack.push(val.xorWithOther(val2));
            } break;

            case Opcodes.I2L: {
                let value = stack.pop();
                assertJvmType(1, value, 'I');
                value = castObjectTo(value, 'J');
                assertJvmType(2, value, 'J');
                stack.push(value);
            } break;
            case Opcodes.I2F: {
                let value = stack.pop();
                assertJvmType(1, value, 'I');
                value = castObjectTo(value, 'F');
                assertJvmType(2, value, 'F');
                stack.push(value);
            } break;
            case Opcodes.I2D: {
                let value = stack.pop();
                assertJvmType(1, value, 'I');
                value = castObjectTo(value, 'D');
                assertJvmType(2, value, 'D');
                stack.push(value);
            } break;

            case Opcodes.L2I: {
                let value = stack.pop();
                assertJvmType(1, value, 'J');
                value = castObjectTo(value, 'I');
                assertJvmType(2, value, 'I');
                stack.push(value);
            } break;
            case Opcodes.L2F: {
                let value = stack.pop();
                assertJvmType(1, value, 'J');
                value = castObjectTo(value, 'F');
                assertJvmType(2, value, 'F');
                stack.push(value);
            } break;
            case Opcodes.L2D: {
                let value = stack.pop();
                assertJvmType(1, value, 'J');
                value = castObjectTo(value, 'D');
                assertJvmType(2, value, 'D');
                stack.push(value);
            } break;

            case Opcodes.F2I: {
                let value = stack.pop();
                assertJvmType(1, value, 'F');
                value = castObjectTo(value, 'I');
                assertJvmType(2, value, 'I');
                stack.push(value);
            } break;
            case Opcodes.F2L: {
                let value = stack.pop();
                assertJvmType(1, value, 'F');
                value = castObjectTo(value, 'J');
                assertJvmType(2, value, 'J');
                stack.push(value);
            } break;
            case Opcodes.F2D: {
                let value = stack.pop();
                assertJvmType(1, value, 'F');
                value = castObjectTo(value, 'D');
                assertJvmType(2, value, 'D');
                stack.push(value);
            } break;

            case Opcodes.D2I: {
                let value = stack.pop();
                assertJvmType(1, value, 'D');
                value = castObjectTo(value, 'I');
                assertJvmType(2, value, 'I');
                stack.push(value);
            } break;
            case Opcodes.D2L: {
                let value = stack.pop();
                assertJvmType(1, value, 'D');
                value = castObjectTo(value, 'J');
                assertJvmType(2, value, 'J');
                stack.push(value);
            } break;
            case Opcodes.D2F: {
                let value = stack.pop();
                assertJvmType(1, value, 'D');
                value = castObjectTo(value, 'F');
                assertJvmType(2, value, 'F');
                stack.push(value);
            } break;

            case Opcodes.I2B: {
                let value = stack.pop();
                assertJvmType(1, value, 'I');
                value = castObjectTo(value, 'B');
                assertJvmType(2, value, 'B');
                stack.push(value);
            } break;
            case Opcodes.I2C: {
                let value = stack.pop();
                assertJvmType(1, value, 'I');
                value = castObjectTo(value, 'C');
                assertJvmType(2, value, 'C');
                stack.push(value);
            } break;
            case Opcodes.I2S: {
                let value = stack.pop();
                assertJvmType(1, value, 'I');
                value = castObjectTo(value, 'S');
                assertJvmType(2, value, 'S');
                stack.push(value);
            } break;

            case Opcodes.LCMP: {
                const value2 = stack.pop();
                assertJvmType(2, value2, 'J');
                const value = stack.pop();
                assertJvmType(1, value, 'J');
                stack.push(JvmInteger.of(compareNumbers(value, value2)));
            } break;
            case Opcodes.FCMPG: {
                const value2 = stack.pop();
                assertJvmType(2, value2, 'F');
                const value = stack.pop();
                assertJvmType(1, value, 'F');
                if (isNaN(value.getValue()) || isNaN(value2.getValue()))
                    stack.push(1);
                else
                    stack.push(JvmInteger.of(compareFloats(value, value2)));
            } break;
            case Opcodes.FCMPL: {
                const value2 = stack.pop();
                assertJvmType(2, value2, 'F');
                const value = stack.pop();
                assertJvmType(1, value, 'F');
                if (isNaN(value.getValue()) || isNaN(value2.getValue()))
                    stack.push(-1);
                else
                    stack.push(JvmInteger.of(compareFloats(value, value2)));
            } break;
            case Opcodes.DCMPG: {
                const value2 = stack.pop();
                assertJvmType(2, value2, 'D');
                const value = stack.pop();
                assertJvmType(1, value, 'D');
                if (isNaN(value.getValue()) || isNaN(value2.getValue()))
                    stack.push(1);
                else
                    stack.push(JvmInteger.of(compareDoubles(value, value2)));
            } break;
            case Opcodes.DCMPL: {
                const value2 = stack.pop();
                assertJvmType(2, value2, 'D');
                const value = stack.pop();
                assertJvmType(1, value, 'D');
                if (isNaN(value.getValue()) || isNaN(value2.getValue()))
                    stack.push(-1);
                else
                    stack.push(JvmInteger.of(compareDoubles(value, value2)));
            } break;

            case Opcodes.IRETURN: {
                let val = stack.pop();
                console.log('val:',val)
                if (val instanceof JvmByte ||
                    val instanceof JvmChar ||
                    val instanceof JvmShort ||
                    val instanceof JvmInteger ||
                    typeof val === 'boolean' ||
                    compareTypes(val, 'Z') ||
                    compareTypes(val, 'I')) {
                    this.returnObject(val);
                } else {
                    throw new Error(`Wrong IRETURN type: ${getJvmTypeString(val)}, asmType 'B', 'C', 'S', 'I', or 'Z', required.`);
                }
            } break;
            case Opcodes.LRETURN: {
                let val = stack.pop();
                if (!(val instanceof JvmLong))
                    throw new Error(`Wrong LRETURN type: ${getJvmTypeString(val)}, asmType 'J' required.`);
                this.returnObject(val);
            } break;
            case Opcodes.FRETURN: {
                let val = stack.pop();
                if (!(val instanceof JvmFloat))
                    throw new Error(`Wrong FRETURN type: ${getJvmTypeString(val)}, asmType 'F' required.`);
                this.returnObject(val);
            } break;
            case Opcodes.DRETURN: {
                let val = stack.pop();
                if (!(val instanceof JvmDouble))
                    throw new Error(`Wrong DRETURN type: ${getJvmTypeString(val)}, asmType 'D' required.`);
                this.returnObject(val);
            } break;
            case Opcodes.ARETURN: {
                this.returnObject(stack.pop());
            } break;
            case Opcodes.RETURN: {
                refs.pc = -1; // Jump to `-1` which means normal RETURN without a value.
            } break;

            case Opcodes.ARRAYLENGTH: {
                const array = stack.pop();
                assertJvmType(1, array, 'JvmArray');
                stack.push(array.size());
            } break;

            case Opcodes.ATHROW: {
                const ex = stack.pop();
                assertJvmType(1, ex, 'JvmError');
                throw ex;
            } break;

            // TODO: Implement enter+exit
            case Opcodes.MONITORENTER: {
                throw new Error('Not implemented yet.');
            } break;
            case Opcodes.MONITOREXIT: {
                throw new Error('Not implemented yet.');
            } break;

            default:
                throw new JvmError('Opcode ' + this.opcode + ' (' + OpcodesReverse[this.opcode] + ') not implemented yet.');
        }
    }

}