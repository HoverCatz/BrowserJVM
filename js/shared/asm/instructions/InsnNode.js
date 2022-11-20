class InsnNode extends INode {

    constructor(opcode, input = []) {
        super(opcode, input);
    }

    execute(locals, stack) {
        super.execute();
        console.log('executing InsnNode. Opcode=' + this.opcode + '. Input:`', this.input, '`. Locals:`', locals, '`. Stack:`', stack, '`');
        switch (this.opcode) {
            case Opcodes.ICONST_0: stack.push(0); break;
            case Opcodes.ICONST_1: stack.push(1); break;
            case Opcodes.ICONST_2: stack.push(2); break;
            case Opcodes.ICONST_3: stack.push(3); break;
            case Opcodes.ICONST_4: stack.push(4); break;
            case Opcodes.ICONST_5: stack.push(5); break;
            case Opcodes.IADD: {
                const val2 = stack.pop();
                const val = stack.pop();
                stack.push(val + val2);
            } break;
            case Opcodes.IRETURN: this.returnObject(stack.pop()); break;
        }
    }

}