// Convert-functions

/* Convert an int to a short */
function toShort(num) {
    const int16 = new Int16Array(1);
    int16[0] = num;
    return int16[0];
}

function intToBytes(num, reverse = true) {
    const buffer = new Uint8Array([
        (num & 0xff000000) >> 24,
        (num & 0x00ff0000) >> 16,
        (num & 0x0000ff00) >> 8,
        (num & 0x000000ff)
    ]);
    if (reverse) buffer.reverse();
    return [...buffer];
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
function readUInt(buffer, offset) {
    const bytes = [
        (buffer[offset + 3] & 0xFF) << 24,
        (buffer[offset + 2] & 0xFF) << 16,
        (buffer[offset + 1] & 0xFF) << 8,
        (buffer[offset    ] & 0xFF)
    ];
    return (bytes[3] | bytes[2] | bytes[1] | bytes[0]) >>> 0;
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
    if (desc.startsWith('['))
        return desc;
    return 'L' + desc + ';';
}

function getMethodDescriptor(desc) {
    if (desc.startsWith('['))
        return desc;
    return 'L' + desc + ';';
}

function readConst(constantUtf8Values, cpInfoOffsets, constantPoolEntryIndex, buffer) {
    let cpInfoOffset = cpInfoOffsets[constantPoolEntryIndex];
    switch (buffer[cpInfoOffset - 1]) {
        case 3:
        case 4:
        case 5:
        case 6: return readUInt(buffer, cpInfoOffset);
        case 7: return getTypeDescriptor(readUTF8(constantUtf8Values, cpInfoOffset, cpInfoOffsets));
        case 8: return readUTF8(constantUtf8Values, cpInfoOffset, cpInfoOffsets);

        /* Java8 stuff? */
        case 15:
        case 16:
        case 17: throw new Error("Not supported.");
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