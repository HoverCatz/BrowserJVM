// New attempt
(async () => {

    // const clz = new JvmClass('n/e/k/o', Opcodes.ACC_PUBLIC | Opcodes.ACC_STATIC, 'TestClass');
    // addStaticClass(clz.package, clz.className, clz);
    //
    // const test = new JvmField(clz, Opcodes.ACC_FINAL | Opcodes.ACC_STATIC, 'test', 'I');
    // test.setValue(123);
    // clz.load({
    //     [test.fieldName + '.' + test.fieldDesc]: test.getOrCreate()
    // }, {});
    //
    // console.log(findStaticField('n/e/k/o/TestClass', 'test', 'I').getValue())

    let clz = new JvmClass('n/e/k/o', Opcodes.ACC_PUBLIC, 'TestClass');
    addStaticClass(clz.package, clz.className, clz);

    clz = findStaticClass('n/e/k/o/TestClass');
    console.log(clz);

    const testField = new JvmField(clz, Opcodes.ACC_PUBLIC, 'test', 'I');
    testField.setValue(123);
    const testFieldStatic = new JvmField(clz, Opcodes.ACC_STATIC, 'test_static', 'I');
    testFieldStatic.setValue(456);
    const fields = {};
    addToList(fields, testFieldStatic.fieldName + '.' + testFieldStatic.fieldDesc, testFieldStatic.getOrCreate());
    addToList(fields, testField.fieldName + '.' + testField.fieldDesc, testField.getOrCreate());

    const testFunction = new JvmFunction(clz, Opcodes.ACC_PUBLIC | Opcodes.ACC_STATIC, 'test', '()I'); {
        const insns = [];
        insns.push(new InsnNode(Opcodes.ICONST_2));
        insns.push(new InsnNode(Opcodes.ICONST_3));
        insns.push(new InsnNode(Opcodes.IADD));
        insns.push(new InsnNode(Opcodes.ICONST_4));
        insns.push(new InsnNode(Opcodes.IADD));
        insns.push(new InsnNode(Opcodes.IRETURN));
        testFunction.load(insns);
    }
    const functions = {};
    addToList(functions, testFunction.functionName + testFunction.functionDesc, testFunction.getOrCreate());

    clz.load(fields, functions);
    clz = clz.newInstance();

    let foundFunc = clz.findFunction('test', '()I', true);
    console.log('found a:', foundFunc);
    console.log('execute a', foundFunc.execute([clz], []));

    foundFunc = findStaticFunction('n/e/k/o/TestClass', 'test', '()I');
    console.log('found b:', foundFunc);
    console.log('execute b', foundFunc.execute([clz], []));

    // let buffer = [];
    // let currentIndex = 0;
    //
    // currentIndex += writeUInt(buffer, 0xCAFEBABE);
    // console.log(currentIndex);
    // currentIndex += writeUInt(buffer, 0xCAFEBABE);
    // console.log(currentIndex);
    // currentIndex += writeUInt(buffer, 0xCAFEBABE);
    // console.log(currentIndex);
    //
    // currentIndex = 0;
    // let magic = readUInt(buffer, currentIndex);
    // console.log(magic.toString(16));
    // currentIndex += 4;
    //
    // magic = readUInt(buffer, currentIndex);
    // console.log(magic.toString(16));
    // currentIndex += 4;
    //
    // magic = readUInt(buffer, currentIndex);
    // console.log(magic.toString(16));
    // currentIndex += 4;

})();