class IincInsnNode extends INode {

    constructor(opcode, ...input) {
        super(opcode, input);
    }

    execute(locals, stack, refs) {
        super.execute();
        console.log('executing IincInsnNode.\n\t\tOpcode: ' + OpcodesReverse[this.opcode] + '.\n\t\t' +
            'Input:`', this.input, '`.\n\t\tLocals:`', locals, '`.\n\t\tStack:`', stack, '`');
        const _var = this.nextInt();
        let number = locals[_var];
        assertJvmType(1, number, 'I'); // JvmInteger required
        const incr = this.nextInt();
        locals[_var] = number.addWithOther(JvmInteger.of(incr));
    }

}