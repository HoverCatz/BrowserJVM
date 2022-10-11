const toShort = num =>
{
    const int16 = new Int16Array(1);
    int16[0] = num;
    return int16[0];
}

const Symbols = {
    CONSTANT_FIELDREF_TAG: 9,
    CONSTANT_METHODREF_TAG: 10,
    CONSTANT_INTERFACE_METHODREF_TAG: 11,
    CONSTANT_INTEGER_TAG: 3,
    CONSTANT_FLOAT_TAG: 4,
    CONSTANT_NAME_AND_TYPE_TAG: 12,

    CONSTANT_DYNAMIC_TAG: 17,

    CONSTANT_INVOKE_DYNAMIC_TAG: 18,

    CONSTANT_LONG_TAG: 5,
    CONSTANT_DOUBLE_TAG: 6,

    CONSTANT_UTF8_TAG: 1,

    CONSTANT_METHOD_HANDLE_TAG: 15,

    CONSTANT_CLASS_TAG: 7,
    CONSTANT_STRING_TAG: 8,
    CONSTANT_METHOD_TYPE_TAG: 16,
    CONSTANT_PACKAGE_TAG: 20,
    CONSTANT_MODULE_TAG: 19
}

class Opcodes {
    static V1_1 = 3 << 16 | 45;
    static V1_2 = 0 << 16 | 46;
    static V1_3 = 0 << 16 | 47;
    static V1_4 = 0 << 16 | 48;
    static V1_5 = 0 << 16 | 49;
    static V1_6 = 0 << 16 | 50;
    static V1_7 = 0 << 16 | 51;
    static V1_8 = 0 << 16 | 52;
    static V9 = 0 << 16 | 53;
    static V10 = 0 << 16 | 54;
    static V11 = 0 << 16 | 55;
    static V12 = 0 << 16 | 56;
    static V13 = 0 << 16 | 57;
    static V14 = 0 << 16 | 58;
    static V15 = 0 << 16 | 59;
    static V16 = 0 << 16 | 60;
    static V17 = 0 << 16 | 61;
    static V18 = 0 << 16 | 62;

    static ACC_PUBLIC = 0x0001; // class, field, method
    static ACC_PRIVATE = 0x0002; // class, field, method
    static ACC_PROTECTED = 0x0004; // class, field, method
    static ACC_STATIC = 0x0008; // field, method
    static ACC_FINAL = 0x0010; // class, field, method, parameter
    static ACC_SUPER = 0x0020; // class
    static ACC_SYNCHRONIZED = 0x0020; // method
    static ACC_OPEN = 0x0020; // module
    static ACC_TRANSITIVE = 0x0020; // module requires
    static ACC_VOLATILE = 0x0040; // field
    static ACC_BRIDGE = 0x0040; // method
    static ACC_STATIC_PHASE = 0x0040; // module requires
    static ACC_VARARGS = 0x0080; // method
    static ACC_TRANSIENT = 0x0080; // field
    static ACC_NATIVE = 0x0100; // method
    static ACC_INTERFACE = 0x0200; // class
    static ACC_ABSTRACT = 0x0400; // class, method
    static ACC_STRICT = 0x0800; // method
    static ACC_SYNTHETIC = 0x1000; // class, field, method, parameter, module *
    static ACC_ANNOTATION = 0x2000; // class
    static ACC_ENUM = 0x4000; // class(?) field inner
    static ACC_MANDATED = 0x8000; // field, method, parameter, module, module *
    static ACC_MODULE = 0x8000; // class
    static ACC_RECORD = 0x10000; // class
    static ACC_DEPRECATED = 0x20000; // class, field, method

    static NOP = 0;
    static ACONST_NULL = 1;
    static ICONST_M1 = 2;
    static ICONST_0 = 3;
    static ICONST_1 = 4;
    static ICONST_2 = 5;
    static ICONST_3 = 6;
    static ICONST_4 = 7;
    static ICONST_5 = 8;
    static LCONST_0 = 9;
    static LCONST_1 = 10;
    static FCONST_0 = 11;
    static FCONST_1 = 12;
    static FCONST_2 = 13;
    static DCONST_0 = 14;
    static DCONST_1 = 15;
    static BIPUSH = 16;
    static SIPUSH = 17;
    static LDC = 18;
    static LDC_W = 19;
    static LDC2_W = 20;
    static ILOAD = 21;
    static LLOAD = 22;
    static FLOAD = 23;
    static DLOAD = 24;
    static ALOAD = 25;
    static ILOAD_0 = 26;
    static ILOAD_1 = 27;
    static ILOAD_2 = 28;
    static ILOAD_3 = 29;
    static LLOAD_0 = 30;
    static LLOAD_1 = 31;
    static LLOAD_2 = 32;
    static LLOAD_3 = 33;
    static FLOAD_0 = 34;
    static FLOAD_1 = 35;
    static FLOAD_2 = 36;
    static FLOAD_3 = 37;
    static DLOAD_0 = 38;
    static DLOAD_1 = 39;
    static DLOAD_2 = 40;
    static DLOAD_3 = 41;
    static ALOAD_0 = 42;
    static ALOAD_1 = 43;
    static ALOAD_2 = 44;
    static ALOAD_3 = 45;
    static IALOAD = 46;
    static LALOAD = 47;
    static FALOAD = 48;
    static DALOAD = 49;
    static AALOAD = 50;
    static BALOAD = 51;
    static CALOAD = 52;
    static SALOAD = 53;
    static ISTORE = 54;
    static LSTORE = 55;
    static FSTORE = 56;
    static DSTORE = 57;
    static ASTORE = 58;
    static ISTORE_0 = 59;
    static ISTORE_1 = 60;
    static ISTORE_2 = 61;
    static ISTORE_3 = 62;
    static LSTORE_0 = 63;
    static LSTORE_1 = 64;
    static LSTORE_2 = 65;
    static LSTORE_3 = 66;
    static FSTORE_0 = 67;
    static FSTORE_1 = 68;
    static FSTORE_2 = 69;
    static FSTORE_3 = 70;
    static DSTORE_0 = 71;
    static DSTORE_1 = 72;
    static DSTORE_2 = 73;
    static DSTORE_3 = 74;
    static ASTORE_0 = 75;
    static ASTORE_1 = 76;
    static ASTORE_2 = 77;
    static ASTORE_3 = 78;
    static IASTORE = 79;
    static LASTORE = 80;
    static FASTORE = 81;
    static DASTORE = 82;
    static AASTORE = 83;
    static BASTORE = 84;
    static CASTORE = 85;
    static SASTORE = 86;
    static POP = 87;
    static POP2 = 88;
    static DUP = 89;
    static DUP_X1 = 90;
    static DUP_X2 = 91;
    static DUP2 = 92;
    static DUP2_X1 = 93;
    static DUP2_X2 = 94;
    static SWAP = 95;
    static IADD = 96;
    static LADD = 97;
    static FADD = 98;
    static DADD = 99;
    static ISUB = 100;
    static LSUB = 101;
    static FSUB = 102;
    static DSUB = 103;
    static IMUL = 104;
    static LMUL = 105;
    static FMUL = 106;
    static DMUL = 107;
    static IDIV = 108;
    static LDIV = 109;
    static FDIV = 110;
    static DDIV = 111;
    static IREM = 112;
    static LREM = 113;
    static FREM = 114;
    static DREM = 115;
    static INEG = 116;
    static LNEG = 117;
    static FNEG = 118;
    static DNEG = 119;
    static ISHL = 120;
    static LSHL = 121;
    static ISHR = 122;
    static LSHR = 123;
    static IUSHR = 124;
    static LUSHR = 125;
    static IAND = 126;
    static LAND = 127;
    static IOR = 128;
    static LOR = 129;
    static IXOR = 130;
    static LXOR = 131;
    static IINC = 132;
    static I2L = 133;
    static I2F = 134;
    static I2D = 135;
    static L2I = 136;
    static L2F = 137;
    static L2D = 138;
    static F2I = 139;
    static F2L = 140;
    static F2D = 141;
    static D2I = 142;
    static D2L = 143;
    static D2F = 144;
    static I2B = 145;
    static I2C = 146;
    static I2S = 147;
    static LCMP = 148;
    static FCMPL = 149;
    static FCMPG = 150;
    static DCMPL = 151;
    static DCMPG = 152;
    static IFEQ = 153;
    static IFNE = 154;
    static IFLT = 155;
    static IFGE = 156;
    static IFGT = 157;
    static IFLE = 158;
    static IF_ICMPEQ = 159;
    static IF_ICMPNE = 160;
    static IF_ICMPLT = 161;
    static IF_ICMPGE = 162;
    static IF_ICMPGT = 163;
    static IF_ICMPLE = 164;
    static IF_ACMPEQ = 165;
    static IF_ACMPNE = 166;
    static GOTO = 167;
    static JSR = 168;
    static RET = 169;
    static TABLESWITCH = 170;
    static LOOKUPSWITCH = 171;
    static IRETURN = 172;
    static LRETURN = 173;
    static FRETURN = 174;
    static DRETURN = 175;
    static ARETURN = 176;
    static RETURN = 177;
    static GETSTATIC = 178;
    static PUTSTATIC = 179;
    static GETFIELD = 180;
    static PUTFIELD = 181;
    static INVOKEVIRTUAL = 182;
    static INVOKESPECIAL = 183;
    static INVOKESTATIC = 184;
    static INVOKEINTERFACE = 185;
    static INVOKEDYNAMIC = 186;
    static NEW = 187;
    static NEWARRAY = 188;
    static ANEWARRAY = 189;
    static ARRAYLENGTH = 190;
    static ATHROW = 191;
    static CHECKCAST = 192;
    static INSTANCEOF = 193;
    static MONITORENTER = 194;
    static MONITOREXIT = 195;
    static MULTIANEWARRAY = 197;
    static IFNULL = 198;
    static IFNONNULL = 199;
}

