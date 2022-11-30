// New attempt
(async () => {

    // const clazzTestRoot = new JvmClass(Opcodes.ACC_PUBLIC, 'obzcu/re/TestRoot');
    // const field1 = new JvmField(clazzTestRoot, Opcodes.ACC_PUBLIC, 'abc', 'I');
    // clazzTestRoot.load({[field1.getFieldPath()]: field1}, {});
    // addStaticClass(clazzTestRoot);
    //
    // const clz1 = clazzTestRoot.newInstance();
    // const clz1_abc = clz1.findField('abc', 'I', false);
    // clz1_abc.set(JvmInteger.of(123));
    //
    // const clz2 = clazzTestRoot.newInstance();
    // const clz2_abc = clz2.findField('abc', 'I', false);
    // console.log(clz2_abc.get())

    // Test superclass(fields+functions)
    {
        const itz1 = new JvmClass(Opcodes.ACC_INTERFACE, 'obzcu/re/TestItz1');
        addStaticClass(itz1);
        itz1.load({}, {});

        const itz2 = new JvmClass(Opcodes.ACC_INTERFACE, 'obzcu/re/TestItz2');
        addStaticClass(itz2);
        itz2.load({}, {});

        const supr = new JvmClass(Opcodes.ACC_ABSTRACT, 'obzcu/re/TestSuper'); {
            const field = new JvmField(supr, Opcodes.ACC_PUBLIC | Opcodes.ACC_STATIC,
                'abc', 'Ljava/lang/Object;');
            supr.load({[field.getFieldPath()]: field}, {});
        }
        addStaticClass(supr);

        let clz = new JvmClass(0, 'obzcu/re/TestRoot', supr, [itz1, itz2]);
        clz.load({}, {});
        addStaticClass(clz);

        let field = clz.findField('abc', 'Ljava/lang/Object;', true);
        field.setValue(JvmDouble.of(1.234))
        // console.log(field.get())

        // console.log(clz, clz.uniqueIdentifier)
        // console.log(clz.newInstance(), clz.newInstance().uniqueIdentifier)
        clz = clz.newInstance()
        field = clz.findField('abc', 'Ljava/lang/Object;', true);
        field.setValue(JvmInteger.of(123))
        console.log(field.get())

        const clzSuper = clz.castTo(supr);
        console.log('clzSuper', clzSuper.findField('abc', 'Ljava/lang/Object;', true))

        const clzItz1 = clz.castTo(itz1);
        console.log('clzItz1', clzItz1.findField('abc', 'Ljava/lang/Object;', true))

        const clzItz2 = clz.castTo(itz2);
        console.log('clzItz2', clzItz2.findField('abc', 'Ljava/lang/Object;', true))

        const fromSuperToClz = clzSuper.castTo(clz);
        console.log('fromSuperToClz', fromSuperToClz.findField('abc', 'Ljava/lang/Object;', true)?.get()?.get())

        const fromItz1ToClz = clzItz1.castTo(clz);
        console.log('fromItz1ToClz', fromItz1ToClz.findField('abc', 'Ljava/lang/Object;', true)?.get()?.get())

        field.setValue(JvmInteger.of(456))
        const fromItz2ToClz = clzItz2.castTo(clz);
        console.log('fromItz2ToClz', fromItz2ToClz.findField('abc', 'Ljava/lang/Object;', true)?.get()?.get())

        // console.log('clz :', clz.name, clz.uniqueIdentifier)
        // console.log('clz.isInstanceOf(supr) :', clz.isInstanceOf(supr))
        // console.log('clz.isInstanceOf(itz1) :', clz.isInstanceOf(itz1))
        // console.log('clz.isInstanceOf(itz2) :', clz.isInstanceOf(itz2))
        // console.log(clz.castTo(supr).name, clz.castTo(supr).uniqueIdentifier)
        // console.log(clz.castTo(itz1).name, clz.castTo(itz1).uniqueIdentifier)
        // console.log(clz.castTo(itz2).name, clz.castTo(itz2).uniqueIdentifier)
        // console.log('clz.castTo(supr).isInstanceOf(clz) :', clz.castTo(supr).isInstanceOf(clz))
        // console.log('clz.castTo(itz1).isInstanceOf(clz) :', clz.castTo(itz1).isInstanceOf(clz))
        // console.log('clz.castTo(itz2).isInstanceOf(clz) :', clz.castTo(itz2).isInstanceOf(clz))
        //
        // let clz2 = new JvmClass(0, 'obzcu/re/TestRootTwo');
        // clz2.load({}, {});
        // addStaticClass(clz2);
        // clz2 = clz2.newInstance()
        // console.log('clz2 :', clz2.name, clz2.uniqueIdentifier)
        //
        // console.log(clz.castTo(itz1))
        // console.log(clz.castTo(itz1).castTo(clz))
    }

    // readClassFile('out/production/BrowserJVM/asmtesting/TestV1.class').then(clz => {
    //     console.log('class loaded:', clz)
    // }).catch(error => {
    //     console.error(error)
    // });

    // const clz = new JvmClass('n/e/k/o', Opcodes.ACC_PUBLIC | Opcodes.ACC_STATIC, 'TestClass');
    //
    // const testFunction = new JvmFunction(clz, Opcodes.ACC_PUBLIC | Opcodes.ACC_STATIC, 'test', '()I'); {
    //     const insns = [];
    //     insns.push(new InsnNode(Opcodes.LCONST_0));
    //     insns.push(new InsnNode(Opcodes.LCONST_1));
    //     insns.push(new InsnNode(Opcodes.LDIV));
    //     insns.push(new InsnNode(Opcodes.LCONST_1));
    //     insns.push(new InsnNode(Opcodes.LADD));
    //     insns.push(new InsnNode(Opcodes.LRETURN));
    //     testFunction.load(insns);
    // }
    // const functions = {
    //     [testFunction.functionName + '.' + testFunction.functionDesc]:
    //         testFunction.getOrCreate()
    // };
    // addToList(functions, testFunction.functionName + testFunction.functionDesc, testFunction.getOrCreate());
    // console.log(testFunction.execute().get());

    // // 8-bit
    // console.log('byte');
    // console.log('  max    ' + JvmByte.of(JvmByte.MAX_VALUE));
    // console.log('  min    ' + JvmByte.of(JvmByte.MIN_VALUE));
    //
    // // 16-bit
    // console.log('');
    // console.log('char');
    // console.log('  max    ' + JvmChar.of(JvmChar.MAX_VALUE));
    // console.log('  min    ' + JvmChar.of(JvmChar.MIN_VALUE));
    //
    // // 16-bit
    // console.log('');
    // console.log('short');
    // console.log('  max    ' + JvmShort.of(JvmShort.MAX_VALUE));
    // console.log('  min    ' + JvmShort.of(JvmShort.MIN_VALUE));
    //
    // // 32-bit
    // console.log('');
    // console.log('int');
    // console.log('  max    ' + JvmInteger.of(JvmInteger.MAX_VALUE));
    // console.log('  min    ' + JvmInteger.of(JvmInteger.MIN_VALUE));
    //
    // // 32-bit
    // console.log('');
    // console.log('float');
    // console.log('  max    ' + JvmFloat.of(JvmFloat.MAX_VALUE));
    // console.log('  min    ' + JvmFloat.of(JvmFloat.MIN_VALUE));
    //
    // // 64-bit
    // console.log('');
    // console.log('long');
    // console.log('  max    ' + JvmLong.of(JvmLong.MAX_VALUE));
    // console.log('  min    ' + JvmLong.of(JvmLong.MIN_VALUE));
    //
    // // 64-bit
    // console.log('');
    // console.log('double');
    // console.log('  max    ' + JvmDouble.of(JvmDouble.MAX_VALUE));
    // console.log('  min    ' + JvmDouble.of(JvmDouble.MIN_VALUE));
    //
    // console.log('');

    // console.log(castObjectTo('500', 'JvmByte'));

    // console.log('' + getTypeString(JvmByte.of(123)));
    //
    // const clz = new JvmClass('n/e/k/o', Opcodes.ACC_PUBLIC | Opcodes.ACC_STATIC, 'TestClass');
    // addStaticClass(clz.package, clz.className, clz);
    //
    // const test = new JvmField(clz, Opcodes.ACC_FINAL | Opcodes.ACC_STATIC, 'test', 'I');
    // test.setValue(JvmInteger.of(1_2_3));
    // clz.load({
    //     [test.fieldName + '.' + test.fieldDesc]: test.getOrCreate()
    // }, {});
    //
    // console.log(findStaticField('n/e/k/o/TestClass', 'test', 'I').getValue())

    // let clz = new JvmClass('n/e/k/o', Opcodes.ACC_PUBLIC, 'TestClass');
    // addStaticClass(clz.package, clz.className, clz);
    //
    // let testField = new JvmField(clz, Opcodes.ACC_PUBLIC | Opcodes.ACC_STATIC, 'test', 'I');
    // testField.setValue(JvmInteger.of(123));
    // testField = testField.getOrCreateStaticInstance();
    //
    // const fields = {};
    // addToList(fields, testField.fieldName + '.' + testField.fieldDesc, testField.getOrCreate());
    //
    // clz.load(fields, {});
    // console.log(testField.getValue());
    //
    // clz = clz.newInstance();
    // function ff() {
    //     return clz.findField(testField.fieldName, testField.fieldDesc, true);
    // }
    //
    // const f = ff();
    //
    // console.log(ff().getValue());
    // ff().setValue(JvmInteger.of(456));
    // console.log(ff().getValue());
    //
    // console.log(ff().getValue());
    //
    // console.log(f.getValue() === ff().getValue());
    //
    // console.log(f.getValue());
    // f.setValue(JvmInteger.of(789));
    // console.log(f.getValue());
    //
    // console.log(f.getValue());
    // console.log(ff().getValue());
    //
    // console.log(f.getValue() === ff().getValue());
    //
    // console.log(testField.getValue());
    // testField.setValue(JvmInteger.of(789));
    // console.log(testField.getValue());
    //
    // console.log(testField.getValue());
    // console.log(ff().getValue());
    //
    // console.log(testField.getValue() === ff().getValue());

    // let clz = new JvmClass('n/e/k/o', Opcodes.ACC_PUBLIC, 'TestClass');
    // addStaticClass(clz.package, clz.className, clz);
    //
    // clz = findStaticClass('n/e/k/o/TestClass');
    // console.log(clz);
    //
    // const testField = new JvmField(clz, Opcodes.ACC_PUBLIC, 'test', 'I');
    // testField.setValue(JvmInteger.of(1_2_3));
    // const testFieldStatic = new JvmField(clz, Opcodes.ACC_STATIC, 'test_static', 'I');
    // testFieldStatic.setValue(JvmInteger.of(4_5_6));
    // const fields = {};
    // addToList(fields, testFieldStatic.fieldName + '.' + testFieldStatic.fieldDesc, testFieldStatic.getOrCreate());
    // addToList(fields, testField.fieldName + '.' + testField.fieldDesc, testField.getOrCreate());
    //
    // const testFunction = new JvmFunction(clz, Opcodes.ACC_PUBLIC | Opcodes.ACC_STATIC, 'test', '()I'); {
    //     const insns = [];
    //     insns.push(new InsnNode(Opcodes.ICONST_2));
    //     insns.push(new InsnNode(Opcodes.ICONST_3));
    //     insns.push(new InsnNode(Opcodes.IADD));
    //     insns.push(new InsnNode(Opcodes.ICONST_4));
    //     insns.push(new InsnNode(Opcodes.IADD));
    //     insns.push(new InsnNode(Opcodes.IRETURN));
    //     testFunction.load(insns);
    // }
    // const functions = {};
    // addToList(functions, testFunction.functionName + testFunction.functionDesc, testFunction.getOrCreate());
    //
    // clz.load(fields, functions);
    // clz = clz.newInstance();
    //
    // let foundFunc = clz.findFunction('test', '()I', true);
    // console.log('found a:', foundFunc);
    // console.log('execute a', foundFunc.execute([clz], []));
    //
    // foundFunc = findStaticFunction('n/e/k/o/TestClass', 'test', '()I');
    // console.log('found b:', foundFunc);
    // console.log('execute b', foundFunc.execute([clz], []));

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