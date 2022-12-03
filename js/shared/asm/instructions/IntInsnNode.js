class IntInsnNode extends INode {

    constructor(opcode, ...input) {
        super(opcode, input);
    }

    execute(locals, stack, refs) {
        super.execute();
        console.log('executing IntInsnNode.\n\t\tOpcode: ' + OpcodesReverse[this.opcode] + '.\n\t\t' +
            'Input:`', this.input, '`.\n\t\tLocals:`', locals, '`.\n\t\tStack:`', stack, '`');
        const operand = this.nextInt();
        if (this.opcode === Opcodes.BIPUSH) {
            stack.push(JvmByte.of(operand));
        } else if (this.opcode === Opcodes.SIPUSH) {
            stack.push(JvmShort.of(operand));
        } else if (this.opcode === Opcodes.NEWARRAY) {
            const count = stack.pop();
            assertAsmType(1, count, 'I');
            let arrayType;
            switch (operand) {
                case 4: arrayType = 'Z'; break;
                case 5: arrayType = 'C'; break;
                case 6: arrayType = 'F'; break;
                case 7: arrayType = 'D'; break;
                case 8: arrayType = 'B'; break;
                case 9: arrayType = 'S'; break;
                case 10: arrayType = 'I'; break;
                case 11: arrayType = 'J'; break;
                default:
                    throw new JvmError(`Invalid NEWARRAY type: ${operand}`, 'java/lang/RuntimeException');
            }
            stack.push(new JvmArray([...Array(count)].fill(null), arrayType));
        }
    }

}