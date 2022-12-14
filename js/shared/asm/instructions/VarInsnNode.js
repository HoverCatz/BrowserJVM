class VarInsnNode extends INode {

    constructor(opcode, ...input) {
        super(opcode, input);
    }

    execute(locals, stack, refs) {
        super.execute();
        console.log('executing VarInsnNode.\n\t\tOpcode: ' + OpcodesReverse[this.opcode] + '.\n\t\t' +
            'Input:`', this.input, '`.\n\t\tLocals:`', locals, '`.\n\t\tStack:`', stack, '`');

        const data = this.#getData();
        if (locals.length < data.size)
            throw new JvmError('Wrong locals size (locals:' + locals.length + ' < data:' + data.size + ')');

        let value = (data.load) ?
            locals[data.size - 1] // Load
        :
            stack.pop(); // Store

        const jvmType = getJvmTypeString(value, true);
        if (jvmType.length === 1)
            assertJvmType(1, value, data.type);
        else if (!!jvmType)
            assertIsJvm(1, value, data.type)

        if (data.load)
            stack.push(value); // Load
        else
            locals[data.size - 1] = value; // Store
    }

    #getData() {
        const opcode = Opcodes.ILOAD_0 + this.nextInt();
        if (!((opcode >= Opcodes.ILOAD_0 && opcode <= Opcodes.ALOAD_3) ||
              (opcode >= Opcodes.ISTORE_0 && opcode <= Opcodes.ASTORE_3)))
            throw new Error('Opcode outside scope.');
        const opcodeRev = OpcodesReverse[opcode];
        return {
            'type': opcodeRev[0], // B, C, S, I, F, L, D, A
            'load': opcodeRev[1] === 'L', // L(oad), S(tore)
            'size': +opcodeRev[opcodeRev.length - 1] + 1 // _0 = 1, _1 = 2, etc
        };
    }

}