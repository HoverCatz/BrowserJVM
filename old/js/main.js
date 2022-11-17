// Code to read bytes from a local file:
// document.querySelector('input').addEventListener('change', function()
// {
//     const reader = new FileReader();
//     reader.onload = function()
//     {
//         const arrayBuffer = this.result,
//             array = new Uint8Array(arrayBuffer),
//             binaryString = String.fromCharCode.apply(null, array);
//         document.write(binaryString);
//     }
//     reader.readAsArrayBuffer(this.files[0]);
// }, false);

/* asm-write.js */
(async () => {
    const buffer = await writeToClassFile(null);
    console.log(currentIndex, buffer);
})();


/* asm.js */
/*
(async () =>
{
    await initRets();

    const loadLocal = async name => {
        const response = await fetch('testing/' + name);
        const data = await response.blob();
        const buffer = await data.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        await parseClassFile(bytes);
    }

    // await loadLocal("Third.class");
    // {
    //     let clazz = await findClass('obzcu/re/testing/Third');
    //     await clazz.findFunction('<clinit>', '()V').execute();
    //
    //     const clz = await clazz.newInstance();
    //     // await clz.findFunction('main', '([Ljava/lang/String;)V').execute();
    //     await clz.findFunction('<init>', '()V').execute({0: clz});
    // }
    //
    // await loadLocal("Fourth.class");
    // {
    //     let clazz = await findClass('obzcu/re/testing/Fourth');
    //     await clazz.findFunction('<clinit>', '()V').execute();
    //
    //     const clz = await clazz.newInstance();
    //     // await clz.findFunction('main', '([Ljava/lang/String;)V').execute();
    //     await clz.findFunction('<init>', '()V').execute({0: clz});
    // }

    await loadLocal("Fifth.class");
    {
        let clazz = await findClass('obzcu/re/testing/Fifth');
        await clazz.findFunction('<clinit>', '()V').execute();

        const clz = await clazz.newInstance();
        await clz.findFunction('main', '([Ljava/lang/String;)V').execute();
    }

    // print('abc')
    // print(await findClass('java/lang/Object'))
    // print('123')
    // print('\n')

    document.write('<pre>' + JSON.safeStringify(classes) + '</pre><br>');

})();

/* jvm.js */
// const test = new JvmClass();
//
// test.load('test', {
//     0: test, // this
//     1: 64,
//     2: " Hello world ",
//     3: ":D"
// }, [
//     {[Opcodes.IINC]    : [ 1, 5 ]},
//     {[Opcodes.ILOAD]   : [ 1 ]}, // 69
//     {[Opcodes.ALOAD]   : [ 2 ]},
//     {[Opcodes.ALOAD]   : [ 3 ]},
//     {'append'          : [ 3 ]}, // count
//     {[Opcodes.ARETURN] : [   ]}
// ]);
// const ret = test.execute('test');
// document.write(ret); // prints 'Hello World :D'
//
// test.load('add', {
//     0: 50,
//     1: 45
// }, [
//     {[Opcodes.ILOAD]   : [ 0 ]},
//     {[Opcodes.ILOAD]   : [ 1 ]},
//     {[Opcodes.IADD]    : [   ]},
//     {[Opcodes.IRETURN] : [   ]}
// ]);
// const ret2 = test.execute('add');
// document.write(ret2); // prints '95'
//
// test.load('shift', {
//     0: 5,
//     1: 22
// }, [
//     {[Opcodes.ILOAD]   : [ 0 ]},
//     {[Opcodes.ILOAD]   : [ 1 ]},
//     {[Opcodes.ISHL]    : [   ]},
//     {[Opcodes.IRETURN] : [   ]}
// ]);
// const ret3 = test.execute('shift');
// document.write(ret3); // prints '20971520'
//
// test.load('shift2', {
//     0: 22,
//     1: 5
// }, [
//     {[Opcodes.ILOAD]   : [ 0 ]},
//     {[Opcodes.ILOAD]   : [ 1 ]},
//     {[Opcodes.ISHL]    : [   ]},
//     {[Opcodes.IRETURN] : [   ]}
// ]);
// const ret4 = test.execute('shift2');
// document.write(ret4); // prints '704'
