class LdcInsnNode extends INode {

    constructor(opcode, ...input) {
        super(opcode, input);
    }

    execute(locals, stack, refs) {
        super.execute();
        console.log('executing LdcInsnNode.\n\t\tOpcode: ' + OpcodesReverse[this.opcode] + '.\n\t\t' +
            'Input:`', this.input, '`.\n\t\tLocals:`', locals, '`.\n\t\tStack:`', stack, '`');
        const type = this.nextInt();
        if (type === 5) { // Type
            stack.push(findStaticClass(this.nextString())); // TODO: Test this!
        } else {
            stack.push(this.next());
        }
    }

}