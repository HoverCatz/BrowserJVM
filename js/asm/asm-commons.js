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