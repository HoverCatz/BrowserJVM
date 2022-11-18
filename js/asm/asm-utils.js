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