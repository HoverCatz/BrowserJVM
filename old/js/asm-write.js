let buffer, currentIndex = 0;

const writeToClassFile = async (clz) => {
    // clz = JvmClass
    // output = bytearray of .class file

    buffer = [];
    currentIndex = 0;

    writeUInt(0xCAFEBABE); // Magic number
    writeUnsignedShort(16); // Minor
    writeUnsignedShort(51); // Major
    writeUnsignedShort(10); // cpCount - SourceFile only

    return buffer;
}

const write = bytes => {
    console.log('write', bytes)
    for (const i in bytes) buffer.push(bytes[i]);
    currentIndex += bytes.length;
}

const writeUInt          = i => write(intToBytes(i));
const writeUnsignedShort = s => write(shortToBytes(s));

const intToBytes = (num, reverse = true) => {
    const arr = new Uint8Array([
        (num & 0xff000000) >> 24,
        (num & 0x00ff0000) >> 16,
        (num & 0x0000ff00) >> 8,
        (num & 0x000000ff)
    ]);
    if (reverse) arr.reverse();
    return [...arr];
}

const shortToBytes = (num, reverse = true) => {
    const low = (num & 0xFF);
    const high = (num >> 8) & 0xFF;
    // TODO: Verify which order below is correct
    return reverse ? [ low, high ] : [ high, low ];
}