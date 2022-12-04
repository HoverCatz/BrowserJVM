class MethodInsnNode extends INode {

    constructor(opcode, ...input) {
        super(opcode, input);
    }

    execute(locals, stack, refs) {
        super.execute();
        console.log('executing MethodInsnNode.\n\t\tOpcode: ' + OpcodesReverse[this.opcode] + '.\n\t\t' +
            'Input:`', this.input, '`.\n\t\tLocals:`', locals, '`.\n\t\tStack:`', stack, '`');

        const owner = this.nextString();
        const name = this.nextString();
        const descriptor = this.nextString();
        const argumentTypes = this.nextString();
        const returnType = this.nextString();
        const isStatic = this.nextBoolean();
        // const isInterface = this.nextBoolean();

        const clazz = findStaticClass(owner);
        if (!clazz)
            throw new Error(`Class '${owner}' not loaded or not found.`);

        let func = clazz.findFunction(name, descriptor, isStatic);
        if (!func)
            throw new Error(`Function '${owner} ${name}.${descriptor}' (${isStatic ? 'static' : 'not static'}) not found.`);

        const objects = [...Array(argumentTypes.length)].fill(null);
        for (let i = objects.length - 1; i >= 0; i--) {
            objects[i] = stack.pop();
        }

        if (name === '<init>') {

            const ref = stack.pop();
            assertJvmType(1, ref, 'JvmClass');
            if (ref.isStaticInstance)
                throw new Error('Trying to use a static class to in <init>.');

            const constructor = ref.findFunction(name, descriptor, false);
            if (!constructor)
                throw new Error(`Constructor not found in class '${owner}'.`);

            const args = [ref].concat(objects);
            constructor.execute(args);

            stack.replace(ref);

        } else {

            const ref = isStatic ? null : stack.pop();
            if (ref !== null) {
                assertJvmType(1, ref, 'JvmClass');
                func = ref.findFunction(name, descriptor, isStatic);
                if (!func)
                    throw new Error(`Function '${owner} ${name}.${descriptor}' (${isStatic ? 'static' : 'not static'}) not found.`);
            }

            const args = (!isStatic ? [ref] : []).concat(objects);
            const invoke = func.execute(args);

            if (returnType !== 'V')
                stack.push(invoke);

        }

    }

}