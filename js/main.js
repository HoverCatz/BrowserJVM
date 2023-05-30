// New attempt


const indexes = async function (minimized = true) {
    const text = await (await fetch(
        `java.7.indexes${minimized ? '' : '.pretty'}.json`)).text();
    const json = JSON.parse(text);
    const classes = json["classes"];
    const classesPackages = json["classesPackages"];
    const pkgQuick = json["pkgQuick"];
    const clzQuick = json["clzQuick"];
    const obj = {
        'json': json,
        'classes': classes,
        'classesPackages': classesPackages,
        'pkgQuick': pkgQuick,
        'clzQuick': clzQuick
    };
    obj.findClassByName = (function (name) {
        const results = [];
        const pkgs = classesPackages[name];
        if (typeof pkgs === 'object') {
            for (let i in pkgs) {
                let pkg = pkgs[i];
                if (typeof pkg === 'string')
                    results.push(this.findClassByPkgAndName(pkg + '.' + name));
                else if (typeof pkg === 'number')
                    results.push(this.findClassByPkgAndName(pkgQuick[pkg] + '.' + name));
            }
        } else {
            if (typeof pkgs === 'string')
                results.push(this.findClassByPkgAndName(pkgs + '.' + name));
            else if (typeof pkgs === 'number')
                results.push(this.findClassByPkgAndName(pkgQuick[pkgs] + '.' + name));
        }
        return results;
    });
    obj.findClassByPkgAndName = (function (name) {
        if (!name.includes('.'))
            return classes[name];
        const split = name.split('.');
        if (split.length === 1)
            return classes[split[0]];
        let i = 1, part = classes[split[0]];
        for (; i < split.length - 1; i++)
            part = part[split[i]];
        return part[split[i]];
    });
    obj.getClassByIndex = (function (index) {
        return clzQuick[index];
    });
    return obj;
};

function fixStacks(output, pad = 1, lastKey = '') {
    if (typeof output === 'string') {
        // console.log(`${'    '.repeat(pad)}obj: '`, output, `'`)
        return output;
    } else if (output instanceof Array) {
        // output = ['hello']
        if (lastKey === 'stack' && output.length === 1)
            return fixStacks(output[0], pad, lastKey)
        for (let i = 0; i < output.length; i++) {
            const obj = output[i];
            // console.log(`${'    '.repeat(pad)}obj[a ${i}]:`, obj)
            output[i] = fixStacks(obj, pad + 1);
        }
    } else {
        // output = {
        //     hello: 'world'
        // }
        const keys = Object.keys(output);
        const len = keys.length;
        if (lastKey === 'stack' && len === 1)
            return fixStacks(output['stack'], pad, lastKey)
        for (const key of keys) {
            let obj = output[key];
            // console.log(`${'    '.repeat(pad)}obj[b ${key}]:`, obj)
            output[key] = fixStacks(obj, pad + 1, key);
        }
    }
    return output;
}
function findErrors(output) {
    if (typeof output === 'string')
        ; // Ignore
    else if (output instanceof Array)
        for (let i = 0; i < output.length; i++)
            findErrors(output[i]);
    else {
        const keys = Object.keys(output);
        for (const key of keys) {
            let obj = output[key];
            if (key === 'error') {
                console.error(`Error found:`, obj)
                continue;
            }
            findErrors(obj);
        }
    }
    return output;
}

