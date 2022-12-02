class AsmFieldReader {

    /** @type JvmClass */ clz;
    /** @type [] */ bytes;
    /** @type JvmField */ jvmField;

    accessFlags;
    name;
    descriptor;
    signature = null;
    constantValue = undefined;

    /** @type [] */ constantUtf8Values;
    /** */ cpInfoOffsets;

    /**
     * @param clz {JvmClass}
     * @param bytes {[]}
     * @param constantUtf8Values {[]}
     * @param cpInfoOffsets {[]}
     */
    constructor(clz, bytes, constantUtf8Values, cpInfoOffsets) {
        this.clz = clz;
        this.jvmField = new JvmField(clz);
        this.bytes = bytes;
        this.constantUtf8Values = constantUtf8Values;
        this.cpInfoOffsets = cpInfoOffsets;
    }

    readField(fieldInfoOffset) {
        const bytes = this.bytes;
        let currentOffset = fieldInfoOffset;

        this.accessFlags = readUnsignedShort(bytes, currentOffset);
        this.name = readUTF8(this.constantUtf8Values, currentOffset + 2, this.cpInfoOffsets, bytes);
        this.descriptor = readUTF8(this.constantUtf8Values, currentOffset + 4, this.cpInfoOffsets, bytes);
        currentOffset += 6;

        let runtimeVisibleAnnotationsOffset = 0;
        let runtimeInvisibleAnnotationsOffset = 0;
        let runtimeVisibleTypeAnnotationsOffset = 0;
        let runtimeInvisibleTypeAnnotationsOffset = 0;
        // let attributes = null;

        let attributesCount = readUnsignedShort(bytes, currentOffset);
        currentOffset += 2;

        while (attributesCount-- > 0) {
            let attributeName = readUTF8(this.constantUtf8Values, currentOffset, this.cpInfoOffsets, bytes);
            let attributeLength = readInt(bytes, currentOffset + 2);
            currentOffset += 6;
            if ('ConstantValue' === attributeName) {
                let constantvalueIndex = readUnsignedShort(bytes, currentOffset);
                this.constantValue = constantvalueIndex === 0 ? undefined : readConst(this.constantUtf8Values, this.cpInfoOffsets, constantvalueIndex, bytes);
                console.log('constantValueIndex:', constantvalueIndex, 'value:', this.constantValue)
            } else if ('Signature' === attributeName) {
                this.signature = readUTF8(this.constantUtf8Values, currentOffset, this.cpInfoOffsets, bytes);
            } else if ('Deprecated' === attributeName) {
                this.accessFlags |= Opcodes.ACC_DEPRECATED;
            } else if ('Synthetic' === attributeName) {
                this.accessFlags |= Opcodes.ACC_SYNTHETIC;
            } else if ('RuntimeVisibleAnnotations' === attributeName) {
                runtimeVisibleAnnotationsOffset = currentOffset;
            } else if ('RuntimeVisibleTypeAnnotations' === attributeName) {
                runtimeVisibleTypeAnnotationsOffset = currentOffset;
            } else if ('RuntimeInvisibleAnnotations' === attributeName) {
                runtimeInvisibleAnnotationsOffset = currentOffset;
            } else if ('RuntimeInvisibleTypeAnnotations' === attributeName) {
                runtimeInvisibleTypeAnnotationsOffset = currentOffset;
            } else {
                // Attribute attribute =
                //     readAttribute(
                //         context.attributePrototypes,
                //         attributeName,
                //         currentOffset,
                //         attributeLength,
                //         charBuffer,
                //         -1,
                //         null);
                // attribute.nextAttribute = attributes;
                // attributes = attribute;
            }
            currentOffset += attributeLength;
        }

        // FieldVisitor fieldVisitor = classVisitor.visitField(accessFlags, name, descriptor, signature, constantValue);
        // if (fieldVisitor === null)
        //     return currentOffset;

        this.jvmField.asmLoad(this.accessFlags, this.name, this.descriptor, this.signature, this.constantValue);

        // if (runtimeVisibleAnnotationsOffset !== 0) {
        //     let numAnnotations = readUnsignedShort(bytes, runtimeVisibleAnnotationsOffset);
        //     let currentAnnotationOffset = runtimeVisibleAnnotationsOffset + 2;
        //     while (numAnnotations-- > 0) {
        //         // Parse the type_index field.
        //         let annotationDescriptor = readUTF8(this.constantUtf8Values, currentAnnotationOffset, this.cpInfoOffsets, bytes);
        //         currentAnnotationOffset += 2;
        //         // Parse num_element_value_pairs and element_value_pairs and visit these values.
        //         currentAnnotationOffset =
        //             readElementValues(
        //                 fieldVisitor.visitAnnotation(annotationDescriptor, /* visible = */ true),
        //                 currentAnnotationOffset,
        //                 /* named = */ true,
        //                 charBuffer);
        //     }
        // }

        // if (runtimeInvisibleAnnotationsOffset !== 0) {
        //     let numAnnotations = readUnsignedShort(bytes, runtimeInvisibleAnnotationsOffset);
        //     let currentAnnotationOffset = runtimeInvisibleAnnotationsOffset + 2;
        //     while (numAnnotations-- > 0) {
        //         // Parse the type_index field.
        //         let annotationDescriptor = readUTF8(this.constantUtf8Values, currentAnnotationOffset, this.cpInfoOffsets, bytes);
        //         currentAnnotationOffset += 2;
        //         // Parse num_element_value_pairs and element_value_pairs and visit these values.
        //         currentAnnotationOffset =
        //             readElementValues(
        //                 fieldVisitor.visitAnnotation(annotationDescriptor, /* visible = */ false),
        //                 currentAnnotationOffset,
        //                 /* named = */ true,
        //                 charBuffer);
        //     }
        // }

        // if (runtimeVisibleTypeAnnotationsOffset !== 0) {
        //     let numAnnotations = readUnsignedShort(bytes, runtimeVisibleTypeAnnotationsOffset);
        //     let currentAnnotationOffset = runtimeVisibleTypeAnnotationsOffset + 2;
        //     while (numAnnotations-- > 0) {
        //         // Parse the target_type, target_info and target_path fields.
        //         currentAnnotationOffset = readTypeAnnotationTarget(context, currentAnnotationOffset);
        //         // Parse the type_index field.
        //         let annotationDescriptor = readUTF8(this.constantUtf8Values, currentAnnotationOffset, this.cpInfoOffsets, bytes);
        //         currentAnnotationOffset += 2;
        //         // Parse num_element_value_pairs and element_value_pairs and visit these values.
        //         currentAnnotationOffset =
        //             readElementValues(
        //                 fieldVisitor.visitTypeAnnotation(
        //                     context.currentTypeAnnotationTarget,
        //                     context.currentTypeAnnotationTargetPath,
        //                     annotationDescriptor,
        //                     /* visible = */ true),
        //                 currentAnnotationOffset,
        //                 /* named = */ true,
        //                 charBuffer);
        //     }
        // }

        // if (runtimeInvisibleTypeAnnotationsOffset !== 0) {
        //     let numAnnotations = readUnsignedShort(bytes, runtimeInvisibleTypeAnnotationsOffset);
        //     let currentAnnotationOffset = runtimeInvisibleTypeAnnotationsOffset + 2;
        //     while (numAnnotations-- > 0) {
        //         // Parse the target_type, target_info and target_path fields.
        //         currentAnnotationOffset = readTypeAnnotationTarget(context, currentAnnotationOffset);
        //         // Parse the type_index field.
        //         let annotationDescriptor = readUTF8(this.constantUtf8Values, currentAnnotationOffset, this.cpInfoOffsets, bytes);
        //         currentAnnotationOffset += 2;
        //         // Parse num_element_value_pairs and element_value_pairs and visit these values.
        //         currentAnnotationOffset =
        //             readElementValues(
        //                 fieldVisitor.visitTypeAnnotation(
        //                     context.currentTypeAnnotationTarget,
        //                     context.currentTypeAnnotationTargetPath,
        //                     annotationDescriptor,
        //                     /* visible = */ false),
        //                 currentAnnotationOffset,
        //                 /* named = */ true,
        //                 charBuffer);
        //     }
        // }

        // while (attributes != null) {
        //     // Copy and reset the nextAttribute field so that it can also be used in FieldWriter.
        //     Attribute nextAttribute = attributes.nextAttribute;
        //     attributes.nextAttribute = null;
        //     fieldVisitor.visitAttribute(attributes);
        //     attributes = nextAttribute;
        // }

        return currentOffset;
    }

}