// New attempt
(async () => {

    let buffer = [];
    let currentIndex = 0;

    currentIndex += writeUInt(buffer, 0xCAFEBABE);
    console.log(currentIndex);
    currentIndex += writeUInt(buffer, 0xCAFEBABE);
    console.log(currentIndex);
    currentIndex += writeUInt(buffer, 0xCAFEBABE);
    console.log(currentIndex);

    currentIndex = 0;
    let magic = readUInt(buffer, currentIndex);
    console.log(magic.toString(16));
    currentIndex += 4;

    magic = readUInt(buffer, currentIndex);
    console.log(magic.toString(16));
    currentIndex += 4;

    magic = readUInt(buffer, currentIndex);
    console.log(magic.toString(16));
    currentIndex += 4;

})();