(async () => {

    const results
        = await indexes(false);
    // const itzs = results.findClassByPkgAndName('java.io.File').interfaces;
    // for (let i = 0; i < itzs.length; i++) {
    //     const itz = itzs[i];
    //     console.log(results.getClassByIndex(itz))
    // }

    // const test = function*() {
    //     yield '';
    // }
    // for (let string of test()) {
    //     console.log(string)
    // }
    //
    // return;

    let text = ``;

    // text = `
    //     String test = "Hello world :)";
    //     // Hello world
    //     System.out.println(test);
    //     String test2 = true() ? "a" : "b";
    //     String test3;
    //     {
    //         String test4;
    //         for (abc) {
    //             // Hello world
    //         }
    //         String test5;
    //     }
    //     if (false) {
    //         String test6;
    //         test6 = "owo";
    //         return;
    //     }
    //     for (abc2) {
    //         // Hello world 2
    //         System.out.println("Hello world 2");
    //     }
    //     while (true) {
    //         // Hello world 3
    //         System.out.println("Hello world 3");
    //     }
    // `;

    // text = `
    //     boolean test = true;
    //     if (test)
    //         System.out.println(1);
    //     test = false;
    //     if (!test) {
    //         System.out.println(2);
    //         test = true;
    //         System.out.println(3);
    //         if (test && !test) {
    //             System.out.println(4);
    //             if (!test && test) {
    //                 System.out.println(5);
    //                 if (!test && !test) {
    //                     System.out.println(6);
    //                     if (test && test) {
    //                         System.out.println(7);
    //                     }
    //                     System.out.println(9);
    //                 }
    //                 System.out.println(10);
    //             }
    //             System.out.println(11);
    //         }
    //         System.out.println(12);
    //     }
    //     System.out.println(13);
    // `;

    // text = `
    //
    //         int foundFields = 0;
    //         for (FieldNode field : clz.fields) {
    //             if ((field.access & Opcodes.ACC_FINAL) == 0) continue; else
    //             if ((field.access & Opcodes.ACC_SYNTHETIC) == 0) continue; else
    //             if ((field.access & Opcodes.ACC_STATIC) == 0) continue; else
    //             if (!field.desc.equalsIgnoreCase("I")) continue; else
    //             if (field.name.length() > 2) continue;
    //             foundFields++;
    //         }
    //         if (foundFields != 18)
    //             return false;
    //
    //         // We should find all these
    //         boolean foundIushr = false,
    //                 foundIshl = false, foundIor = false,
    //                 foundIand = false, foundIxor = false,
    //                 foundIntegerReverse = false,
    //                 foundIntegerRotateRight = false;
    //
    //         // But we shouldn't find these
    //         boolean foundNoIshr = true, foundNoLxor = true;
    //
    //         // Should be 18!
    //         int putStatics = 0;
    //
    //         for (MethodNode method : clz.methods) {
    //             for (AbstractInsnNode insn : method.instructions.toArray()) {
    //                 if (insn instanceof InsnNode) {
    //                     int opcode = insn.getOpcode();
    //                     if (opcode == Opcodes.IUSHR) foundIushr = true; else
    //                     if (opcode == Opcodes.ISHL) foundIshl = true; else
    //                     if (opcode == Opcodes.ISHR) foundNoIshr = false; /* oops! */ else
    //                     if (opcode == Opcodes.IOR) foundIor = true; else
    //                     if (opcode == Opcodes.IAND) foundIand = true; else
    //                     if (opcode == Opcodes.IXOR) foundIxor = true; else
    //                     if (opcode == Opcodes.LXOR) foundNoLxor = false; /* oops! */
    //                 } else if (insn instanceof MethodInsnNode) {
    //                     MethodInsnNode invoke = (MethodInsnNode) insn;
    //                     if (!invoke.owner.equals("java/lang/Integer")) continue;
    //                     if (invoke.name.equals("reverse")) foundIntegerReverse = true; else
    //                     if (invoke.name.equals("rotateRight")) foundIntegerRotateRight = true;
    //                 } else if (insn instanceof FieldInsnNode) {
    //                     if (insn.getOpcode() != Opcodes.PUTSTATIC) continue;
    //                     FieldInsnNode field = (FieldInsnNode) insn;
    //                     if (!field.desc.equals("I")) continue;
    //                     if (!field.owner.equals(clz.name)) continue;
    //                     putStatics++;
    //                 }
    //             }
    //         }
    //
    //         return foundIushr &&
    //                foundIshl &&
    //                foundNoIshr &&
    //                foundIor &&
    //                foundIand &&
    //                foundIxor &&
    //                foundNoLxor &&
    //                foundIntegerReverse &&
    //                foundIntegerRotateRight &&
    //                putStatics == 18;
    // `;

    // text = `
    //     String a;
    //     a = "a";
    //     int b = 3;
    //     char c = 'c';
    //     double d = 3.14d;
    //     boolean e = true;
    //     float f = 4.20f;
    //     Object o = null;
    //     o = a;
    //     o = b;
    //     o = c;
    //     o = d;
    //     o = e;
    //     o = f;
    //     try {
    //         System.out.println(n);
    //     } catch (Exception e) {
    //         e.printStackTrace();
    //     }
    // `;

    // text = `
    //     try (abc) {
    //         System.out.println(n);
    //     } catch (Exception e) {
    //         e.printStackTrace();
    //     }
    // `;

    // text = `
    //     try{a;}try(b){c;}
    // `;

    // text = `
    //     if (true)
    //         println(1);
    //      else if (false)
    //         println(2);
    //      else
    //         abc = new String("hehe") {
    //             @Override
    //             public String toString() {
    //                 return "owo";
    //             }
    //         };
    //
    // `;

    // text = `
    //     try {
    //         a;
    //     } catch (Throwable t) {
    //         b;
    //     } finally {
    //         c;
    //     }
    // `;

    // text = `
    //     ;;test;;;;;;;
    //     ;;;;test2;;;;
    // `;

    // text = `
    //     test((a, b) -> {
    //             for (int i = 0; i < 3; i++) {
    //                 test(a + i, b - i);
    //             }
    //     });
    // `;

    // text = `;;;
    //     if (true) {
    //         return new String() {
    //             @Override
    //             public String toString() {
    //                 return this.toString() + " owo";
    //             }
    //         }.hashCode();
    //     }
    //     return "idk";
    // `;

    // text = `;;;
    //     if (true) ;
    //         return new String() {
    //             @Override
    //             public String toString() {
    //                 return this.toString() + " owo";
    //             }
    //         }.hashCode();
    //
    //     owo;
    //     { a; }
    // `;

    text = `new Object/*abc*/(){}.hashCode();owo;`;
    text = `{int /* Hello */owo/* world */=/**/123/* :) */;}`;
    text = `int /* Hello */owo/* world */=/**/123/* :) */;int /* Hello */owo/* world */=/**/456/* :) */;`;
    text = `
    
        int owo = new String("uwu") {
            @Override
            public String toString() {
                return "oWo";
            }
        }.hashCode();
        
        String abc = "hello";
        
        int uwu = owo + 3;
        
        int test = test1();
        
        int test = test2(testA);
        
        int test = test3(test4(testB));
        
        if (true) test5();
        
        if (true) { test6(); }
        
    `;
    text = `if (true) print(hello);`;
    text = `
        if (true) {
            print(hello);
        } else if (false) {
            print(world);
        } else {
            print(ending);
        }
        if (true) 
            print(abc);
        else if (false) 
            print(def);
        else 
            print(ghi);
        
    `;
    text = `if(true)for(a;b;c){print(owo);print(hello);}`;
    text = `
        for (a; b; c) {
            print(hello);
            print(world);
        }
    `;
    text = `
        while (true) owo("uwu");    
        while (true) { UwU("OwO"); }    
    `;
    text = `
        try (String abc = new String() {
            @Override
            public String toString() {
                return "owo";
            }        
        }) {
            hello;
            abc;
        } catch (Exception e) {
            world;
            def;
        } finally {
            ending;
            ghi;
        }
    `;
    text = `("abc").toString();`;
    text = `
        return new String() {
            @Override
            public String toString() {
                return this.toString() + " owo";
            }
        }.hashCode();
    `;
    text = `
        new String() {
            @Override
            public String toString() {
                return this.toString() + " owo";
            }
        }.hashCode();
    `;
    text = `

            int foundFields = 0;
            for (FieldNode field : clz.fields) {
                if ((field.access & Opcodes.ACC_FINAL) == 0) continue; else
                if ((field.access & Opcodes.ACC_SYNTHETIC) == 0) continue; else
                if ((field.access & Opcodes.ACC_STATIC) == 0) continue; else
                if (!field.desc.equalsIgnoreCase("I")) continue; else
                if (field.name.length() > 2) continue;
                foundFields++;
            }
            if (foundFields != 18)
                return false;

            // We should find all these
            boolean foundIushr = false,
                    foundIshl = false, foundIor = false,
                    foundIand = false, foundIxor = false,
                    foundIntegerReverse = false,
                    foundIntegerRotateRight = false;

            // But we shouldn't find these
            boolean foundNoIshr = true, foundNoLxor = true;

            // Should be 18!
            int putStatics = 0;

            for (MethodNode method : clz.methods) {
                for (AbstractInsnNode insn : method.instructions.toArray()) {
                    if (insn instanceof InsnNode) {
                        int opcode = insn.getOpcode();
                        if (opcode == Opcodes.IUSHR) foundIushr = true; else
                        if (opcode == Opcodes.ISHL) foundIshl = true; else
                        if (opcode == Opcodes.ISHR) foundNoIshr = false; /* oops! */ else
                        if (opcode == Opcodes.IOR) foundIor = true; else
                        if (opcode == Opcodes.IAND) foundIand = true; else
                        if (opcode == Opcodes.IXOR) foundIxor = true; else
                        if (opcode == Opcodes.LXOR) foundNoLxor = false; /* oops! */
                    } else if (insn instanceof MethodInsnNode) {
                        MethodInsnNode invoke = (MethodInsnNode) insn;
                        if (!invoke.owner.equals("java/lang/Integer")) continue;
                        if (invoke.name.equals("reverse")) foundIntegerReverse = true; else
                        if (invoke.name.equals("rotateRight")) foundIntegerRotateRight = true;
                    } else if (insn instanceof FieldInsnNode) {
                        if (insn.getOpcode() != Opcodes.PUTSTATIC) continue;
                        FieldInsnNode field = (FieldInsnNode) insn;
                        if (!field.desc.equals("I")) continue;
                        if (!field.owner.equals(clz.name)) continue;
                        putStatics++;
                    }
                }
            }

            return foundIushr &&
                   foundIshl &&
                   foundNoIshr &&
                   foundIor &&
                   foundIand &&
                   foundIxor &&
                   foundNoLxor &&
                   foundIntegerReverse &&
                   foundIntegerRotateRight &&
                   putStatics == 18;
    `;

    text = `
        String test = "Hello world :)";
        // Hello world
        System.out.println(test);
        String test2 = true() ? "a" : "b";
        String test3;
        {
            String test4;
            for (abc) {
                // Hello world
                owo;
            }
            String test5;
        }
        if (false) {
            String test6;
            test6 = "owo";
            return;
        }
        for (abc2) {
            // Hello world 2
            System.out.println("Hello world 2");
        }
        while (true) {
            // Hello world 3
            System.out.println("Hello world 3");
        }
    `;

    text = `
        boolean test = true;
        if (test)
            System.out.println(1);
        test = false;
        if (!test) {
            System.out.println(2);
            test = true;
            System.out.println(3);
            if (test && !test) {
                System.out.println(4);
                if (!test && test) {
                    System.out.println(5);
                    if (!test && !test) {
                        System.out.println(6);
                        if (test && test) {
                            System.out.println(7);
                        }
                        System.out.println(9);
                    }
                    System.out.println(10);
                }
                System.out.println(11);
            }
            System.out.println(12);
        }
        System.out.println(13);
    `;
    text = `
        if (locale == null) {
            throw new NullPointerException();
        }

        int firstLower;
        final int len = value.length;

        /* Now check if there are any characters that need to be changed. */
        scan: {
           for (firstLower = 0 ; firstLower < len; ) {
                int c = (int)value[firstLower];
                int srcCount;
                if ((c >= Character.MIN_HIGH_SURROGATE)
                        && (c <= Character.MAX_HIGH_SURROGATE)) {
                    c = codePointAt(firstLower);
                    srcCount = Character.charCount(c);
                } else {
                    srcCount = 1;
                }
                int upperCaseChar = Character.toUpperCaseEx(c);
                if ((upperCaseChar == Character.ERROR)
                        || (c != upperCaseChar)) {
                    break scan;
                }
                firstLower += srcCount;
            }
            return this;
        }

        char[] result = new char[len]; /* may grow */
        int resultOffset = 0;  /* result may grow, so i+resultOffset
         * is the write location in result */

        /* Just copy the first few upperCase characters. */
        System.arraycopy(value, 0, result, 0, firstLower);

        String lang = locale.getLanguage();
        boolean localeDependent =
                (lang == "tr" || lang == "az" || lang == "lt");
        char[] upperCharArray;
        int upperChar;
        int srcChar;
        int srcCount;
        for (int i = firstLower; i < len; i += srcCount) {
            srcChar = (int)value[i];
            if ((char)srcChar >= Character.MIN_HIGH_SURROGATE &&
                (char)srcChar <= Character.MAX_HIGH_SURROGATE) {
                srcChar = codePointAt(i);
                srcCount = Character.charCount(srcChar);
            } else {
                srcCount = 1;
            }
            if (localeDependent) {
                upperChar = ConditionalSpecialCasing.toUpperCaseEx(this, i, locale);
            } else {
                upperChar = Character.toUpperCaseEx(srcChar);
            }
            if ((upperChar == Character.ERROR)
                    || (upperChar >= Character.MIN_SUPPLEMENTARY_CODE_POINT)) {
                if (upperChar == Character.ERROR) {
                    if (localeDependent) {
                        upperCharArray =
                                ConditionalSpecialCasing.toUpperCaseCharArray(this, i, locale);
                    } else {
                        upperCharArray = Character.toUpperCaseCharArray(srcChar);
                    }
                } else if (srcCount == 2) {
                    resultOffset += Character.toChars(upperChar, result, i + resultOffset) - srcCount;
                    continue;
                } else {
                    upperCharArray = Character.toChars(upperChar);
                }

                /* Grow result if needed */
                int mapLen = upperCharArray.length;
                if (mapLen > srcCount) {
                    char[] result2 = new char[result.length + mapLen - srcCount];
                    System.arraycopy(result, 0, result2, 0, i + resultOffset);
                    result = result2;
                }
                for (int x = 0; x < mapLen; ++x) {
                    result[i + resultOffset + x] = upperCharArray[x];
                }
                resultOffset += (mapLen - srcCount);
            } else {
                result[i + resultOffset] = (char)upperChar;
            }
        }
        return new String(result, 0, len + resultOffset);
    `;
    text = `
        test = result[new String("owo") {
            @Override
            public String toString() {
                return "owo";
            }        
        }.hashCode()] = 123;
    `;
    text = `
        new Test() {
            @Override
            public String owo() {
                return "oWo";
            }
        }.abc = 123;
    `;

    // const info = {
    //     name: 'main',
    //     args: {
    //         'String[]': 'args'
    //     },
    //     _static: true,
    //     locals: []
    // };
    // const func = new JavaFunctionReader(
    //     info,
    //     new Iterator(text),
    //     false
    // );
    // const output = func.parseFunctionCode();
    // console.log('info:', info)
    // console.log('output:', output)
    // fixStacks(output)
    // console.log(JSON.stringify(output, null, 4))
    // findErrors(output)

    // TODO: While parsing classes, if a function is marked as native,
    //  we shouldn't expect curly brackets, but a semicolon.

    // let float = testt();
    // console.log(`bits: ${float.bits}`)
    // console.log(`float: ${float.value.toFixed(4)}`)

    // testJavaNumbers()
    // throw '';

    const files = {
        '1': 'testing/src/compilertesting/fields/CompilerTestV1.java',
        '2': 'testing/src/compilertesting/fields/CompilerTestV2.java',
        '3': 'testing/src/compilertesting/fields/CompilerTestV3.java',
        '4': 'testing/src/compilertesting/fields/CompilerTestV4.java',
        '5': 'testing/src/compilertesting/fields/CompilerTestV5.java',
        '6': 'testing/src/compilertesting/fields/CompilerTestV6.java',

        '100': 'testing/src/compilertesting/functions/CompilerTestV100.java',
        '101': 'testing/src/compilertesting/functions/CompilerTestV101.java',
        '102': 'testing/src/compilertesting/functions/CompilerTestV102.java',
        '103': 'testing/src/compilertesting/functions/CompilerTestV103.java',
        '104': 'testing/src/compilertesting/functions/CompilerTestV104.java',
        '105': 'testing/src/compilertesting/functions/CompilerTestV105.java',

        'test': 'testing/src/compilertesting/Test.java',

        'anno0': 'testing/src/compilertesting/annotations/CompilerTestV1000.java',
        'anno1': 'testing/src/compilertesting/annotations/CompilerTestV1001.java',
        'anno2': 'testing/src/compilertesting/annotations/CompilerTestV1002.java',
        'anno3': 'testing/src/compilertesting/annotations/CompilerTestV1003.java.bin',
        'anno4': 'testing/src/compilertesting/annotations/CompilerTestV1004.java.bin',
        'anno5': 'testing/src/compilertesting/annotations/CompilerTestV1005.java',

        'inner1': 'testing/src/compilertesting/innerclasses/CompilerTestV110.java',
        'inner2': 'testing/src/compilertesting/innerclasses/CompilerTestV111.java',
        'inner3': 'testing/src/compilertesting/innerclasses/CompilerTestV112.java',
        'inner4': 'testing/src/compilertesting/innerclasses/CompilerTestV113.java',

        'fakeConstructor1': 'testing/src/compilertesting/functions/CompilerTestConstructorV10000.java',
        'fakeConstructor2': 'testing/src/compilertesting/functions/CompilerTestConstructorV10001.java',
        'fakeConstructor3': 'testing/src/compilertesting/functions/CompilerTestConstructorV10002.java',
        'fakeConstructor4': 'testing/src/compilertesting/functions/CompilerTestConstructorV10003.java',
        'fakeConstructor5': 'testing/src/compilertesting/functions/CompilerTestConstructorV10004.java',

        'everything': 'testing/src/compilertesting/everything/CompilerTestV210.java',
        'empty': 'testing/src/compilertesting/everything/CompilerTestV211.java.bin',
        'generics1': 'testing/src/compilertesting/everything/CompilerTestV212.java',
        'generics2': 'testing/src/compilertesting/everything/CompilerTestV213.java',
        'generics3': 'testing/src/compilertesting/everything/CompilerTestV214.java',

        'java.lang.String': 'testing/java.7/java/lang/String.java',
        'java.lang.Object': 'testing/java.7/java/lang/Object.java',
        'java.lang.Integer': 'testing/java.7/java/lang/Integer.java',
        'java.StringEditor': 'testing/java.7/com/sun/beans/editors/StringEditor.java',
        'java.Deprecated': 'testing/java.7/com/sun/org/apache/bcel/internal/classfile/Deprecated.java',
        'java.ORBImpl': 'testing/java.7/com/sun/corba/se/impl/orb/ORBImpl.java',

        'error1': 'testing/src/java7srclisting/errors/ErrorV1.java',
        'error2': 'testing/src/java7srclisting/errors/ErrorV2.java',
        'error3': 'testing/src/java7srclisting/errors/ErrorV3.java',
        'error4': 'testing/src/java7srclisting/errors/ErrorV4.java',
        'error5': 'testing/src/java7srclisting/errors/ErrorV5.java',
        'error6': 'testing/src/java7srclisting/errors/ErrorV6.java',
        'error7': 'testing/src/java7srclisting/errors/ErrorV7.java',
        'error8': 'testing/src/java7srclisting/errors/ErrorV8.java',
        'error9': 'testing/src/java7srclisting/errors/ErrorV9.java',
        'error10': 'testing/src/java7srclisting/errors/ErrorV10.java',
        'error11': 'testing/src/java7srclisting/errors/ErrorV11.java',
        'error12': 'testing/src/java7srclisting/errors/ErrorV12.java',
        'error13': 'testing/src/java7srclisting/errors/ErrorV13.java',
        'error14': 'testing/src/java7srclisting/errors/ErrorV14.java',

        'java7source': 'java7source',
        'classes': 'classes'
    };
    const selectedFile = 'classes';
    const start = Date.now();
    const classes = [];
    if (selectedFile === 'java7source')
        for (let url of java7source) {
            const clz = await compileJavaSourceFile(url);
            if (!clz) {
                console.log('Found error, aborting.')
                break;
            }
            classes.push(clz);
        }
    else if (selectedFile === 'classes')
        for (let name of Object.keys(files))
            if (name === 'java7source' || name === 'classes') continue;
            else classes.push(await compileJavaSourceFile(files[name]));
    else
        classes.push(await compileJavaSourceFile(files[selectedFile]));
    const end = Date.now();
    console.log(`Execution time: ${end - start} ms`);

    console.log(`maxFields: ${maxFields}, classMaxField: ${classMaxField}`)
    console.log(`maxFunctions: ${maxFunctions}, classMaxFunctions: ${classMaxFunctions}`)
    console.log(`maxFunctionLength: ${maxFunctionLength}, classMaxFunctionLength: ${classMaxFunctionLength}`)

    // TODO: Verify every single class:
    //       1. package
    //       2. annotations
    //       3. class header (access, type, name, extends, implements, generics)
    //       4. class data:
    //          a. fields: annotations, access, type, name
    //          b. functions: annotations, access, type, name, arguments
    //          c. innerClasses: annotations, access, type, name, extends, implements, generics

    // for (let i = 0; i < classes.length; i++) {
    //     const obj = classes[i];
    //     const tops = obj.result.topLevelClasses;
    //     if (!tops) continue;
    //     for (let j = 0; j < tops.length; j++) {
    //         const clz = tops[j];
    //         if (i !== 0)
    //             continue;
    //         console.log(clz)
    //         const imports = clz.imports;
    //         if (imports.length <= 0)
    //             continue;
    //         for (let k = 0; k < imports.length; k++) {
    //             const imp = imports[k];
    //             if (imp.isStatic) continue;
    //             const name = imp.name;
    //             if (name.startsWith('compilertesting.')) continue;
    //             if (name.endsWith('.*')) {
    //                 // TODO: Special handling
    //                 continue;
    //             }
    //             console.log(`Searching for: ${name}`)
    //             const found = results.findClassByPkgAndName(name);
    //             found.access = JavacUtils.accessFlagsToString(found.access);
    //             console.log(`\tFound:`, found)
    //         }
    //     }
    // }

    // results.findClassByPkgAndName('java.io.File')

    // let n = 9223372036854775807;
    // console.log(n)

    // readClassFile('out/production/BrowserJVM/asmtesting/v1/TestV1.class').then(clz => {
    //     console.log('class loaded:', clz)
    //     if (!clz) return;
    //     readClassFile('out/production/BrowserJVM/asmtesting/v1/TestV1Super.class').then(clz2 => {
    //         console.log('class2 loaded:', clz2)
    //         readClassFile('out/production/BrowserJVM/asmtesting/v1/TestV1Itz1.class').then(clz3 => {
    //             console.log('class3 loaded:', clz3)
    //             readClassFile('out/production/BrowserJVM/asmtesting/v1/TestV1Itz2.class').then(clz4 => {
    //                 console.log('class4 loaded:', clz4)
    //                 addStaticClass(clz)
    //                 addStaticClass(clz2)
    //                 addStaticClass(clz3)
    //                 addStaticClass(clz4)
    //                 clz = clz.newInstance()
    //                 console.log('class instance:', clz)
    //             }).catch(error => {
    //                 console.error(error)
    //             });
    //         }).catch(error => {
    //             console.error(error)
    //         });
    //     }).catch(error => {
    //         console.error(error)
    //     });
    // }).catch(error => {
    //     console.error(error)
    // });

    // const clazzTestRoot = new JvmClass(Opcodes.ACC_PUBLIC, 'obzcu/re/TestRoot');
    // addStaticClass(clazzTestRoot);
    //
    // const pvsm = new JvmFunction(clazzTestRoot, Opcodes.ACC_PUBLIC | Opcodes.ACC_STATIC, 'main', '([Ljava/lang/String;)V'); {
    //     /*
    //         NEW asmtesting/v1/TestV1
    //         DUP
    //         INVOKESPECIAL asmtesting/v1/TestV1.<init> ()V
    //         POP
    //      */
    //     const insns = [];
    //     insns.push(new TypeInsnNode(Opcodes.NEW, clazzTestRoot.name));
    //     insns.push(new InsnNode(Opcodes.DUP));
    //     insns.push(new MethodInsnNode(Opcodes.INVOKESPECIAL, clazzTestRoot.name, '<init>', '()V', [], 'V', false));
    //     insns.push(new InsnNode(Opcodes.POP));
    //     insns.push(new InsnNode(Opcodes.RETURN));
    //     pvsm.load(insns);
    // }
    //
    // const constructor = new JvmFunction(clazzTestRoot, Opcodes.ACC_PUBLIC, '<init>', '()V'); {
    //     const insns = [];
    //     insns.push(new InsnNode(Opcodes.RETURN));
    //     constructor.load(insns);
    // }
    //
    // clazzTestRoot.load({}, {
    //     [pvsm.getFuncPath()]: pvsm,
    //     [constructor.getFuncPath()]: constructor
    // });
    //
    // const func = clazzTestRoot.findFunction('main', '([Ljava/lang/String;)V', true);
    // console.log(func.execute([JvmArray.of()]));

    // const clazzTestRoot = new JvmClass(Opcodes.ACC_PUBLIC, 'obzcu/re/TestRoot');
    // addStaticClass(clazzTestRoot);
    //
    // let testField = new JvmField(clazzTestRoot);
    // testField.asmLoad(Opcodes.ACC_PUBLIC | Opcodes.ACC_STATIC, 'abc', 'J', null, 69);
    //
    // const testFunction = new JvmFunction(clazzTestRoot, Opcodes.ACC_PUBLIC | Opcodes.ACC_STATIC, 'test', '(Lobzcu/re/TestRoot;)I'); {
    //     const insns = [];
    //     insns.push(new VarInsnNode(Opcodes.ALOAD, 0));
    //     insns.push(new MethodInsnNode(Opcodes.INVOKEVIRTUAL, clazzTestRoot.name, 'test2', '()I', [], 'I', false));
    //     insns.push(new InsnNode(Opcodes.IRETURN));
    //     testFunction.load(insns);
    // }
    //
    // const testFunction2 = new JvmFunction(clazzTestRoot, Opcodes.ACC_PUBLIC, 'test2', '()I'); {
    //     const insns = [];
    //     insns.push(new FieldInsnNode(Opcodes.GETSTATIC, clazzTestRoot.name, 'abc', 'J'));
    //     insns.push(new InsnNode(Opcodes.L2I));
    //     insns.push(new InsnNode(Opcodes.IRETURN));
    //     testFunction2.load(insns);
    // }
    //
    // clazzTestRoot.load(
    //     {[testField.getFieldPath()]: testField},
    //     {[testFunction.getFuncPath()]: testFunction, [testFunction2.getFuncPath()]: testFunction2}
    // );
    //
    // let clz = clazzTestRoot.newInstance();
    //
    // const func = clz.findFunction('test', '(Lobzcu/re/TestRoot;)I', true);
    // console.log(func.execute([clz]));
 
    // const c = JvmChar.of('a');
    // c.set(JvmChar.MAX_VALUE)
    // console.log(c.get()) // 65535
    // c.set(JvmChar.MAX_VALUE + 1)
    // console.log(c.get()) // 0
    // c.set(-1)
    // console.log(c.get()) // 65535

    // const abc = JvmInteger.of(123);
    // const def = JvmInteger.of(456);
    // const arr = JvmArray.of('JvmInteger', abc, def);
    // console.log(arr)
    // assertJvmType(1, arr, 'JvmArray<JvmNumber>')
    // console.log(arr.getItem(0))
    // arr.setItem(0, abc.set(321));
    // console.log(arr.getItem(0))
    // console.log(abc, def)

    // const arrTest = (true ? ['abc'] : []).concat([1, 2, 3]);
    // console.log(arrTest.concat([1, 2, 3]))
    //
    // const test = new JvmArray([], 'JvmBoolean', 1);
    // test.setItem(0, JvmBoolean.of(0))
    // console.log(test.getItem(0))
    //
    // const clazzTestRoot = new JvmClass(Opcodes.ACC_PUBLIC, 'obzcu/re/TestRoot');
    // const testField = new JvmField(clazzTestRoot, Opcodes.ACC_PUBLIC | Opcodes.ACC_STATIC, 'abc', 'I');
    // const testFunction = new JvmFunction(clazzTestRoot, Opcodes.ACC_PUBLIC, 'test', '(II)F'); {
    //     const insns = [];
    //     insns.push(new VarInsnNode(Opcodes.ILOAD, 1));
    //     insns.push(new InsnNode(Opcodes.I2F));
    //     insns.push(new VarInsnNode(Opcodes.ILOAD, 2));
    //     insns.push(new InsnNode(Opcodes.I2F));
    //     insns.push(new InsnNode(Opcodes.FMUL));
    //     insns.push(new InsnNode(Opcodes.FNEG));
    //     insns.push(new InsnNode(Opcodes.FRETURN));
    //     testFunction.load(insns);
    // }
    // clazzTestRoot.load(
    //     {[testField.getFieldPath()]: testField},
    //     {[testFunction.getFuncPath()]: testFunction}
    // );
    // let clz = clazzTestRoot.newInstance();
    // const func = clz.findFunction('test', '(II)F', false);
    //
    // console.log(func.execute([
    //     clz,
    //     JvmInteger.of(69)
    //     , JvmInteger.of(2)
    // ]));

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
    // {
    //     const itz1 = new JvmClass(Opcodes.ACC_INTERFACE, 'obzcu/re/TestItz1');
    //     addStaticClass(itz1);
    //     itz1.load({}, {});
    //
    //     const itz2 = new JvmClass(Opcodes.ACC_INTERFACE, 'obzcu/re/TestItz2');
    //     addStaticClass(itz2);
    //     itz2.load({}, {});
    //
    //     const supr = new JvmClass(Opcodes.ACC_ABSTRACT, 'obzcu/re/TestSuper'); {
    //         const field = new JvmField(supr, Opcodes.ACC_PUBLIC | Opcodes.ACC_STATIC,
    //             'abc', 'Ljava/lang/Object;');
    //         supr.load({[field.getFieldPath()]: field}, {});
    //     }
    //     addStaticClass(supr);
    //
    //     let clz = new JvmClass(0, 'obzcu/re/TestRoot', supr, [itz1, itz2]);
    //     clz.load({}, {});
    //     addStaticClass(clz);
    //
    //     let field = clz.findField('abc', 'Ljava/lang/Object;', true);
    //     field.setValue(JvmDouble.of(1.234))
    //     // console.log(field.get())
    //
    //     // console.log(clz, clz.uniqueIdentifier)
    //     // console.log(clz.newInstance(), clz.newInstance().uniqueIdentifier)
    //     clz = clz.newInstance()
    //     field = clz.findField('abc', 'Ljava/lang/Object;', true);
    //     field.setValue(JvmInteger.of(123))
    //     console.log(field.get())
    //
    //     const clzSuper = clz.castTo(supr);
    //     console.log('clzSuper', clzSuper.findField('abc', 'Ljava/lang/Object;', true))
    //
    //     const clzItz1 = clz.castTo(itz1);
    //     console.log('clzItz1', clzItz1.findField('abc', 'Ljava/lang/Object;', true))
    //
    //     const clzItz2 = clz.castTo(itz2);
    //     console.log('clzItz2', clzItz2.findField('abc', 'Ljava/lang/Object;', true))
    //
    //     const fromSuperToClz = clzSuper.castTo(clz);
    //     console.log('fromSuperToClz', fromSuperToClz.findField('abc', 'Ljava/lang/Object;', true)?.get()?.get())
    //
    //     const fromItz1ToClz = clzItz1.castTo(clz);
    //     console.log('fromItz1ToClz', fromItz1ToClz.findField('abc', 'Ljava/lang/Object;', true)?.get()?.get())
    //
    //     field.setValue(JvmInteger.of(456))
    //     const fromItz2ToClz = clzItz2.castTo(clz);
    //     console.log('fromItz2ToClz', fromItz2ToClz.findField('abc', 'Ljava/lang/Object;', true)?.get()?.get())

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
    // }

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