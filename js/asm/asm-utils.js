// Convert-functions

/* Convert an int to a short */
function toShort(num) {
    const int16 = new Int16Array(1);
    int16[0] = num;
    return int16[0];
}

function intToBytes(num, reverse = true) {
    return reverse ? [
        (num & 0xff000000) >> 24,
        (num & 0x00ff0000) >> 16,
        (num & 0x0000ff00) >> 8,
        (num & 0x000000ff)
    ] : [
        (num & 0x000000ff),
        (num & 0x0000ff00) >> 8,
        (num & 0x00ff0000) >> 16,
        (num & 0xff000000) >> 24
    ];
}


function shortToBytes(num, reverse = true) {
    const low = (num & 0xFF);
    const high = (num >> 8) & 0xFF;
    // TODO: Verify which order below is correct
    return reverse ? [ low, high ] : [ high, low ];
}

/* ########## */

// Read-functions

/* Read a single byte */
function readByte(buffer, offset) {
    return buffer[offset] & 0xFF;
}

/* Read a single unsigned short */
function readUnsignedShort(buffer, offset) {
    return ((buffer[offset] & 0xFF) << 8) | (buffer[offset + 1] & 0xFF);
}

/* Read a single short */
function readShort(buffer, offset) {
    return toShort(((buffer[offset] & 0xFF) << 8) | (buffer[offset + 1] & 0xFF));
}

/* Read 4 bytes, then create an unsigned int */
function readInt(buffer, offset) {
    return (
        ((buffer[offset    ] & 0xFF) << 24) |
        ((buffer[offset + 1] & 0xFF) << 16) |
        ((buffer[offset + 2] & 0xFF) << 8) |
        ((buffer[offset + 3] & 0xFF))
    ) >>> 0;
}

/* Read 4 bytes - twice */
function readLong(buffer, offset) {
    const l1 = BigInt(readInt(buffer, offset));
    const l0 = BigInt(readInt(buffer, offset + 4) & 0xFFFFFFFF);
    return (l1 << 32n) | l0; // WARN: Shift with overly large value (32)
}

function readClass(constantUtf8Values, offset, cpInfoOffsets, buffer) {
    return readStringish(constantUtf8Values, offset, cpInfoOffsets, buffer);
}
function readStringish(constantUtf8Values, offset, cpInfoOffsets, buffer) {
    return readUTF8(constantUtf8Values, cpInfoOffsets[readUnsignedShort(buffer, offset)], cpInfoOffsets, buffer);
}
function readUTF8(constantUtf8Values, offset, cpInfoOffsets, buffer) {
    const cpPoolEntryIndex = readUnsignedShort(buffer, offset);
    if (offset === 0 || cpPoolEntryIndex === 0)
        return null;
    return readUtf(constantUtf8Values, cpPoolEntryIndex, cpInfoOffsets, buffer);
}
function readUtf(constantUtf8Values, cpPoolEntryIndex, cpInfoOffsets, buffer) {
    const value = constantUtf8Values[cpPoolEntryIndex];
    if (value !== null)
        return value;
    const cpInfoOffset = cpInfoOffsets[cpPoolEntryIndex];
    return constantUtf8Values[cpPoolEntryIndex] = readUtf2(cpInfoOffset + 2, readUnsignedShort(buffer, cpInfoOffset), buffer);
}
function readUtf2(utfOffset, utfLength, buffer) {
    let currentOffset = utfOffset;
    let endOffset = currentOffset + utfLength;
    let result = '';
    for (; currentOffset < endOffset; ) {
        const currentByte = readByte(buffer, currentOffset++);
        if ((currentByte & 0x80) === 0)
            result += String.fromCharCode(currentByte & 0x7F);
        else
        if ((currentByte & 0xE0) === 0xC0)
            result += String.fromCharCode(((currentByte & 0x1F) << 6) + (readByte(buffer, currentOffset++) & 0x3F));
        else
            result += String.fromCharCode(((currentByte & 0xF) << 12) + ((readByte(buffer, currentOffset++) & 0x3F) << 6) + (readByte(buffer, currentOffset++) & 0x3F));
    }
    return result;
}

