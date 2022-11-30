/**
 * Using code-ish from:
 * {@link https://gitlab.ow2.org/asm/asm/-/blob/master/asm/src/main/java/org/objectweb/asm/ClassReader.java}
 *
 * Will return a {@link JvmClass} object if successfully parsed and processed.
 */
class AsmClassReader {

    bytes = [];

    magic = 0;
    version = 0;

    constantPoolCount = 0;
    cpInfoOffsets = [];
    constantUtf8Values = [];

    maxStringLength = 0;
    header = 0;

    signature = false;
    sourceFile = false;
    sourceDebugExtension = false;

    constructor(bytes) {
        this.bytes = bytes;
    }

    /**
     * Verify class file (by magic and major version)
     * @returns {boolean}
     * @throws {Error}
     */
    initialize() {
        let classFileBuffer = this.bytes;
        let classFileOffset = 0;

        this.magic = readInt(classFileBuffer, classFileOffset);
        if (this.magic.toString(16) !== 'cafebabe')
            throw new Error('Invalid magic value: ' + this.magic);
        console.log('magic: ' + this.magic.toString(16));

        this.version = readShort(classFileBuffer, classFileOffset + 6);
        if (this.version > Opcodes.V1_7)
            throw new Error('Invalid class version: ' + this.version + ' (' + this.version + ' > V1_7)');
        console.log('major: ' + this.version);

        this.constantPoolCount = readUnsignedShort(classFileBuffer, classFileOffset + 8);
        console.log('constantPoolCount: ' + this.constantPoolCount)
        this.cpInfoOffsets = [...Array(this.constantPoolCount)].fill(null);
        this.constantUtf8Values = [...Array(this.constantPoolCount)].fill(null);
        let currentCpInfoIndex = 1;
        let currentCpInfoOffset = classFileOffset + 10;
        let currentMaxStringLength = 0;
        let hasBootstrapMethods = false;

        let hasConstantDynamic = false;
        let cpInfoSize = 0;
        for (; currentCpInfoIndex < this.constantPoolCount; currentCpInfoOffset += cpInfoSize) {
            this.cpInfoOffsets[currentCpInfoIndex++] = currentCpInfoOffset + 1;
            switch (classFileBuffer[currentCpInfoOffset]) {
                case 1:
                    cpInfoSize = 3 + readUnsignedShort(classFileBuffer, currentCpInfoOffset + 1);
                    if (cpInfoSize > currentMaxStringLength) {
                        currentMaxStringLength = cpInfoSize;
                    }
                    break;
                case 3:
                case 4:
                case 9:
                case 10:
                case 11:
                case 12:
                    cpInfoSize = 5;
                    break;
                case 5:
                case 6:
                    cpInfoSize = 9;
                    ++currentCpInfoIndex;
                    break;
                case 7:
                case 8:
                case 16:
                case 19:
                case 20:
                    cpInfoSize = 3;
                    break;
                case 15:
                    cpInfoSize = 4;
                    break;
                case 17:
                    cpInfoSize = 5;
                    hasBootstrapMethods = true;
                    hasConstantDynamic = true;
                    break;
                case 18:
                    cpInfoSize = 5;
                    hasBootstrapMethods = true;
                    break;
                case 2:
                case 13:
                case 14:
                default:
                    throw new Error('IllegalArgumentException');
            }
        }

        this.maxStringLength = currentMaxStringLength;
        this.header = currentCpInfoOffset;
        this.constantDynamicValues = hasConstantDynamic ? [...Array(this.constantPoolCount)].fill(null) : null;
        this.bootstrapMethodOffsets = hasBootstrapMethods ? this.readBootstrapMethodsAttribute() : null;

        return true;
    }

