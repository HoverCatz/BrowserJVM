class TypeInsnNode extends INode {

    constructor(opcode, ...input) {
        super(opcode, input);
    }

    execute(locals, stack, refs) {
        super.execute();
        console.log('executing TypeInsnNode.\n\t\tOpcode: ' + OpcodesReverse[this.opcode] + '.\n\t\t' +
            'Input:`', this.input, '`.\n\t\tLocals:`', locals, '`.\n\t\tStack:`', stack, '`');
        const type = this.nextString();
        switch (this.opcode) {
            case Opcodes.NEW: {
                stack.push(findStaticClass(type));
            } break;
            case Opcodes.ANEWARRAY: {
                const count = stack.pop();
                assertAsmType(1, count, 'I');
                stack.push(new JvmArray([...Array(count)].fill(null), findStaticClass(type)));
            } break;
            case Opcodes.CHECKCAST: {
                let obj = stack.pop();
                assertAsmType(1, obj, 'JvmClass');
                const argumentClass = findStaticClass(type);
                // obj =
                obj.castTo(argumentClass); // TODO: Should we push the casted object, or the original?
                stack.push(obj);
            } break;
            case Opcodes.INSTANCEOF: {
                const S = stack.pop();
                if (S == null)
                    stack.push(false);
                else {
                    const T = findStaticClass(type);
                    if (isPrimitiveType(type)) {
                        stack.push(isInstance(T, S));
                    } else {
                        stack.push(T.isInstanceOf(S));
                    }
                }
            } break;
        }
    }

}