const OpcodesReverse = { };
for (const op in Opcodes)
    OpcodesReverse[Opcodes[op]] = op;

const countMethodDescArguments = (desc) =>
{
    let idx = desc.indexOf('(') + 1;
    desc = desc.substring(idx);
    idx = desc.indexOf(')');
    desc = desc.substring(0, idx);
    if (desc.length === 0)
        return 0;
    desc = '(' + desc + ')';
    let numArgumentTypes = 0;
    let currentOffset = 1;
    while (desc[currentOffset] !== ')')
    {
        while (desc[currentOffset] === '[')
            currentOffset++;
        if (desc[currentOffset++] === 'L')
        {
            let semiColumnOffset = desc.indexOf(';', currentOffset);
            currentOffset = Math.max(currentOffset, semiColumnOffset + 1);
        }
        ++numArgumentTypes;
    }
    return numArgumentTypes;
}

class JvmLabel {
    constructor(index, lineNumber = false) {
        this.index = index;
        this.lineNumber = lineNumber;
    }
    getIndex()
    {
        return this.index;
    }
    getLineNumber()
    {
        return this.lineNumber;
    }
    static createLabel(index, lineNumber = false)
    {
        return new JvmLabel(index, lineNumber);
    }
}

const mappingsLeft = {
    'I': 'int',
    'V': 'void',
    'Ljava/lang/String;': 'String',
}
const mappingsRight = {
    'int': 'I',
    'void': 'V',
    'String': 'Ljava/lang/String;',
}

const readByte = (arr, offset) => {
    return arr[offset] & 0xFF;
}
const readUnsignedShort = (arr, offset) => {
    return ((arr[offset] & 0xFF) << 8) | (arr[offset + 1] & 0xFF);
}
const readShort = (arr, offset) => {
    return toShort(((arr[offset] & 0xFF) << 8) | (arr[offset + 1] & 0xFF));
}
const readUInt = (arr, offset) => {
    // TODO: Optimize this lmao
    const bytes = [
        readByte(arr, offset + 3),
        readByte(arr, offset + 2),
        readByte(arr, offset + 1),
        readByte(arr, offset)
    ];
    let r = 0;
    for (let i = 3; i >= 0; i--)
        r |= bytes[i] << (i * 8);
    return r >>> 0;
}

const debug = 0;
const classes = { };

