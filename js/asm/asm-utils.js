// Convert-functions

/* Convert an int to a short */
function toShort(num) {
    const int16 = new Int16Array(1);
    int16[0] = num;
    return int16[0];
}

function intToBytes(num, reverse = true) {
    const arr = new Uint8Array([
        (num & 0xff000000) >> 24,
        (num & 0x00ff0000) >> 16,
        (num & 0x0000ff00) >> 8,
        (num & 0x000000ff)
    ]);
    if (reverse) arr.reverse();
    return [...arr];
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
function readByte(arr, offset) {
    return arr[offset] & 0xFF;
}

/* Read a single unsigned short */
function readUnsignedShort(arr, offset) {
    return ((arr[offset] & 0xFF) << 8) | (arr[offset + 1] & 0xFF);
}

/* Read a single short */
function readShort(arr, offset) {
    return toShort(((arr[offset] & 0xFF) << 8) | (arr[offset + 1] & 0xFF));
}

/* Read 4 bytes, then create an unsigned int */
function readUInt(arr, offset) {
    const bytes = [
        arr[offset + 3] & 0xFF,
        arr[offset + 1] & 0xFF,
        arr[offset + 2] & 0xFF,
        arr[offset] & 0xFF
    ];
    let r = 0;
    for (let i = 3; i >= 0; i--)
        r |= bytes[i] << (i * 8);
    return r >>> 0;
}

function readClass(constantUtf8Values, offset, cpInfoOffsets, arr) {
    return readStringish(constantUtf8Values, offset, cpInfoOffsets, arr);
}
function readStringish(constantUtf8Values, offset, cpInfoOffsets, arr) {
    return readUTF8(constantUtf8Values, cpInfoOffsets[readUnsignedShort(arr, offset)], cpInfoOffsets, arr);
}
function readUTF8(constantUtf8Values, offset, cpInfoOffsets, arr) {
    const cpPoolEntryIndex = readUnsignedShort(arr, offset);
    if (offset === 0 || cpPoolEntryIndex === 0)
        return null;
    return readUtf(constantUtf8Values, cpPoolEntryIndex, cpInfoOffsets, arr);
}
function readUtf(constantUtf8Values, cpPoolEntryIndex, cpInfoOffsets, arr) {
    const value = constantUtf8Values[cpPoolEntryIndex];
    if (value !== null)
        return value;
    const cpInfoOffset = cpInfoOffsets[cpPoolEntryIndex];
    return constantUtf8Values[cpPoolEntryIndex] = readUtf2(cpInfoOffset + 2, readUnsignedShort(arr, cpInfoOffset), arr);
}
function readUtf2(utfOffset, utfLength, arr) {
    let currentOffset = utfOffset;
    let endOffset = currentOffset + utfLength;
    let result = '';
    for (; currentOffset < endOffset; ) {
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

function readConst(constantUtf8Values, cpInfoOffsets, constantPoolEntryIndex, arr) {
    let cpInfoOffset = cpInfoOffsets[constantPoolEntryIndex];
    switch (arr[cpInfoOffset - 1]) {
        case 3:
        case 4:
        case 5:
        case 6: return readUInt(arr, cpInfoOffset);
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

function write(bytes) {
    console.log('write', bytes)
    for (const i in bytes) buffer.push(bytes[i]);
    currentIndex += bytes.length;
}

function writeUInt(i) {
    write(intToBytes(i))
}
function writeUnsignedShort(s) {
    write(shortToBytes(s))
}