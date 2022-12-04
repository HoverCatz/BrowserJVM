class FieldInsnNode extends INode {

    constructor(opcode, ...input) {
        super(opcode, input);
    }

    execute(locals, stack, refs) {
        super.execute();
        console.log('executing FieldInsnNode.\n\t\tOpcode: ' + OpcodesReverse[this.opcode] + '.\n\t\t' +
            'Input:`', this.input, '`.\n\t\tLocals:`', locals, '`.\n\t\tStack:`', stack, '`');

        const owner = this.nextString();
        const name = this.nextString();
        const descriptor = this.nextString();

        const clazz = findStaticClass(owner);
        console.log('owner:', owner, 'clazz:', clazz)
        if (!clazz)
            throw new Error(`Class '${owner}' not loaded or not found.`);

        const isStatic = this.opcode === Opcodes.GETSTATIC || this.opcode === Opcodes.PUTSTATIC;
        const isPut = (!isStatic && this.opcode === Opcodes.PUTFIELD) || this.opcode === Opcodes.PUTSTATIC;

        let field = clazz.findField(name, descriptor, isStatic);
        console.log('name:', name, 'descriptor:', descriptor, 'isStatic:', isStatic, 'field:', field)
        if (!field)
            throw new Error(`Field '${owner} ${name}.${descriptor}' (${isStatic ? 'static' : 'not static'}) not found.`);

        if (isPut) {

            if (field.isFinalInstance && field.isLoaded)
                throw new Error(`Can't set final field '${owner} ${name}.${descriptor}' (${isStatic ? 'static' : 'not static'}).`);

            let value = stack.pop();

            const ref = isStatic ? null : stack.pop();
            if (!isStatic) {
                assertJvmType(1, ref, 'JvmClass');
                field = ref.findField(name, descriptor, isStatic);
                if (!field)
                    throw new Error(`Field '${owner} ${name}.${descriptor}' (${isStatic ? 'static' : 'not static'}) not found.`);
            }

            field.setValue(value);

        } else {

            const ref = isStatic ? null : stack.pop();
            if (!isStatic) {
                assertJvmType(1, ref, 'JvmClass');
                field = ref.findField(name, descriptor, isStatic);
                if (!field)
                    throw new Error(`Field '${owner} ${name}.${descriptor}' (${isStatic ? 'static' : 'not static'}) not found.`);
            }

            stack.push(field.getValue());

        }
    }

}