async function readClassFile(fileName) {
    const response = await fetch(fileName);
    const data = await response.blob();
    const buffer = await data.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    return parseClassFile(bytes);
}

/**
 * Reads and parses a java .class file
 * and returns a JvmClass object.
 * @param bytes The bytes from the .class file
 * @returns {Promise<JvmClass>} An executable JvmClass object
 */
function parseClassFile(bytes) {
    return new Promise(async (resolve, reject) => {
        try {
            const reader = new AsmClassReader(bytes);
            reader.initialize();
            resolve(await reader.process());
        } catch (e) {
            reject(e);
        }
    });
}