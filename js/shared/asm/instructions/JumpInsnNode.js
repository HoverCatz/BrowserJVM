class JumpInsnNode extends INode {

    constructor(opcode, ...input) {
        super(opcode, input);
    }

    execute(locals, stack, refs) {
        super.execute();
        console.log('executing JumpInsnNode.\n\t\tOpcode: ' + OpcodesReverse[this.opcode] + '.\n\t\t' +
            'Input:`', this.input, '`.\n\t\tLocals:`', locals, '`.\n\t\tStack:`', stack, '`');
        const jumpTo = this.nextInt();
        switch (this.opcode) {
            
            case Opcodes.Opcodes.GOTO:
                refs.pc = jumpTo;
            return;

            case Opcodes.IF_ICMPEQ: {
                let value2 = stack.pop();
                assertAsmType(2, value2, 'I');
                let value = stack.pop();
                assertAsmType(1, value, 'I');
                if (value.get() === value2.get())
                    refs.pc = jumpTo;
            } return;
            case Opcodes.IF_ICMPNE: {
                let value2 = stack.pop();
                assertAsmType(2, value2, 'I');
                let value = stack.pop();
                assertAsmType(1, value, 'I');
                if (value.get() !== value2.get())
                    refs.pc = jumpTo;
            } return;
            case Opcodes.IF_ICMPGT: {
                let value2 = stack.pop();
                assertAsmType(2, value2, 'I');
                let value = stack.pop();
                assertAsmType(1, value, 'I');
                if (value.get() > value2.get())
                    refs.pc = jumpTo;
            } return;
            case Opcodes.IF_ICMPLT: {
                let value2 = stack.pop();
                assertAsmType(2, value2, 'I');
                let value = stack.pop();
                assertAsmType(1, value, 'I');
                if (value.get() < value2.get())
                    refs.pc = jumpTo;
            } return;
            case Opcodes.IF_ICMPGE: {
                let value2 = stack.pop();
                assertAsmType(2, value2, 'I');
                let value = stack.pop();
                assertAsmType(1, value, 'I');
                if (value.get() >= value2.get())
                    refs.pc = jumpTo;
            } return;
            case Opcodes.IF_ICMPLE: {
                let value2 = stack.pop();
                assertAsmType(2, value2, 'I');
                let value = stack.pop();
                assertAsmType(1, value, 'I');
                if (value.get() <= value2.get())
                    refs.pc = jumpTo;
            } return;

            case Opcodes.IF_ACMPEQ: {
                if (stack.pop() === stack.pop())
                    refs.pc = jumpTo;
            } return;
            case Opcodes.IF_ACMPNE: {
                if (stack.pop() !== stack.pop())
                    refs.pc = jumpTo;
            } return;

            case Opcodes.IFEQ: {
                const value = stack.pop();
                assertAsmType(1, value, 'I');
                if (value.get() === 0)
                    refs.pc = jumpTo;
            } return;
            case Opcodes.IFNE: {
                const value = stack.pop();
                assertAsmType(1, value, 'I');
                if (value.get() !== 0)
                    refs.pc = jumpTo;
            } return;
            case Opcodes.IFGT: {
                const value = stack.pop();
                assertAsmType(1, value, 'I');
                if (value.get() > 0)
                    refs.pc = jumpTo;
            } return;
            case Opcodes.IFLT: {
                const value = stack.pop();
                assertAsmType(1, value, 'I');
                if (value.get() < 0)
                    refs.pc = jumpTo;
            } return;
            case Opcodes.IFGE: {
                const value = stack.pop();
                assertAsmType(1, value, 'I');
                if (value.get() >= 0)
                    refs.pc = jumpTo;
            } return;
            case Opcodes.IFLE: {
                const value = stack.pop();
                assertAsmType(1, value, 'I');
                if (value.get() <= 0)
                    refs.pc = jumpTo;
            } return;
            
            case Opcodes.Opcodes.IFNONNULL: {
                const obj = stack.pop();
                if (obj !== null)
                    refs.pc = jumpTo;
            } return;
            case Opcodes.Opcodes.IFNULL: {
                const obj = stack.pop();
                if (obj === null)
                    refs.pc = jumpTo;
            } return;

            default:
                throw new JvmError('IllegalStateException');
        }
    }

}