class VarInsnNode extends INode {

    constructor(opcode, input = []) {
        super(opcode, input);
    }

    execute(locals, stack, refs) {
        super.execute();
        console.log('executing VarInsnNode.\n\t\tOpcode: ' + OpcodesReverse[this.opcode] + '.\n\t\t' +
            'Input:`', this.input, '`.\n\t\tLocals:`', locals, '`.\n\t\tStack:`', stack, '`');

        const data = this.#getData();
        if (locals.length < data.size)
            throw new JvmError('Wrong locals size (locals:' + locals.length + ' < data:' + data.size + ')');

        let value = (data.action === 'L') ?
            locals[data.size - 1] // Load
        :
            stack.pop(); // Store

        assertAsmType(1, value, data.type);

        if (data.action === 'L')
            stack.push(value); // Load
        else
            locals[data.size - 1] = value; // Store
    }

    #getData() {
        const opcode = this.opcode;
        if (!((opcode >= Opcodes.ILOAD_0 && opcode <= Opcodes.FLOAD_3) ||
              (opcode >= Opcodes.ISTORE_0 && opcode <= Opcodes.ASTORE_3)))
            throw new Error('Opcode outside scope.');
        const opcodeRev = OpcodesReverse[opcode];
        return {
            'type': opcodeRev[0],
            'action': opcodeRev[1],
            'size': +opcodeRev[opcodeRev.length - 1] + 1
        };
    }

}