    /**
     * Parses the whole class, including fields, functions and code.
     * @returns {JvmClass|boolean}
     * @throws {Error}
     */
    async process() {
        const bytes = this.bytes;

        let currentOffset = this.header;
        let accessFlags = readUnsignedShort(bytes, currentOffset);
        console.log('accessFlags: ' + accessFlags)

        let thisClass = readClass(this.constantUtf8Values, currentOffset + 2, this.cpInfoOffsets, bytes);
        console.log('thisClass: ' + thisClass)
        let superClass = readClass(this.constantUtf8Values, currentOffset + 4, this.cpInfoOffsets, bytes);
        console.log('superClass: ' + superClass)
        let interfaces = [...Array(readUnsignedShort(currentOffset + 6))];
        console.log('interfaces: ' + interfaces.length)
        currentOffset += 8;

        let innerClassesOffset;
        for (innerClassesOffset = 0; innerClassesOffset < interfaces.length; ++innerClassesOffset) {
            let itz = interfaces[innerClassesOffset] = readClass(this.constantUtf8Values, currentOffset, this.cpInfoOffsets, bytes);
            console.log('itz: ' + itz)
            currentOffset += 2;
        }

        innerClassesOffset = 0;
        let enclosingMethodOffset = 0;
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
        // let attributes = null;
        let currentAttributeOffset = this.getFirstAttributeOffset();

        let fieldsCount = readUnsignedShort(bytes, currentAttributeOffset - 2);
        for (; fieldsCount > 0; --fieldsCount) {
            let attributeName = readUTF8(this.constantUtf8Values, currentAttributeOffset, this.cpInfoOffsets, bytes);
            console.log('attributeName: ' + attributeName)
            let attributeLength = readInt(bytes, currentAttributeOffset + 2);
            currentAttributeOffset += 6;
            if ("SourceFile" === attributeName) {
                this.sourceFile = readUTF8(this.constantUtf8Values, currentAttributeOffset, this.cpInfoOffsets, bytes);
                console.log('this.sourceFile: ' + this.sourceFile)
            } else if ("InnerClasses" === attributeName) {
                innerClassesOffset = currentAttributeOffset;
            } else if ("EnclosingMethod" === attributeName) {
                enclosingMethodOffset = currentAttributeOffset;
            } else if ("NestHost" === attributeName) {
                nestHostClass = readClass(this.constantUtf8Values, currentAttributeOffset, this.cpInfoOffsets, bytes);
            } else if ("NestMembers" === attributeName) {
                nestMembersOffset = currentAttributeOffset;
            } else if ("PermittedSubclasses" === attributeName) {
                permittedSubclassesOffset = currentAttributeOffset;
            } else if ("Signature" === attributeName) {
                this.signature = readUTF8(this.constantUtf8Values, currentAttributeOffset, this.cpInfoOffsets, bytes);
                console.log('this.signature: ' + this.signature)
            } else if ("RuntimeVisibleAnnotations" === attributeName) {
                runtimeVisibleAnnotationsOffset = currentAttributeOffset;
            } else if ("RuntimeVisibleTypeAnnotations" === attributeName) {
                runtimeVisibleTypeAnnotationsOffset = currentAttributeOffset;
            } else if ("Deprecated" === attributeName) {
                accessFlags |= 131072;
            } else if ("Synthetic" === attributeName) {
                accessFlags |= 4096;
            } else if ("SourceDebugExtension" === attributeName) {
                if (attributeLength > bytes.length - currentAttributeOffset) {
                    throw new Error('IllegalArgumentException');
                }
                this.sourceDebugExtension = readUtf2(currentAttributeOffset, attributeLength, bytes);
                console.log('this.sourceDebugExtension: ' + this.sourceDebugExtension)
            } else if ("RuntimeInvisibleAnnotations" === attributeName) {
                runtimeInvisibleAnnotationsOffset = currentAttributeOffset;
            } else if ("RuntimeInvisibleTypeAnnotations" === attributeName) {
                runtimeInvisibleTypeAnnotationsOffset = currentAttributeOffset;
            } else if ("Record" === attributeName) {
                recordOffset = currentAttributeOffset;
                accessFlags |= 65536;
            } else if ("Module" === attributeName) {
                moduleOffset = currentAttributeOffset;
            } else if ("ModuleMainClass" === attributeName) {
                moduleMainClass = readClass(this.constantUtf8Values, currentAttributeOffset, this.cpInfoOffsets, bytes);
            } else if ("ModulePackages" === attributeName) {
                modulePackagesOffset = currentAttributeOffset;
            } else if ("BootstrapMethods" !== attributeName) {
                // Attribute attribute = this.readAttribute(attributePrototypes, attributeName, currentAttributeOffset, attributeLength, charBuffer, -1, (Label[])null);
                // attribute.nextAttribute = attributes;
                // attributes = attribute;
            }
            currentAttributeOffset += attributeLength;
        }

        const jvmClass = new JvmClass();
        // classVisitor.visit(readInt(bytes, this.cpInfoOffsets[1] - 7), accessFlags, thisClass, signature, superClass, interfaces);

        return true;
    }

    readBootstrapMethodsAttribute() {
        const bytes = this.bytes;
        let currentAttributeOffset = this.getFirstAttributeOffset();
        for (let i = readUnsignedShort(bytes, currentAttributeOffset - 2); i > 0; --i) {
            let attributeName = readUTF8(this.constantUtf8Values, currentAttributeOffset, this.cpInfoOffsets, bytes);
            let attributeLength = readInt(bytes, currentAttributeOffset + 2);
            currentAttributeOffset += 6;
            if ("BootstrapMethods" === attributeName) {
                let result = [...Array(readUnsignedShort(bytes, currentAttributeOffset))].fill(0);
                let currentBootstrapMethodOffset = currentAttributeOffset + 2;
                for (let j = 0; j < result.length; ++j) {
                    result[j] = currentBootstrapMethodOffset;
                    currentBootstrapMethodOffset += 4 + readUnsignedShort(bytes, currentBootstrapMethodOffset + 2) * 2;
                }
                return result;
            }
            currentAttributeOffset += attributeLength;
        }
        throw new Error('IllegalArgumentException');
    }

    getFirstAttributeOffset() {
        const bytes = this.bytes;
        let currentOffset = this.header + 8 + readUnsignedShort(bytes, this.header + 6) * 2;
        let fieldsCount = readUnsignedShort(bytes, currentOffset);
        currentOffset += 2;
        let methodsCount;
        while(fieldsCount-- > 0) {
            methodsCount = readUnsignedShort(bytes, currentOffset + 6);
            for (currentOffset += 8; methodsCount-- > 0; currentOffset += 6 + readInt(bytes, currentOffset + 2));
        }
        methodsCount = readUnsignedShort(bytes, currentOffset);
        currentOffset += 2;
        while(methodsCount-- > 0) {
            let attributesCount = readUnsignedShort(bytes, currentOffset + 6);
            for (currentOffset += 8; attributesCount-- > 0; currentOffset += 6 + readInt(bytes, currentOffset + 2));
        }
        return currentOffset + 2;
    }

}