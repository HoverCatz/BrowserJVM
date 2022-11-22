class InsnNode extends INode {

    constructor(opcode, input = []) {
        super(opcode, input);
    }

    execute(locals, stack) {
        super.execute();
        console.log('executing InsnNode. Opcode=' + this.opcode + '. Input:`', this.input, '`. Locals:`', locals, '`. Stack:`', stack, '`');
        switch (this.opcode) {

            case Opcodes.NOP:
                break; // Do nothing!
            case Opcodes.ACONST_NULL:
                stack.push(null);
                break;

            case Opcodes.ICONST_0:
                stack.push(0);
                break;
            case Opcodes.ICONST_1:
                stack.push(1);
                break;
            case Opcodes.ICONST_2:
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

            case Opcodes.LCONST_0:
                stack.push(0);
                break;
            case Opcodes.LCONST_1:
                stack.push(1);
                break;

            case Opcodes.FCONST_0:
                stack.push(0);
                break;
            case Opcodes.FCONST_1:
                stack.push(1);
                break;
            case Opcodes.FCONST_2:
                stack.push(2);
                break;

            case Opcodes.DCONST_0:
                stack.push(0);
                break;
            case Opcodes.DCONST_1:
                stack.push(1);
                break;

            case Opcodes.POP:
                stack.pop();
                break;
            case Opcodes.POP2:
                stack.pop();
                if (stack.length > 0) // Fix for double/long
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

            case Opcodes.IADD:
            case Opcodes.LADD:
            case Opcodes.FADD:
            case Opcodes.DADD: {
                const val2 = stack.pop();
                const val = stack.pop();
                stack.push(val + val2);
            } break;

            case Opcodes.ISUB:
            case Opcodes.LSUB:
            case Opcodes.FSUB:
            case Opcodes.DSUB: {
                const val2 = stack.pop();
                const val = stack.pop();
                stack.push(val - val2);
            } break;

            case Opcodes.IMUL:
            case Opcodes.LMUL:
            case Opcodes.FMUL:
            case Opcodes.DMUL: {
                const val2 = stack.pop();
                const val = stack.pop();
                stack.push(val * val2);
            } break;

            case Opcodes.IDIV:
            case Opcodes.LDIV:
            case Opcodes.FDIV:
            case Opcodes.DDIV: {
                const val2 = stack.pop();
                const val = stack.pop();
                stack.push(val / val2);
            } break;

            case Opcodes.IREM:
            case Opcodes.LREM:
            case Opcodes.FREM:
            case Opcodes.DREM: {
                const val2 = stack.pop();
                const val = stack.pop();
                stack.push(val % val2);
            } break;

            case Opcodes.INEG:
            case Opcodes.LNEG:
            case Opcodes.FNEG:
            case Opcodes.DNEG: {
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

            case Opcodes.IRETURN: this.returnObject(stack.pop()); break;
        }
    }

}