const parseClassFile = async arr =>
{
    const clazz = new JvmClass();

    const classFileOffset = 0;

    const magic = readUInt(arr, 0);
    if (magic !== 0xCAFEBABE)
    {
        if (debug) console.log("Wrong magic value: " + magic);
        return false;
    }
    if (debug) console.log("magic: 0xCAFEBABE :)");

    const minor = readUnsignedShort(arr, classFileOffset + 4);
    if (debug) console.log("Minor: " + minor);

    const major = readUnsignedShort(arr, classFileOffset + 6);
    if (debug) console.log("Major: " + major);

    const cpCount = readUnsignedShort(arr, classFileOffset + 8);
    if (debug) console.log("cpCount: " + cpCount);

    let hasBootstrapMethods;
    let hasConstantDynamic;
    let currentMaxStringLength = 0;

    const cpInfoOffsets = [...Array(cpCount)].map(_ => null);
    const constantUtf8Values = [...Array(cpCount)].map(_ => null);

    let currentCpInfoIndex = 1;
    let currentCpInfoOffset = classFileOffset + 10;
    while (currentCpInfoIndex < cpCount)
    {
        cpInfoOffsets[currentCpInfoIndex++] = currentCpInfoOffset + 1;
        const tag = readByte(arr, currentCpInfoOffset);
        let cpInfoSize;
        switch (tag)
        {
            case Symbols.CONSTANT_FIELDREF_TAG: // 9
            case Symbols.CONSTANT_METHODREF_TAG: // 10
            case Symbols.CONSTANT_INTERFACE_METHODREF_TAG: // 11
            case Symbols.CONSTANT_INTEGER_TAG: // 3
            case Symbols.CONSTANT_FLOAT_TAG: // 4
            case Symbols.CONSTANT_NAME_AND_TYPE_TAG: // 12
                cpInfoSize = 5;
                break;
            case Symbols.CONSTANT_DYNAMIC_TAG: // 17
                cpInfoSize = 5;
                hasBootstrapMethods = true;
                hasConstantDynamic = true;
                break;
            case Symbols.CONSTANT_INVOKE_DYNAMIC_TAG: // 18
                cpInfoSize = 5;
                hasBootstrapMethods = true;
                break;
            case Symbols.CONSTANT_LONG_TAG: // 5
            case Symbols.CONSTANT_DOUBLE_TAG: // 6
                cpInfoSize = 9;
                currentCpInfoIndex++;
                break;
            case Symbols.CONSTANT_UTF8_TAG: // 1
                cpInfoSize = 3 + readUnsignedShort(arr, currentCpInfoOffset + 1);
                if (cpInfoSize > currentMaxStringLength)
                    currentMaxStringLength = cpInfoSize;
                break;
            case Symbols.CONSTANT_METHOD_HANDLE_TAG: // 15
                cpInfoSize = 4;
                break;
            case Symbols.CONSTANT_CLASS_TAG: // 7
            case Symbols.CONSTANT_STRING_TAG: //8
            case Symbols.CONSTANT_METHOD_TYPE_TAG: // 16
            case Symbols.CONSTANT_PACKAGE_TAG: // 20
            case Symbols.CONSTANT_MODULE_TAG: // 19
                cpInfoSize = 3;
                break;
        }
        currentCpInfoOffset += cpInfoSize;
    }

    const readClass = offset => readStringish(offset);
    const readStringish = offset => readUTF8(cpInfoOffsets[readUnsignedShort(arr, offset)]);
    const readUTF8 = offset =>
    {
        const cpPoolEntryIndex = readUnsignedShort(arr, offset);
        if (offset === 0 || cpPoolEntryIndex === 0)
            return null;
        return readUtf(cpPoolEntryIndex);
    }
    const readUtf = cpPoolEntryIndex =>
    {
        const value = constantUtf8Values[cpPoolEntryIndex];
        if (value !== null)
            return value;
        const cpInfoOffset = cpInfoOffsets[cpPoolEntryIndex];
        return constantUtf8Values[cpPoolEntryIndex] = readUtf2(cpInfoOffset + 2, readUnsignedShort(arr, cpInfoOffset));
    }
    const readUtf2 = (utfOffset, utfLength) =>
    {
        let currentOffset = utfOffset;
        let endOffset = currentOffset + utfLength;
        let result = '';
        for (; currentOffset < endOffset; )
        {
            const currentByte = readByte(arr, currentOffset++);
            if ((currentByte & 0x80) === 0)
                result += String.fromCharCode(currentByte & 0x7F);
            else
            if ((currentByte & 0xE0) === 0xC0)
                result += String.fromCharCode(((currentByte & 0x1F) << 6) + (readByte(arr, currentOffset++) & 0x3F));
            else
                result += String.fromCharCode(((currentByte & 0xF) << 12) + ((readByte(arr, currentOffset++) & 0x3F) << 6) + (readByte(arr, currentOffset++) & 0x3F));
        }
        return result;
    }
    const getTypeDescriptor = (desc) =>
    {
        if (desc.startsWith('['))
            return desc;
        return 'L' + desc + ';';
    }
    const getMethodDescriptor = (desc) =>
    {
        if (desc.startsWith('['))
            return desc;
        return 'L' + desc + ';';
    }
    const readConst = (constantPoolEntryIndex) =>
    {
        let cpInfoOffset = cpInfoOffsets[constantPoolEntryIndex];
        switch (arr[cpInfoOffset - 1])
        {
            case 3:
            case 4:
            case 5:
            case 6: return readUInt(arr, cpInfoOffset);
            case 7: return getTypeDescriptor(readUTF8(cpInfoOffset));
            case 8: return readUTF8(cpInfoOffset);

            /* Java8 stuff? */
            case 15:
            case 16:
            case 17: throw new Error("Not supported.");
        }
        return '';
    }
    const readField = (fieldInfoOffset) =>
    {
        let currentOffset = fieldInfoOffset;
        const accessFlags = readUnsignedShort(arr, currentOffset);
        const name = readUTF8(currentOffset + 2);
        const descriptor = readUTF8(currentOffset + 4);
        currentOffset += 6;

        // if (debug)
            if (debug) console.log('>>> ' + name + ' : ' + descriptor);
        clazz.addField(accessFlags, name, descriptor);

        const attributesCount = readUnsignedShort(arr, currentOffset);
        currentOffset += 2;
        for (let i = 0; i < attributesCount; i++)
        {
            const attributeName = readUTF8(currentOffset);
            const attributeLength = readUInt(arr, currentOffset + 2);
            currentOffset += 6;

            currentOffset += attributeLength;
        }

        return currentOffset;
    }
    const readMethod = (currentOffset) =>
    {
        let currentMethodAccessFlags = readUnsignedShort(arr, currentOffset);
        const currentMethodName = readUTF8(currentOffset + 2);
        const currentMethodDescriptor = readUTF8(currentOffset + 4);
        currentOffset += 6;

        if (debug) console.log(currentMethodName + ' : ' + currentMethodDescriptor);

        let codeOffset = 0;
        let exceptionsOffset = 0;
        let exceptions = null;
        let synthetic = false;
        let signatureIndex = 0;
        let annotationDefaultOffset = 0;

        const attributesCount = readUnsignedShort(arr, currentOffset);
        currentOffset += 2;

        for (let i = 0; i < attributesCount; i++)
        {
            const attributeName = readUTF8(currentOffset);
            const attributeLength = readUInt(arr, currentOffset + 2);
            currentOffset += 6;
            if (attributeName === "Code")
                codeOffset = currentOffset;
            else if (attributeName === "Exceptions")
            {
                exceptionsOffset = currentOffset;
                exceptions = [...Array(readUnsignedShort(arr, exceptionsOffset))].map(_ => null);
                let currentExceptionOffset = exceptionsOffset + 2;
                for (let i = 0; i < exceptions.length; ++i)
                {
                    exceptions[i] = readClass(currentExceptionOffset);
                    currentExceptionOffset += 2;
                }
            }
            else if (attributeName === "Signature")
                signatureIndex = readUnsignedShort(arr, currentOffset);
            else if (attributeName === "Deprecated")
                currentMethodAccessFlags |= Opcodes.ACC_DEPRECATED;
            else if (attributeName === "RuntimeVisibleAnnotations")
                runtimeVisibleAnnotationsOffset = currentOffset;
            else if (attributeName === "RuntimeVisibleTypeAnnotations")
                runtimeVisibleTypeAnnotationsOffset = currentOffset;
            else if (attributeName === "AnnotationDefault")
                annotationDefaultOffset = currentOffset;
            else if (attributeName === "Synthetic")
            {
                synthetic = true;
                currentMethodAccessFlags |= Opcodes.ACC_SYNTHETIC;
            }
            currentOffset += attributeLength;
        }

        if (codeOffset !== 0)
        {
            const [ insns, tryCatchBlocks ] = readCode(codeOffset, currentMethodName);
            clazz.load(currentMethodName, currentMethodDescriptor, {}, insns, tryCatchBlocks);
            clazz.addMethod(accessFlags, currentMethodName, currentMethodDescriptor);
        }

        return currentOffset;
    }
    const readCode = (codeOffset, currentMethodName) =>
    {
        let currentOffset = codeOffset;

        const minorVersion = readUnsignedShort(arr, 4);
        const majorVersion = readUnsignedShort(arr, 6);

        let maxStack;
        let maxLocals;
        let codeLength;

        // Thx ItzSomebody <3
        if (majorVersion === 45 && minorVersion <= 2) {
            maxStack = readByte(arr, currentOffset);
            maxLocals = readByte(arr, currentOffset + 1);
            codeLength = readUnsignedShort(arr, currentOffset + 2);
            currentOffset += 4;
        } else {
            maxStack = readUnsignedShort(arr, currentOffset);
            maxLocals = readUnsignedShort(arr, currentOffset + 2);
            codeLength = readUInt(arr, currentOffset + 4);
            currentOffset += 8;
        }

        if (debug) console.log(maxStack, maxLocals, codeLength, currentOffset);

        const bytecodeStartOffset = currentOffset;
        const bytecodeEndOffset = currentOffset + codeLength;
        const currentMethodLabels = [...Array(codeLength + 1)].map(_ => null);
        const labels = currentMethodLabels;

        let k = -1;
        while (currentOffset < bytecodeEndOffset)
        {
            k++;

            const bytecodeOffset = currentOffset - bytecodeStartOffset;
            const opcode = arr[currentOffset] & 0xFF;
            switch (opcode) {
                case Opcodes.NOP:
                case Opcodes.ACONST_NULL:
                case Opcodes.ICONST_M1:
                case Opcodes.ICONST_0:
                case Opcodes.ICONST_1:
                case Opcodes.ICONST_2:
                case Opcodes.ICONST_3:
                case Opcodes.ICONST_4:
                case Opcodes.ICONST_5:
                case Opcodes.LCONST_0:
                case Opcodes.LCONST_1:
                case Opcodes.FCONST_0:
                case Opcodes.FCONST_1:
                case Opcodes.FCONST_2:
                case Opcodes.DCONST_0:
                case Opcodes.DCONST_1:
                case Opcodes.IALOAD:
                case Opcodes.LALOAD:
                case Opcodes.FALOAD:
                case Opcodes.DALOAD:
                case Opcodes.AALOAD:
                case Opcodes.BALOAD:
                case Opcodes.CALOAD:
                case Opcodes.SALOAD:
                case Opcodes.IASTORE:
                case Opcodes.LASTORE:
                case Opcodes.FASTORE:
                case Opcodes.DASTORE:
                case Opcodes.AASTORE:
                case Opcodes.BASTORE:
                case Opcodes.CASTORE:
                case Opcodes.SASTORE:
                case Opcodes.POP:
                case Opcodes.POP2:
                case Opcodes.DUP:
                case Opcodes.DUP_X1:
                case Opcodes.DUP_X2:
                case Opcodes.DUP2:
                case Opcodes.DUP2_X1:
                case Opcodes.DUP2_X2:
                case Opcodes.SWAP:
                case Opcodes.IADD:
                case Opcodes.LADD:
                case Opcodes.FADD:
                case Opcodes.DADD:
                case Opcodes.ISUB:
                case Opcodes.LSUB:
                case Opcodes.FSUB:
                case Opcodes.DSUB:
                case Opcodes.IMUL:
                case Opcodes.LMUL:
                case Opcodes.FMUL:
                case Opcodes.DMUL:
                case Opcodes.IDIV:
                case Opcodes.LDIV:
                case Opcodes.FDIV:
                case Opcodes.DDIV:
                case Opcodes.IREM:
                case Opcodes.LREM:
                case Opcodes.FREM:
                case Opcodes.DREM:
                case Opcodes.INEG:
                case Opcodes.LNEG:
                case Opcodes.FNEG:
                case Opcodes.DNEG:
                case Opcodes.ISHL:
                case Opcodes.LSHL:
                case Opcodes.ISHR:
                case Opcodes.LSHR:
                case Opcodes.IUSHR:
                case Opcodes.LUSHR:
                case Opcodes.IAND:
                case Opcodes.LAND:
                case Opcodes.IOR:
                case Opcodes.LOR:
                case Opcodes.IXOR:
                case Opcodes.LXOR:
                case Opcodes.I2L:
                case Opcodes.I2F:
                case Opcodes.I2D:
                case Opcodes.L2I:
                case Opcodes.L2F:
                case Opcodes.L2D:
                case Opcodes.F2I:
                case Opcodes.F2L:
                case Opcodes.F2D:
                case Opcodes.D2I:
                case Opcodes.D2L:
                case Opcodes.D2F:
                case Opcodes.I2B:
                case Opcodes.I2C:
                case Opcodes.I2S:
                case Opcodes.LCMP:
                case Opcodes.FCMPL:
                case Opcodes.FCMPG:
                case Opcodes.DCMPL:
                case Opcodes.DCMPG:
                case Opcodes.IRETURN:
                case Opcodes.LRETURN:
                case Opcodes.FRETURN:
                case Opcodes.DRETURN:
                case Opcodes.ARETURN:
                case Opcodes.RETURN:
                case Opcodes.ARRAYLENGTH:
                case Opcodes.ATHROW:
                case Opcodes.MONITORENTER:
                case Opcodes.MONITOREXIT:
                case Opcodes.ILOAD_0:
                case Opcodes.ILOAD_1:
                case Opcodes.ILOAD_2:
                case Opcodes.ILOAD_3:
                case Opcodes.LLOAD_0:
                case Opcodes.LLOAD_1:
                case Opcodes.LLOAD_2:
                case Opcodes.LLOAD_3:
                case Opcodes.FLOAD_0:
                case Opcodes.FLOAD_1:
                case Opcodes.FLOAD_2:
                case Opcodes.FLOAD_3:
                case Opcodes.DLOAD_0:
                case Opcodes.DLOAD_1:
                case Opcodes.DLOAD_2:
                case Opcodes.DLOAD_3:
                case Opcodes.ALOAD_0:
                case Opcodes.ALOAD_1:
                case Opcodes.ALOAD_2:
                case Opcodes.ALOAD_3:
                case Opcodes.ISTORE_0:
                case Opcodes.ISTORE_1:
                case Opcodes.ISTORE_2:
                case Opcodes.ISTORE_3:
                case Opcodes.LSTORE_0:
                case Opcodes.LSTORE_1:
                case Opcodes.LSTORE_2:
                case Opcodes.LSTORE_3:
                case Opcodes.FSTORE_0:
                case Opcodes.FSTORE_1:
                case Opcodes.FSTORE_2:
                case Opcodes.FSTORE_3:
                case Opcodes.DSTORE_0:
                case Opcodes.DSTORE_1:
                case Opcodes.DSTORE_2:
                case Opcodes.DSTORE_3:
                case Opcodes.ASTORE_0:
                case Opcodes.ASTORE_1:
                case Opcodes.ASTORE_2:
                case Opcodes.ASTORE_3:
                    currentOffset += 1;
                    break;
                case Opcodes.IFEQ:
                case Opcodes.IFNE:
                case Opcodes.IFLT:
                case Opcodes.IFGE:
                case Opcodes.IFGT:
                case Opcodes.IFLE:
                case Opcodes.IF_ICMPEQ:
                case Opcodes.IF_ICMPNE:
                case Opcodes.IF_ICMPLT:
                case Opcodes.IF_ICMPGE:
                case Opcodes.IF_ICMPGT:
                case Opcodes.IF_ICMPLE:
                case Opcodes.IF_ACMPEQ:
                case Opcodes.IF_ACMPNE:
                case Opcodes.GOTO:
                case Opcodes.JSR:
                case Opcodes.IFNULL:
                case Opcodes.IFNONNULL: {

                    const idx = bytecodeOffset + readShort(arr, currentOffset + 1);
                    labels[idx] = labels[idx] || JvmLabel.createLabel(idx);
                    // createLabel(bytecodeOffset + readShort(arr, currentOffset + 1), labels);

                    currentOffset += 3;
                } break;
                case Opcodes.TABLESWITCH:
                    currentOffset += 4 - (bytecodeOffset & 3);
                    // createLabel(bytecodeOffset + readUInt(arr, currentOffset), labels);
                    let numTableEntries = readUInt(arr, currentOffset + 8) - readUInt(arr, currentOffset + 4) + 1;
                    currentOffset += 12;
                    while (numTableEntries-- > 0)
                    {

                        const idx = bytecodeOffset + readUInt(arr, currentOffset);
                        labels[idx] = labels[idx] || JvmLabel.createLabel(idx);
                        // createLabel(bytecodeOffset + readUInt(arr, currentOffset), labels);

                        currentOffset += 4;
                    }
                    break;
                case Opcodes.LOOKUPSWITCH:
                    currentOffset += 4 - (bytecodeOffset & 3);

                    const idx = bytecodeOffset + readUInt(arr, currentOffset);
                    labels[idx] = labels[idx] || JvmLabel.createLabel(idx);
                    // createLabel(bytecodeOffset + readUInt(arr, currentOffset), labels);

                    let numSwitchCases = readUInt(arr, currentOffset + 4);
                    currentOffset += 8;
                    while (numSwitchCases-- > 0)
                    {

                        const idx = bytecodeOffset + readUInt(arr, currentOffset + 4);
                        labels[idx] = labels[idx] || JvmLabel.createLabel(idx);
                        // createLabel(bytecodeOffset + readUInt(arr, currentOffset + 4), labels);

                        currentOffset += 8;
                    }
                    break;
                case Opcodes.ILOAD:
                case Opcodes.LLOAD:
                case Opcodes.FLOAD:
                case Opcodes.DLOAD:
                case Opcodes.ALOAD:
                case Opcodes.ISTORE:
                case Opcodes.LSTORE:
                case Opcodes.FSTORE:
                case Opcodes.DSTORE:
                case Opcodes.ASTORE:
                case Opcodes.RET:
                case Opcodes.BIPUSH:
                case Opcodes.NEWARRAY:
                case Opcodes.LDC:
                    currentOffset += 2;
                    break;
                case Opcodes.SIPUSH:
                case Opcodes.LDC_W:
                case Opcodes.LDC2_W:
                case Opcodes.GETSTATIC:
                case Opcodes.PUTSTATIC:
                case Opcodes.GETFIELD:
                case Opcodes.PUTFIELD:
                case Opcodes.INVOKEVIRTUAL:
                case Opcodes.INVOKESPECIAL:
                case Opcodes.INVOKESTATIC:
                case Opcodes.NEW:
                case Opcodes.ANEWARRAY:
                case Opcodes.CHECKCAST:
                case Opcodes.INSTANCEOF:
                case Opcodes.IINC:
                    currentOffset += 3;
                    break;
                case Opcodes.INVOKEINTERFACE:
                case Opcodes.INVOKEDYNAMIC:
                    currentOffset += 5;
                    break;
                case Opcodes.MULTIANEWARRAY:
                    currentOffset += 4;
                    break;
                default:
                    throw new Error("IllegalArgumentException");
            }
        }

        let exceptionTableLength = readUnsignedShort(arr, currentOffset);
        currentOffset += 2;

        const tryCatchBlocks = [...Array(exceptionTableLength)].map(_ => null);
        while (exceptionTableLength-- > 0)
        {
            let idx = readUnsignedShort(arr, currentOffset);
            const start = labels[idx] = JvmLabel.createLabel(idx);

            idx = readUnsignedShort(arr, currentOffset + 2);
            const end = labels[idx] = JvmLabel.createLabel(idx);

            idx = readUnsignedShort(arr, currentOffset + 4);
            const handler = labels[idx] = JvmLabel.createLabel(idx);

            // const start = createLabel(readUnsignedShort(arr, currentOffset), labels);
            // const end = createLabel(readUnsignedShort(arr, currentOffset + 2), labels);
            // const handler = createLabel(readUnsignedShort(arr, currentOffset + 4), labels);
            const catchType = readUTF8(cpInfoOffsets[readUnsignedShort(arr, currentOffset + 6)]);
            currentOffset += 8;

            tryCatchBlocks[exceptionTableLength] = [ start, end, handler, catchType ];
            // methodVisitor.visitTryCatchBlock(start, end, handler, catchType);
        }

        let stackMapFrameOffset = 0;
        let stackMapTableEndOffset = 0;
        let compressedFrames = true;
        let localVariableTableOffset = 0;
        let localVariableTypeTableOffset = 0;
        let visibleTypeAnnotationOffsets = null;
        let invisibleTypeAnnotationOffsets = null;
        let attributes = null;

        let attributesCount = readUnsignedShort(arr, currentOffset);
        currentOffset += 2;
        while (attributesCount-- > 0)
        {
            const attributeName = readUTF8(currentOffset);
            let attributeLength = readUInt(arr, currentOffset + 2);
            currentOffset += 6;
            if (attributeName === "LocalVariableTable")
            {
                localVariableTableOffset = currentOffset;
                let currentLocalVariableTableOffset = currentOffset;
                let localVariableTableLength = readUnsignedShort(arr, currentLocalVariableTableOffset);
                currentLocalVariableTableOffset += 2;
                while (localVariableTableLength-- > 0)
                {
                    let startPc = readUnsignedShort(arr, currentLocalVariableTableOffset);

                    // let idx = readUnsignedShort(arr, startPc);
                    // labels[idx] = JvmLabel.createLabel(idx);
                    // createDebugLabel(startPc, labels);

                    let length = readUnsignedShort(arr, currentLocalVariableTableOffset + 2);

                    // idx = readUnsignedShort(arr, startPc + length);
                    // labels[idx] = JvmLabel.createLabel(idx);
                    // createDebugLabel(startPc + length, labels);

                    currentLocalVariableTableOffset += 10;
                }
            }
            else if (attributeName === "LocalVariableTypeTable")
            {
                localVariableTypeTableOffset = currentOffset;
            }
            else if (attributeName === "LineNumberTable")
            {
                let currentLineNumberTableOffset = currentOffset;
                let lineNumberTableLength = readUnsignedShort(arr, currentLineNumberTableOffset);
                currentLineNumberTableOffset += 2;
                while (lineNumberTableLength-- > 0)
                {
                    let startPc = readUnsignedShort(arr, currentLineNumberTableOffset);
                    let lineNumber = readUnsignedShort(arr, currentLineNumberTableOffset + 2);
                    currentLineNumberTableOffset += 4;

                    // let idx = readUnsignedShort(arr, startPc);
                    // labels[idx] = JvmLabel.createLabel(idx, lineNumber);
                    // createDebugLabel(startPc, labels);
                    // labels[startPc].addLineNumber(lineNumber);

                }
            }
            else if (attributeName === "RuntimeVisibleTypeAnnotations")
            {
                // visibleTypeAnnotationOffsets =
                //     readTypeAnnotations(methodVisitor, context, currentOffset, /* visible = */ true);
            }
            else if (attributeName === "RuntimeInvisibleTypeAnnotations")
            {
                // invisibleTypeAnnotationOffsets =
                //     readTypeAnnotations(methodVisitor, context, currentOffset, /* visible = */ false);
            }
            else if (attributeName === "StackMapTable")
            {
                stackMapFrameOffset = currentOffset + 2;
                stackMapTableEndOffset = currentOffset + attributeLength;
            }
            else if (attributeName === "StackMap")
            {
                stackMapFrameOffset = currentOffset + 2;
                stackMapTableEndOffset = currentOffset + attributeLength;
                compressedFrames = false;
            }
            else
            {
                // Attribute attribute =
                //     readAttribute(
                //         context.attributePrototypes,
                //         attributeName,
                //         currentOffset,
                //         attributeLength,
                //         charBuffer,
                //         codeOffset,
                //         labels);
                // attribute.nextAttribute = attributes;
                // attributes = attribute;
            }
            currentOffset += attributeLength;
        }

        currentOffset = bytecodeStartOffset;
        if (debug) console.log(currentOffset);

        const insns = [ ];

        let index = -1;
        while (currentOffset < bytecodeEndOffset)
        {
            index++;
            const currentBytecodeOffset = currentOffset - bytecodeStartOffset;

            const currentLabel = labels[currentBytecodeOffset];
            if (currentLabel)
            {
                // currentLabel.accept(methodVisitor, (context.parsingOptions & SKIP_DEBUG) == 0);
                currentLabel.index = index;
            }

            let opcode = arr[currentOffset] & 0xFF;
            if (debug) console.log(opcode, currentMethodName, OpcodesReverse[opcode]);
            switch (opcode)
            {
                case Opcodes.NOP:
                case Opcodes.ACONST_NULL:
                case Opcodes.ICONST_M1:
                case Opcodes.ICONST_0:
                case Opcodes.ICONST_1:
                case Opcodes.ICONST_2:
                case Opcodes.ICONST_3:
                case Opcodes.ICONST_4:
                case Opcodes.ICONST_5:
                case Opcodes.LCONST_0:
                case Opcodes.LCONST_1:
                case Opcodes.FCONST_0:
                case Opcodes.FCONST_1:
                case Opcodes.FCONST_2:
                case Opcodes.DCONST_0:
                case Opcodes.DCONST_1:
                case Opcodes.IALOAD:
                case Opcodes.LALOAD:
                case Opcodes.FALOAD:
                case Opcodes.DALOAD:
                case Opcodes.AALOAD:
                case Opcodes.BALOAD:
                case Opcodes.CALOAD:
                case Opcodes.SALOAD:
                case Opcodes.IASTORE:
                case Opcodes.LASTORE:
                case Opcodes.FASTORE:
                case Opcodes.DASTORE:
                case Opcodes.AASTORE:
                case Opcodes.BASTORE:
                case Opcodes.CASTORE:
                case Opcodes.SASTORE:
                case Opcodes.POP:
                case Opcodes.POP2:
                case Opcodes.DUP:
                case Opcodes.DUP_X1:
                case Opcodes.DUP_X2:
                case Opcodes.DUP2:
                case Opcodes.DUP2_X1:
                case Opcodes.DUP2_X2:
                case Opcodes.SWAP:
                case Opcodes.IADD:
                case Opcodes.LADD:
                case Opcodes.FADD:
                case Opcodes.DADD:
                case Opcodes.ISUB:
                case Opcodes.LSUB:
                case Opcodes.FSUB:
                case Opcodes.DSUB:
                case Opcodes.IMUL:
                case Opcodes.LMUL:
                case Opcodes.FMUL:
                case Opcodes.DMUL:
                case Opcodes.IDIV:
                case Opcodes.LDIV:
                case Opcodes.FDIV:
                case Opcodes.DDIV:
                case Opcodes.IREM:
                case Opcodes.LREM:
                case Opcodes.FREM:
                case Opcodes.DREM:
                case Opcodes.INEG:
                case Opcodes.LNEG:
                case Opcodes.FNEG:
                case Opcodes.DNEG:
                case Opcodes.ISHL:
                case Opcodes.LSHL:
                case Opcodes.ISHR:
                case Opcodes.LSHR:
                case Opcodes.IUSHR:
                case Opcodes.LUSHR:
                case Opcodes.IAND:
                case Opcodes.LAND:
                case Opcodes.IOR:
                case Opcodes.LOR:
                case Opcodes.IXOR:
                case Opcodes.LXOR:
                case Opcodes.I2L:
                case Opcodes.I2F:
                case Opcodes.I2D:
                case Opcodes.L2I:
                case Opcodes.L2F:
                case Opcodes.L2D:
                case Opcodes.F2I:
                case Opcodes.F2L:
                case Opcodes.F2D:
                case Opcodes.D2I:
                case Opcodes.D2L:
                case Opcodes.D2F:
                case Opcodes.I2B:
                case Opcodes.I2C:
                case Opcodes.I2S:
                case Opcodes.LCMP:
                case Opcodes.FCMPL:
                case Opcodes.FCMPG:
                case Opcodes.DCMPL:
                case Opcodes.DCMPG:
                case Opcodes.IRETURN:
                case Opcodes.LRETURN:
                case Opcodes.FRETURN:
                case Opcodes.DRETURN:
                case Opcodes.ARETURN:
                case Opcodes.RETURN:
                case Opcodes.ARRAYLENGTH:
                case Opcodes.ATHROW:
                case Opcodes.MONITORENTER:
                case Opcodes.MONITOREXIT:
                    // methodVisitor.visitInsn(opcode);
                    insns.push({[opcode]: [ ]});
                    currentOffset += 1;
                    break;
                case Opcodes.ILOAD_0:
                case Opcodes.ILOAD_1:
                case Opcodes.ILOAD_2:
                case Opcodes.ILOAD_3:
                case Opcodes.LLOAD_0:
                case Opcodes.LLOAD_1:
                case Opcodes.LLOAD_2:
                case Opcodes.LLOAD_3:
                case Opcodes.FLOAD_0:
                case Opcodes.FLOAD_1:
                case Opcodes.FLOAD_2:
                case Opcodes.FLOAD_3:
                case Opcodes.DLOAD_0:
                case Opcodes.DLOAD_1:
                case Opcodes.DLOAD_2:
                case Opcodes.DLOAD_3:
                case Opcodes.ALOAD_0:
                case Opcodes.ALOAD_1:
                case Opcodes.ALOAD_2:
                case Opcodes.ALOAD_3: {
                    opcode -= Opcodes.ILOAD_0;
                    insns.push({[Opcodes.ILOAD + (opcode >> 2)]: opcode & 0x3});
                    // methodVisitor.visitVarInsn(Opcodes.ILOAD + (opcode >> 2), opcode & 0x3);
                    currentOffset += 1;
                } break;
                case Opcodes.ISTORE_0:
                case Opcodes.ISTORE_1:
                case Opcodes.ISTORE_2:
                case Opcodes.ISTORE_3:
                case Opcodes.LSTORE_0:
                case Opcodes.LSTORE_1:
                case Opcodes.LSTORE_2:
                case Opcodes.LSTORE_3:
                case Opcodes.FSTORE_0:
                case Opcodes.FSTORE_1:
                case Opcodes.FSTORE_2:
                case Opcodes.FSTORE_3:
                case Opcodes.DSTORE_0:
                case Opcodes.DSTORE_1:
                case Opcodes.DSTORE_2:
                case Opcodes.DSTORE_3:
                case Opcodes.ASTORE_0:
                case Opcodes.ASTORE_1:
                case Opcodes.ASTORE_2:
                case Opcodes.ASTORE_3: {
                    opcode -= Opcodes.ISTORE_0;
                    insns.push({[Opcodes.ISTORE + (opcode >> 2)]: opcode & 0x3});
                    // methodVisitor.visitVarInsn(Opcodes.ISTORE + (opcode >> 2), opcode & 0x3);
                    currentOffset += 1;
                } break;
                case Opcodes.IFEQ:
                case Opcodes.IFNE:
                case Opcodes.IFLT:
                case Opcodes.IFGE:
                case Opcodes.IFGT:
                case Opcodes.IFLE:
                case Opcodes.IF_ICMPEQ:
                case Opcodes.IF_ICMPNE:
                case Opcodes.IF_ICMPLT:
                case Opcodes.IF_ICMPGE:
                case Opcodes.IF_ICMPGT:
                case Opcodes.IF_ICMPLE:
                case Opcodes.IF_ACMPEQ:
                case Opcodes.IF_ACMPNE:
                case Opcodes.GOTO:
                case Opcodes.JSR:
                case Opcodes.IFNULL:
                case Opcodes.IFNONNULL:
                    // methodVisitor.visitJumpInsn(opcode, labels[currentBytecodeOffset + readShort(currentOffset + 1)]);
                    insns.push({[opcode]: labels[currentBytecodeOffset + readShort(arr, currentOffset + 1)]});
                    currentOffset += 3;
                    break;
                case Opcodes.TABLESWITCH:
                {
                    currentOffset += 4 - (currentBytecodeOffset & 3);
                    const defaultLabel = labels[currentBytecodeOffset + readUInt(arr, currentOffset)];
                    let low = readUInt(arr, currentOffset + 4);
                    let high = readUInt(arr, currentOffset + 8);
                    currentOffset += 12;
                    const table = [...Array(high - low + 1)].map(_ => null);
                    for (let i = 0; i < table.length; ++i)
                    {
                        table[i] = labels[currentBytecodeOffset + readUInt(arr, currentOffset)];
                        currentOffset += 4;
                    }
                    // methodVisitor.visitTableSwitchInsn(low, high, defaultLabel, table);
                    break;
                }
                case Opcodes.LOOKUPSWITCH:
                {
                    currentOffset += 4 - (currentBytecodeOffset & 3);
                    const defaultLabel = labels[currentBytecodeOffset + readUInt(arr, currentOffset)];
                    let numPairs = readUInt(arr, currentOffset + 4);
                    currentOffset += 8;
                    let keys = [...Array(numPairs)].map(_ => null);
                    let values = [...Array(numPairs)].map(_ => null);
                    for (let i = 0; i < numPairs; ++i)
                    {
                        keys[i] = readUInt(arr, currentOffset);
                        values[i] = labels[currentBytecodeOffset + readUInt(arr, currentOffset + 4)];
                        currentOffset += 8;
                    }
                    // methodVisitor.visitLookupSwitchInsn(defaultLabel, keys, values);
                    break;
                }
                case Opcodes.ILOAD:
                case Opcodes.LLOAD:
                case Opcodes.FLOAD:
                case Opcodes.DLOAD:
                case Opcodes.ALOAD:
                case Opcodes.ISTORE:
                case Opcodes.LSTORE:
                case Opcodes.FSTORE:
                case Opcodes.DSTORE:
                case Opcodes.ASTORE:
                case Opcodes.RET:
                    insns.push({[opcode]: arr[currentOffset + 1] & 0xFF});
                    // methodVisitor.visitVarInsn(opcode, arr[currentOffset + 1] & 0xFF);
                    currentOffset += 2;
                    break;
                case Opcodes.BIPUSH:
                case Opcodes.NEWARRAY:
                    insns.push({[opcode]: arr[currentOffset + 1]});
                    // methodVisitor.visitIntInsn(opcode, arr[currentOffset + 1]);
                    currentOffset += 2;
                    break;
                case Opcodes.SIPUSH:
                    insns.push({[opcode]: readShort(arr, currentOffset + 1)});
                    // methodVisitor.visitIntInsn(opcode, readShort(arr, currentOffset + 1));
                    currentOffset += 3;
                    break;
                case Opcodes.LDC:
                    insns.push({[opcode]: readConst(arr[currentOffset + 1] & 0xFF)});
                    // methodVisitor.visitLdcInsn(readConst(arr[currentOffset + 1] & 0xFF));
                    currentOffset += 2;
                    break;
                case Opcodes.LDC_W:
                case Opcodes.LDC2_W:
                    insns.push({[opcode]: readConst(readUnsignedShort(arr, currentOffset + 1))});
                    // methodVisitor.visitLdcInsn(readConst(readUnsignedShort(arr, currentOffset + 1)));
                    currentOffset += 3;
                    break;
                case Opcodes.GETSTATIC:
                case Opcodes.PUTSTATIC:
                case Opcodes.GETFIELD:
                case Opcodes.PUTFIELD:
                case Opcodes.INVOKEVIRTUAL:
                case Opcodes.INVOKESPECIAL:
                case Opcodes.INVOKESTATIC:
                case Opcodes.INVOKEINTERFACE:
                {
                    let cpInfoOffset = cpInfoOffsets[readUnsignedShort(arr, currentOffset + 1)];
                    let nameAndTypeCpInfoOffset = cpInfoOffsets[readUnsignedShort(arr, cpInfoOffset + 2)];
                    const owner = readClass(cpInfoOffset);
                    const name = readUTF8(nameAndTypeCpInfoOffset);
                    const descriptor = readUTF8(nameAndTypeCpInfoOffset + 2);
                    if (opcode < Opcodes.INVOKEVIRTUAL) {
                        insns.push({[opcode]: [ opcode, owner, name, descriptor ]});
                        // methodVisitor.visitFieldInsn(opcode, owner, name, descriptor);
                    } else {
                        const isInterface = arr[cpInfoOffset - 1] === Symbols.CONSTANT_INTERFACE_METHODREF_TAG;
                        insns.push({[opcode]: [ opcode, owner, name, descriptor, isInterface ]});
                        // methodVisitor.visitMethodInsn(opcode, owner, name, descriptor, isInterface);
                    }
                    if (opcode === Opcodes.INVOKEINTERFACE) {
                        currentOffset += 5;
                    } else {
                        currentOffset += 3;
                    }
                    break;
                }
                case Opcodes.INVOKEDYNAMIC:
                {
                    throw new Error("InvokeDynamics not supported.");
                    // let cpInfoOffset = cpInfoOffsets[readUnsignedShort(arr, currentOffset + 1)];
                    // let nameAndTypeCpInfoOffset = cpInfoOffsets[readUnsignedShort(arr, cpInfoOffset + 2)];
                    // const name = readUTF8(nameAndTypeCpInfoOffset);
                    // const descriptor = readUTF8(nameAndTypeCpInfoOffset + 2);
                    // let bootstrapMethodOffset = bootstrapMethodOffsets[readUnsignedShort(arr, cpInfoOffset)];
                    // // const handle = readConst(readUnsignedShort(bootstrapMethodOffset));
                    // const bootstrapMethodArguments = [...Array(readUnsignedShort(arr, bootstrapMethodOffset + 2))].map(_ => null);
                    // bootstrapMethodOffset += 4;
                    // for (let i = 0; i < bootstrapMethodArguments.length; i++)
                    // {
                    //     // bootstrapMethodArguments[i] = readConst(readUnsignedShort(arr, bootstrapMethodOffset));
                    //     bootstrapMethodOffset += 2;
                    // }
                    // // methodVisitor.visitInvokeDynamicInsn(name, descriptor, handle, bootstrapMethodArguments);
                    // currentOffset += 5;
                    // break;
                }
                case Opcodes.NEW:
                case Opcodes.ANEWARRAY:
                case Opcodes.CHECKCAST:
                case Opcodes.INSTANCEOF:
                    insns.push({[opcode]: readClass(currentOffset + 1)});
                    // methodVisitor.visitTypeInsn(opcode, readClass(currentOffset + 1));
                    currentOffset += 3;
                    break;
                case Opcodes.IINC:
                    insns.push({[opcode]: [ arr[currentOffset + 1] & 0xFF, arr[currentOffset + 2] ]});
                    // methodVisitor.visitIincInsn(arr[currentOffset + 1] & 0xFF, arr[currentOffset + 2]);
                    currentOffset += 3;
                    break;
                case Opcodes.MULTIANEWARRAY:
                    insns.push({[opcode]: [ readClass(currentOffset + 1), arr[currentOffset + 3] & 0xFF ]});
                    // methodVisitor.visitMultiANewArrayInsn(readClass(currentOffset + 1), arr[currentOffset + 3] & 0xFF);
                    currentOffset += 4;
                    break;
                default:
                    throw new Error("AssertionError");
            }

        }

        if (labels[codeLength] != null)
        {
            // methodVisitor.visitLabel(labels[codeLength]);
        }

        if (localVariableTableOffset !== 0)
        {
            let typeTable = null;
            if (localVariableTypeTableOffset !== 0)
            {
                typeTable = [...Array(readUnsignedShort(arr, localVariableTypeTableOffset) * 3)].map(_ => null);
                currentOffset = localVariableTypeTableOffset + 2;
                let typeTableIndex = typeTable.length;
                while (typeTableIndex > 0)
                {
                    typeTable[--typeTableIndex] = currentOffset + 6;
                    typeTable[--typeTableIndex] = readUnsignedShort(arr, currentOffset + 8);
                    typeTable[--typeTableIndex] = readUnsignedShort(arr, currentOffset);
                    currentOffset += 10;
                }
            }
            let localVariableTableLength = readUnsignedShort(arr, localVariableTableOffset);
            currentOffset = localVariableTableOffset + 2;
            while (localVariableTableLength-- > 0)
            {
                let startPc = readUnsignedShort(arr, currentOffset);
                let length = readUnsignedShort(arr, currentOffset + 2);
                const name = readUTF8(currentOffset + 4);
                const descriptor = readUTF8(currentOffset + 6);
                let index = readUnsignedShort(arr, currentOffset + 8);
                currentOffset += 10;
                let signature = null;
                if (typeTable != null)
                {
                    for (let i = 0; i < typeTable.length; i += 3)
                    {
                        if (typeTable[i] === startPc && typeTable[i + 1] === index)
                        {
                            signature = readUTF8(typeTable[i + 2]);
                            break;
                        }
                    }
                }
                // methodVisitor.visitLocalVariable(name, descriptor, signature, labels[startPc], labels[startPc + length], index);
            }
            if (debug) console.log('nice: ' + currentOffset)
        }

        // methodVisitor.visitMaxs(maxStack, maxLocals);

        return [ insns, tryCatchBlocks ];
    }

    let currentOffset = currentCpInfoOffset;
    const header = currentOffset;

    let accessFlags = readUnsignedShort(arr, currentOffset);
    if (debug) console.log('accessFlags: ' + accessFlags);

    const thisClass = readClass(currentOffset + 2);
    if (debug) console.log('thisClass: ' + thisClass);

    const superClass = readClass(currentOffset + 4);
    if (debug) console.log('superClass: ' + superClass);

    let interfaces = [...Array(readUnsignedShort(arr, currentOffset + 6))].map(_ => null);
    currentOffset += 8;
    for (let i = 0; i < interfaces.length; i++)
    {
        const itz = readClass(currentOffset);
        if (!classes[itz])
            await loadClass(itz);
        interfaces[i] = classes[itz];
        currentOffset += 2;
    }
    if (debug) console.log('interfaces: ' + interfaces);

    if (superClass)
    {
        if (!classes[superClass])
            clazz.superClass = (await loadClass(superClass)) ? classes[superClass] : false;
        else
            clazz.superClass = classes[superClass];
    }
    else
        clazz.superClass = false;

    clazz.accessFlags = accessFlags;
    clazz.className = thisClass;
    clazz.interfaces = interfaces;
    classes[thisClass] = clazz;

    if (debug) console.log('header: ' + header);
    const getFirstAttributeOffset = () =>
    {
        let currentOffset = header + 8 + readUnsignedShort(arr, header + 6) * 2;
        const fieldsCount = readUnsignedShort(arr, currentOffset);
        currentOffset += 2;
        for (let i = 0; i < fieldsCount; i++)
        {
            const attributesCount = readUnsignedShort(arr, currentOffset + 6);
            currentOffset += 8;
            for (let k = 0; k < attributesCount; k++)
                currentOffset += 6 + readUInt(arr, currentOffset + 2);
        }
        const methodsCount = readUnsignedShort(arr, currentOffset);
        currentOffset += 2;
        for (let i = 0; i < methodsCount; i++)
        {
            const attributesCount = readUnsignedShort(arr, currentOffset + 6);
            currentOffset += 8;
            for (let k = 0; k < attributesCount; k++)
                currentOffset += 6 + readUInt(arr, currentOffset + 2);
        }
        return currentOffset + 2;
    }
    let currentAttributeOffset = getFirstAttributeOffset();
    if (debug) console.log('currentAttributeOffset: ' + currentAttributeOffset);
    let innerClassesOffset = 0;
    let enclosingMethodOffset = 0;
    let signature = null;
    let sourceFile = null;
    let sourceDebugExtension = null;
    let runtimeVisibleAnnotationsOffset = 0;
    let runtimeInvisibleAnnotationsOffset = 0;
    let runtimeVisibleTypeAnnotationsOffset = 0;
    let runtimeInvisibleTypeAnnotationsOffset = 0;
    let moduleOffset = 0;
    let modulePackagesOffset = 0;
    let moduleMainClass = null;
    let nestHostClass = null;
    let nestMembersOffset = 0;
    let permittedSubclassesOffset = 0;
    let recordOffset = 0;
    let attributes = null;
    for (let i = readUnsignedShort(arr, currentAttributeOffset - 2); i > 0; --i)
    {
        const attributeName = readUTF8(currentAttributeOffset);
        if (debug) console.log('attribute: ' + attributeName);
        let attributeLength = readUInt(arr, currentAttributeOffset + 2);
        currentAttributeOffset += 6;
        if (attributeName === "SourceFile")
            sourceFile = readUTF8(currentAttributeOffset);
        else if (attributeName === "InnerClasses")
            innerClassesOffset = currentAttributeOffset;
        else if (attributeName === "EnclosingMethod")
            enclosingMethodOffset = currentAttributeOffset;
        else if (attributeName === "NestHost")
            nestHostClass = readClass(currentAttributeOffset);
        else if (attributeName === "NestMembers")
            nestMembersOffset = currentAttributeOffset;
        else if (attributeName === "PermittedSubclasses")
            permittedSubclassesOffset = currentAttributeOffset;
        else if (attributeName === "Signature")
            signature = readUTF8(currentAttributeOffset);
        else if (attributeName === "RuntimeVisibleAnnotations")
            runtimeVisibleAnnotationsOffset = currentAttributeOffset;
        else if (attributeName === "RuntimeVisibleTypeAnnotations")
            runtimeVisibleTypeAnnotationsOffset = currentAttributeOffset;
        else if (attributeName === "Deprecated")
            accessFlags |= Opcodes.ACC_DEPRECATED;
        else if (attributeName === "Synthetic")
            accessFlags |= Opcodes.ACC_SYNTHETIC;
        else if (attributeName === "SourceDebugExtension")
        {
            if (attributeLength <= arr.length - currentAttributeOffset)
                sourceDebugExtension = readUtf2(currentAttributeOffset, attributeLength);
        }
        else if ("RuntimeInvisibleAnnotations" === attributeName)
            runtimeInvisibleAnnotationsOffset = currentAttributeOffset;
        else if ("RuntimeInvisibleTypeAnnotations" === attributeName)
            runtimeInvisibleTypeAnnotationsOffset = currentAttributeOffset;
        else if (attributeName === "Record")
        {
            recordOffset = currentAttributeOffset;
            accessFlags |= Opcodes.ACC_RECORD;
        }
        else if (attributeName === "Module")
            moduleOffset = currentAttributeOffset;
        else if (attributeName === "ModuleMainClass")
            moduleMainClass = readClass(currentAttributeOffset);
        else if (attributeName === "ModulePackages")
            modulePackagesOffset = currentAttributeOffset;
        else if (attributeName !== "BootstrapMethods")
        {
            // The BootstrapMethods attribute is read in the constructor.
            // Attribute attribute =
            //     readAttribute(
            //         attributePrototypes,
            //         attributeName,
            //         currentAttributeOffset,
            //         attributeLength,
            //         charBuffer,
            //         -1,
            //         null);
            // attribute.nextAttribute = attributes;
            // attributes = attribute;
        }
        currentAttributeOffset += attributeLength;
    }

    const fieldsCount = readUnsignedShort(arr, currentOffset);
    currentOffset += 2;
    for (let i = 0; i < fieldsCount; i++)
        currentOffset = readField(currentOffset);

    const methodsCount = readUnsignedShort(arr, currentOffset);
    currentOffset += 2;
    for (let i = 0; i < methodsCount; i++)
        currentOffset = readMethod(currentOffset);

    /* Done parsing class file! */
    return true;
}

// (async () =>
// {
//     const response = await fetch("Test.class");
//     const data = await response.blob();
//     const buffer = await data.arrayBuffer();
//     const bytes = new Uint8Array(buffer);
//     parseClassFile(bytes);
// })();