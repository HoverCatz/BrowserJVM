// New attempt
(async () => {

    const clz = new JvmClass('n/e/k/o', Opcodes.ACC_PUBLIC, 'TestClass');

    const testField = new JvmField(clz, Opcodes.ACC_PUBLIC, 'test', 'I');
    const testFieldStatic = new JvmField(clz, Opcodes.ACC_STATIC, 'test_static', 'I');
    const fields = {};
    addToList(fields, testFieldStatic.fieldName + '.' + testFieldStatic.fieldDesc, testFieldStatic.getOrCreate());
    addToList(fields, testField.fieldName + '.' + testField.fieldDesc, testField.getOrCreate());

    const testFunction = new JvmFunction(clz, Opcodes.ACC_PUBLIC, '', '');
    const functions = {};
    addToList(functions, 'test()V', testFunction);
    clz.load(fields, functions);

    const foundField = clz.findField('test()V', false);
    console.log('found:', foundField);

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