function getTypeDescriptor(desc) {
    if (desc.startsWith('[') || desc.startsWith('L') || isPrimitiveType(desc))
        return desc;
    return 'L' + desc + ';';
}

function getMethodDescriptor(desc) {
    if (desc.startsWith('['))
        return desc;
    return 'L' + desc + ';';
}

// https://github.com/mattdesl/number-util/blob/master/index.js
const int8 = new Int8Array(4);
const int32 = new Int32Array(int8.buffer, 0, 1);
const float32 = new Float32Array(int8.buffer, 0, 1);
function intBitsToFloat(i) {
    int32[0] = i;
    return float32[0];
}
function floatToIntBits(f) {
    float32[0] = f;
    return int32[0];
}
const long16 = new Int16Array(4); // Not sure if 4 or 8, 4 seems to work
const long64 = new BigInt64Array(long16.buffer, 0, 1);
const double64 = new Float64Array(long16.buffer, 0, 1);
function longBitsToDouble(l) {
    long64[0] = l;
    return double64[0];
}
function doubleToLongBits(d) {
    double64[0] = d;
    return long64[0];
}

function getConstSymbol(cpInfoOffsets, constantPoolEntryIndex, bytes) {
    const cpInfoOffset = cpInfoOffsets[constantPoolEntryIndex];
    return bytes[cpInfoOffset - 1];
}

function readConst(constantUtf8Values, cpInfoOffsets, constantPoolEntryIndex, bytes) {
    const cpInfoOffset = cpInfoOffsets[constantPoolEntryIndex];
    const symbol = bytes[cpInfoOffset - 1];
    console.log('symbol:', symbol)
    switch (symbol) {

        /* int   */ case 3: return readInt(bytes, cpInfoOffset);
        /* float */ case 4: return intBitsToFloat(readInt(bytes, cpInfoOffset));

        /* long */ case 5: return readLong(bytes, cpInfoOffset);
        /* double */ case 6: return longBitsToDouble(readLong(bytes, cpInfoOffset));

        /* type */ case 7: return getTypeDescriptor(readUTF8(constantUtf8Values, cpInfoOffset, cpInfoOffsets, bytes));

        /* string */ case 8: return readUTF8(constantUtf8Values, cpInfoOffset, cpInfoOffsets, bytes);

        /* Java8 stuff? */
        case 15:
        case 16:
        case 17: throw new Error('Symbol ' + symbol + ' not supported.');
    }
    return '';
}

/* ########## */

// Write-functions

function write(buffer, bytes) {
    console.log('write', bytes);
    for (const i in bytes) buffer.push(bytes[i]);
    return bytes.length;
}

function writeUInt(buffer, i) {
    return write(buffer, intToBytes(i))
}
function writeUnsignedShort(buffer, s) {
    return write(buffer, shortToBytes(s))
}

/* ########## */

// Util functions

function isWide(object) {
    if (object === null) return false;
    const type = typeof object;
    if (type === 'string') return false; else
    if (type === 'number') return false; else
    if (type === 'bigint') return true; else // bigint == long
    if (object instanceof JvmClass && (object instanceof JvmLong || object instanceof JvmDouble))
        return true;
    return false;
}

/* ########## */

// Access functions

function isPublic(accessFlags) {
    return (Opcodes.ACC_PUBLIC & accessFlags) != 0x0;
}

function isPrivate(accessFlags) {
    return (Opcodes.ACC_PRIVATE & accessFlags) != 0x0;
}

function isProtected(accessFlags) {
    return (Opcodes.ACC_PROTECTED & accessFlags) != 0x0;
}

function isStatic(accessFlags) {
    return (Opcodes.ACC_STATIC & accessFlags) != 0x0;
}

function isFinal(accessFlags) {
    return (Opcodes.ACC_FINAL & accessFlags) != 0x0;
}

function isNative(accessFlags) {
    return (Opcodes.ACC_NATIVE & accessFlags) != 0x0;
}

function isInterface(accessFlags) {
    return (Opcodes.ACC_INTERFACE & accessFlags) != 0x0;
}

function isAbstract(accessFlags) {
    return (Opcodes.ACC_ABSTRACT & accessFlags) != 0x0;
}

function isAccess(accessFlags, check) {
    return (check & accessFlags) != 0x0;
}