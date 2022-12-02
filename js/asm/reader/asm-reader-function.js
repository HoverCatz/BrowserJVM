class AsmFunctionReader {

    /** @type JvmClass */ clz;
    /** @type [] */ bytes;
    /** @type JvmFunction */ jvmFunction;

    accessFlags;
    name;
    descriptor;
    signature = null;
    exceptions;
    labels;
    instructions;
    tryCatches;

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
        this.jvmFunction = new JvmFunction(clz);
        this.bytes = bytes;
        this.constantUtf8Values = constantUtf8Values;
        this.cpInfoOffsets = cpInfoOffsets;
    }

    readFunction(methodInfoOffset) {
        const bytes = this.bytes;
        let currentOffset = methodInfoOffset;

        this.accessFlags = readUnsignedShort(bytes, currentOffset);
        this.name = readUTF8(this.constantUtf8Values, currentOffset + 2, this.cpInfoOffsets, bytes);
        this.descriptor = readUTF8(this.constantUtf8Values, currentOffset + 4, this.cpInfoOffsets, bytes);
        currentOffset += 6;
        console.log('currentMethodName', this.name)

        let codeOffset = 0;
        let exceptionsOffset = 0;
        /** @type [] */ let exceptions = null;
        let synthetic = false;
        let signatureIndex = 0;
        let runtimeVisibleAnnotationsOffset = 0;
        let runtimeInvisibleAnnotationsOffset = 0;
        let runtimeVisibleParameterAnnotationsOffset = 0;
        let runtimeInvisibleParameterAnnotationsOffset = 0;
        let runtimeVisibleTypeAnnotationsOffset = 0;
        let runtimeInvisibleTypeAnnotationsOffset = 0;
        let annotationDefaultOffset = 0;
        let methodParametersOffset = 0;
        // let attributes = null;

        let attributesCount = readUnsignedShort(bytes, currentOffset);
        currentOffset += 2;
        while (attributesCount-- > 0) {
            let attributeName = readUTF8(this.constantUtf8Values, currentOffset, this.cpInfoOffsets, bytes);
            console.log('attributeName', attributeName)
            let attributeLength = readInt(bytes, currentOffset + 2);
            currentOffset += 6;
            if ('Code' === attributeName) {
                codeOffset = currentOffset;
            } else if ('Exceptions' === attributeName) {
                exceptionsOffset = currentOffset;
                exceptions = [...Array(readUnsignedShort(bytes, exceptionsOffset))].fill(null);
                let currentExceptionOffset = exceptionsOffset + 2;
                for (let i = 0; i < exceptions.length; ++i) {
                    exceptions[i] = readClass(this.constantUtf8Values, currentExceptionOffset, this.cpInfoOffsets, bytes);
                    currentExceptionOffset += 2;
                }
            } else if ('Signature' === attributeName) {
                signatureIndex = readUnsignedShort(bytes, currentOffset);
            } else if ('Deprecated' === attributeName) {
                this.accessFlags |= Opcodes.ACC_DEPRECATED;
            } else if ('RuntimeVisibleAnnotations' === attributeName) {
                runtimeVisibleAnnotationsOffset = currentOffset;
            } else if ('RuntimeVisibleTypeAnnotations' === attributeName) {
                runtimeVisibleTypeAnnotationsOffset = currentOffset;
            } else if ('ANNOTATION_DEFAULT' === attributeName) {
                annotationDefaultOffset = currentOffset;
            } else if ('Synthetic' === attributeName) {
                synthetic = true;
                this.accessFlags |= Opcodes.ACC_SYNTHETIC;
            } else if ('RUNTIME_INVISIBLE_ANNOTATIONS' === attributeName) {
                runtimeInvisibleAnnotationsOffset = currentOffset;
            } else if ('RuntimeInvisibleTypeAnnotations' === attributeName) {
                runtimeInvisibleTypeAnnotationsOffset = currentOffset;
            } else if ('RuntimeVisibleParameterAnnotations' === attributeName) {
                runtimeVisibleParameterAnnotationsOffset = currentOffset;
            } else if ('RuntimeInvisibleParameterAnnotations' === attributeName) {
                runtimeInvisibleParameterAnnotationsOffset = currentOffset;
            } else if ('MethodParameters' === attributeName) {
                methodParametersOffset = currentOffset;
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
        this.exceptions = exceptions ?? [];

        // MethodVisitor methodVisitor = classVisitor.visitMethod(
        //         context.currentMethodAccessFlags,
        //         context.currentMethodName,
        //         context.currentMethodDescriptor,
        //         signatureIndex == 0 ? null : readUtf(signatureIndex, charBuffer),
        //         exceptions);
        // if (methodVisitor === null)
        //     return currentOffset;

        this.signature = (signatureIndex === 0) ? null : readUtf(this.constantUtf8Values, signatureIndex, this.cpInfoOffsets, bytes);
        this.jvmFunction.asmLoad(
            this.accessFlags,
            this.name,
            this.descriptor,
            this.signature,
            this.exceptions
        )

        if (methodParametersOffset !== 0) {
            let parametersCount = readByte(bytes, methodParametersOffset);
            console.log('parametersCount', parametersCount)
            let currentParameterOffset = methodParametersOffset + 1;
            while (parametersCount-- > 0) {
                // Read the name_index and access_flags fields and visit them.
                // methodVisitor.visitParameter(
                //     readUTF8(this.constantUtf8Values, currentParameterOffset, this.cpInfoOffsets, bytes),
                //     readUnsignedShort(bytes, currentParameterOffset + 2)
                // );
                const parameterNode = {
                    'name': readUTF8(this.constantUtf8Values, currentParameterOffset, this.cpInfoOffsets, bytes),
                    'access': readUnsignedShort(bytes, currentParameterOffset + 2)
                };
                console.log(parameterNode.access + ' ' + parameterNode.name)
                currentParameterOffset += 4;
            }
        }

        // if (annotationDefaultOffset !== 0) {
        //     let annotationVisitor = methodVisitor.visitAnnotationDefault();
        //     readElementValue(annotationVisitor, annotationDefaultOffset, null, charBuffer);
        //     if (annotationVisitor != null) {
        //         annotationVisitor.visitEnd();
        //     }
        // }

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
        //                 methodVisitor.visitAnnotation(annotationDescriptor, /* visible = */ true),
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
        //                 methodVisitor.visitAnnotation(annotationDescriptor, /* visible = */ false),
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
        //                 methodVisitor.visitTypeAnnotation(
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
        //                 methodVisitor.visitTypeAnnotation(
        //                     context.currentTypeAnnotationTarget,
        //                     context.currentTypeAnnotationTargetPath,
        //                     annotationDescriptor,
        //                     /* visible = */ false),
        //                 currentAnnotationOffset,
        //                 /* named = */ true,
        //                 charBuffer);
        //     }
        // }

        // if (runtimeVisibleParameterAnnotationsOffset !== 0) {
        //     readParameterAnnotations(methodVisitor, context, runtimeVisibleParameterAnnotationsOffset, /* visible = */ true);
        // }

        // if (runtimeInvisibleParameterAnnotationsOffset !== 0) {
        //     readParameterAnnotations(
        //         methodVisitor,
        //         context,
        //         runtimeInvisibleParameterAnnotationsOffset,
        //         /* visible = */ false);
        // }

        // while (attributes != null) {
        //     // Copy and reset the nextAttribute field so that it can also be used in MethodWriter.
        //     Attribute nextAttribute = attributes.nextAttribute;
        //     attributes.nextAttribute = null;
        //     methodVisitor.visitAttribute(attributes);
        //     attributes = nextAttribute;
        // }

        if (codeOffset !== 0) {
            // methodVisitor.visitCode();
            this.#readCode(codeOffset);
        }

        return currentOffset;
    }

    #readCode(codeOffset) {
        const bytes = this.bytes;
        let currentOffset = codeOffset;

        const majorVersion = readUnsignedShort(bytes, 6);
        const minorVersion = readUnsignedShort(bytes, 4);

        let maxStack;
        let maxLocals;
        let codeLength;

        if (majorVersion === 45 && minorVersion <= 2) {
            maxStack = readByte(bytes, currentOffset);
            maxLocals = readByte(bytes, currentOffset + 1);
            codeLength = readUnsignedShort(bytes, currentOffset + 2);
            currentOffset += 4;
        } else {
            maxStack = readUnsignedShort(bytes, currentOffset);
            maxLocals = readUnsignedShort(bytes, currentOffset + 2);
            codeLength = readInt(bytes, currentOffset + 4);
            currentOffset += 8;
        }

        if (codeLength > bytes.length - currentOffset) {
            throw new Error('IllegalArgumentException');
        }

        const bytecodeStartOffset = currentOffset;
        const bytecodeEndOffset = currentOffset + codeLength;
        const labels = this.labels = [...Array(codeLength + 1)].fill(null);
        while (currentOffset < bytecodeEndOffset) {
            const bytecodeOffset = currentOffset - bytecodeStartOffset;
            const opcode = bytes[currentOffset] & 0xFF;
            switch (opcode) {
                case Opcodes.NOP:
                case Opcodes.ACONST_NULL:
                case Opcodes.ICONST_M1:
                case Opcodes.ICONST_0:
                case Opcodes.ICONST_1:
                case Opcodes.ICONST_2:
                case Opcodes.ICONST_3:
                case Opcodes.ICONST_4:
                case Opcodes.ICONST_5:
                case Opcodes.LCONST_0:
                case Opcodes.LCONST_1:
                case Opcodes.FCONST_0:
                case Opcodes.FCONST_1:
                case Opcodes.FCONST_2:
                case Opcodes.DCONST_0:
                case Opcodes.DCONST_1:
                case Opcodes.IALOAD:
                case Opcodes.LALOAD:
                case Opcodes.FALOAD:
                case Opcodes.DALOAD:
                case Opcodes.AALOAD:
                case Opcodes.BALOAD:
                case Opcodes.CALOAD:
                case Opcodes.SALOAD:
                case Opcodes.IASTORE:
                case Opcodes.LASTORE:
                case Opcodes.FASTORE:
                case Opcodes.DASTORE:
                case Opcodes.AASTORE:
                case Opcodes.BASTORE:
                case Opcodes.CASTORE:
                case Opcodes.SASTORE:
                case Opcodes.POP:
                case Opcodes.POP2:
                case Opcodes.DUP:
                case Opcodes.DUP_X1:
                case Opcodes.DUP_X2:
                case Opcodes.DUP2:
                case Opcodes.DUP2_X1:
                case Opcodes.DUP2_X2:
                case Opcodes.SWAP:
                case Opcodes.IADD:
                case Opcodes.LADD:
                case Opcodes.FADD:
                case Opcodes.DADD:
                case Opcodes.ISUB:
                case Opcodes.LSUB:
                case Opcodes.FSUB:
                case Opcodes.DSUB:
                case Opcodes.IMUL:
                case Opcodes.LMUL:
                case Opcodes.FMUL:
                case Opcodes.DMUL:
                case Opcodes.IDIV:
                case Opcodes.LDIV:
                case Opcodes.FDIV:
                case Opcodes.DDIV:
                case Opcodes.IREM:
                case Opcodes.LREM:
                case Opcodes.FREM:
                case Opcodes.DREM:
                case Opcodes.INEG:
                case Opcodes.LNEG:
                case Opcodes.FNEG:
                case Opcodes.DNEG:
                case Opcodes.ISHL:
                case Opcodes.LSHL:
                case Opcodes.ISHR:
                case Opcodes.LSHR:
                case Opcodes.IUSHR:
                case Opcodes.LUSHR:
                case Opcodes.IAND:
                case Opcodes.LAND:
                case Opcodes.IOR:
                case Opcodes.LOR:
                case Opcodes.IXOR:
                case Opcodes.LXOR:
                case Opcodes.I2L:
                case Opcodes.I2F:
                case Opcodes.I2D:
                case Opcodes.L2I:
                case Opcodes.L2F:
                case Opcodes.L2D:
                case Opcodes.F2I:
                case Opcodes.F2L:
                case Opcodes.F2D:
                case Opcodes.D2I:
                case Opcodes.D2L:
                case Opcodes.D2F:
                case Opcodes.I2B:
                case Opcodes.I2C:
                case Opcodes.I2S:
                case Opcodes.LCMP:
                case Opcodes.FCMPL:
                case Opcodes.FCMPG:
                case Opcodes.DCMPL:
                case Opcodes.DCMPG:
                case Opcodes.IRETURN:
                case Opcodes.LRETURN:
                case Opcodes.FRETURN:
                case Opcodes.DRETURN:
                case Opcodes.ARETURN:
                case Opcodes.RETURN:
                case Opcodes.ARRAYLENGTH:
                case Opcodes.ATHROW:
                case Opcodes.MONITORENTER:
                case Opcodes.MONITOREXIT:
                case Opcodes.ILOAD_0:
                case Opcodes.ILOAD_1:
                case Opcodes.ILOAD_2:
                case Opcodes.ILOAD_3:
                case Opcodes.LLOAD_0:
                case Opcodes.LLOAD_1:
                case Opcodes.LLOAD_2:
                case Opcodes.LLOAD_3:
                case Opcodes.FLOAD_0:
                case Opcodes.FLOAD_1:
                case Opcodes.FLOAD_2:
                case Opcodes.FLOAD_3:
                case Opcodes.DLOAD_0:
                case Opcodes.DLOAD_1:
                case Opcodes.DLOAD_2:
                case Opcodes.DLOAD_3:
                case Opcodes.ALOAD_0:
                case Opcodes.ALOAD_1:
                case Opcodes.ALOAD_2:
                case Opcodes.ALOAD_3:
                case Opcodes.ISTORE_0:
                case Opcodes.ISTORE_1:
                case Opcodes.ISTORE_2:
                case Opcodes.ISTORE_3:
                case Opcodes.LSTORE_0:
                case Opcodes.LSTORE_1:
                case Opcodes.LSTORE_2:
                case Opcodes.LSTORE_3:
                case Opcodes.FSTORE_0:
                case Opcodes.FSTORE_1:
                case Opcodes.FSTORE_2:
                case Opcodes.FSTORE_3:
                case Opcodes.DSTORE_0:
                case Opcodes.DSTORE_1:
                case Opcodes.DSTORE_2:
                case Opcodes.DSTORE_3:
                case Opcodes.ASTORE_0:
                case Opcodes.ASTORE_1:
                case Opcodes.ASTORE_2:
                case Opcodes.ASTORE_3:
                    currentOffset += 1;
                    break;
                case Opcodes.IFEQ:
                case Opcodes.IFNE:
                case Opcodes.IFLT:
                case Opcodes.IFGE:
                case Opcodes.IFGT:
                case Opcodes.IFLE:
                case Opcodes.IF_ICMPEQ:
                case Opcodes.IF_ICMPNE:
                case Opcodes.IF_ICMPLT:
                case Opcodes.IF_ICMPGE:
                case Opcodes.IF_ICMPGT:
                case Opcodes.IF_ICMPLE:
                case Opcodes.IF_ACMPEQ:
                case Opcodes.IF_ACMPNE:
                case Opcodes.GOTO:
                case Opcodes.JSR:
                case Opcodes.IFNULL:
                case Opcodes.IFNONNULL:
                // createLabel(bytecodeOffset + readShort(bytes, currentOffset + 1), labels);
                    this.#createLabel(bytecodeOffset + readShort(bytes, currentOffset + 1), labels);
                    currentOffset += 3;
                    break;
                case Opcodes.ASM_IFEQ:
                case Opcodes.ASM_IFNE:
                case Opcodes.ASM_IFLT:
                case Opcodes.ASM_IFGE:
                case Opcodes.ASM_IFGT:
                case Opcodes.ASM_IFLE:
                case Opcodes.ASM_IF_ICMPEQ:
                case Opcodes.ASM_IF_ICMPNE:
                case Opcodes.ASM_IF_ICMPLT:
                case Opcodes.ASM_IF_ICMPGE:
                case Opcodes.ASM_IF_ICMPGT:
                case Opcodes.ASM_IF_ICMPLE:
                case Opcodes.ASM_IF_ACMPEQ:
                case Opcodes.ASM_IF_ACMPNE:
                case Opcodes.ASM_GOTO:
                case Opcodes.ASM_JSR:
                case Opcodes.ASM_IFNULL:
                case Opcodes.ASM_IFNONNULL:
                // createLabel(bytecodeOffset + readUnsignedShort(bytes, currentOffset + 1), labels);
                    currentOffset += 3;
                    break;
                case Opcodes.GOTO_W:
                case Opcodes.JSR_W:
                case Opcodes.ASM_GOTO_W:
                // createLabel(bytecodeOffset + readInt(bytes, currentOffset + 1), labels);
                    currentOffset += 5;
                    break;
                case Opcodes.WIDE:
                    switch (bytes[currentOffset + 1] & 0xFF) {
                        case Opcodes.ILOAD:
                        case Opcodes.FLOAD:
                        case Opcodes.ALOAD:
                        case Opcodes.LLOAD:
                        case Opcodes.DLOAD:
                        case Opcodes.ISTORE:
                        case Opcodes.FSTORE:
                        case Opcodes.ASTORE:
                        case Opcodes.LSTORE:
                        case Opcodes.DSTORE:
                        case Opcodes.RET:
                            currentOffset += 4;
                            break;
                        case Opcodes.IINC:
                            currentOffset += 6;
                            break;
                        default:
                            throw new Error('IllegalArgumentException');
                    }
                    break;
                case Opcodes.TABLESWITCH:
                    // Skip 0 to 3 padding bytes.
                    currentOffset += 4 - (bytecodeOffset & 3);
                    // Read the default label and the number of table entries.
                // createLabel(bytecodeOffset + readInt(currentOffset), labels);
                    this.#createLabel(bytecodeOffset + readInt(currentOffset), labels);
                    let numTableEntries = readInt(bytes, currentOffset + 8) - readInt(bytes, currentOffset + 4) + 1;
                    currentOffset += 12;
                    // Read the table labels.
                    while (numTableEntries-- > 0) {
                        this.#createLabel(bytecodeOffset + readInt(currentOffset), labels);
                // createLabel(bytecodeOffset + readInt(currentOffset), labels);
                        currentOffset += 4;
                    }
                    break;
                case Opcodes.LOOKUPSWITCH:
                    // Skip 0 to 3 padding bytes.
                    currentOffset += 4 - (bytecodeOffset & 3);
                    // Read the default label and the number of switch cases.
                // createLabel(bytecodeOffset + readInt(currentOffset), labels);
                    this.#createLabel(bytecodeOffset + readInt(currentOffset), labels);
                    let numSwitchCases = readInt(bytes, currentOffset + 4);
                    currentOffset += 8;
                    // Read the switch labels.
                    while (numSwitchCases-- > 0) {
                        this.#createLabel(bytecodeOffset + readInt(currentOffset + 4), labels);
                // createLabel(bytecodeOffset + readInt(currentOffset + 4), labels);
                        currentOffset += 8;
                    }
                    break;
                case Opcodes.ILOAD:
                case Opcodes.LLOAD:
                case Opcodes.FLOAD:
                case Opcodes.DLOAD:
                case Opcodes.ALOAD:
                case Opcodes.ISTORE:
                case Opcodes.LSTORE:
                case Opcodes.FSTORE:
                case Opcodes.DSTORE:
                case Opcodes.ASTORE:
                case Opcodes.RET:
                case Opcodes.BIPUSH:
                case Opcodes.NEWARRAY:
                case Opcodes.LDC:
                    currentOffset += 2;
                    break;
                case Opcodes.SIPUSH:
                case Opcodes.LDC_W:
                case Opcodes.LDC2_W:
                case Opcodes.GETSTATIC:
                case Opcodes.PUTSTATIC:
                case Opcodes.GETFIELD:
                case Opcodes.PUTFIELD:
                case Opcodes.INVOKEVIRTUAL:
                case Opcodes.INVOKESPECIAL:
                case Opcodes.INVOKESTATIC:
                case Opcodes.NEW:
                case Opcodes.ANEWARRAY:
                case Opcodes.CHECKCAST:
                case Opcodes.INSTANCEOF:
                case Opcodes.IINC:
                    currentOffset += 3;
                    break;
                case Opcodes.INVOKEINTERFACE:
                case Opcodes.INVOKEDYNAMIC:
                    currentOffset += 5;
                    break;
                case Opcodes.MULTIANEWARRAY:
                    currentOffset += 4;
                    break;
                default:
                    throw new Error('IllegalArgumentException');
            }
        }

        let exceptionTableLength = readUnsignedShort(bytes, currentOffset);
        this.tryCatches = [...Array(exceptionTableLength)].fill(null);
        currentOffset += 2;
        let tryCatchIndex = 0;
        while (exceptionTableLength-- > 0) {
            let start = this.#createLabel(readUnsignedShort(bytes, currentOffset), labels);
            let end = this.#createLabel(readUnsignedShort(bytes, currentOffset + 2), labels);
            let handler = this.#createLabel(readUnsignedShort(bytes, currentOffset + 4), labels);
            let catchType = readClass(this.constantUtf8Values, currentOffset + 6, this.cpInfoOffsets, bytes);
            currentOffset += 8;
            console.log('exception: ' + start.index + ', ' + end.index + ', ' + handler.index + ', ' + catchType)
            // methodVisitor.visitTryCatchBlock(start, end, handler, catchType);
            this.tryCatches[tryCatchIndex] = new JvmTryCatch(start, end, handler, catchType);
            tryCatchIndex++;
        }

        // let stackMapFrameOffset = 0;
        // let stackMapTableEndOffset = 0;
        // let compressedFrames = true;
        let localVariableTableOffset = 0;
        let localVariableTypeTableOffset = 0;
        let visibleTypeAnnotationOffsets = null;
        let invisibleTypeAnnotationOffsets = null;
        // let attributes = null;

        let attributesCount = readUnsignedShort(bytes, currentOffset);
        currentOffset += 2;
        while (attributesCount-- > 0) {
            let attributeName = readUTF8(this.constantUtf8Values, currentOffset, this.cpInfoOffsets, bytes);
            let attributeLength = readInt(bytes, currentOffset + 2);
            currentOffset += 6;
            if ('LocalVariableTable' === attributeName) {
                localVariableTableOffset = currentOffset;
                let currentLocalVariableTableOffset = currentOffset;
                let localVariableTableLength = readUnsignedShort(bytes, currentLocalVariableTableOffset);
                currentLocalVariableTableOffset += 2;
                while (localVariableTableLength-- > 0) {
                    let startPc = readUnsignedShort(bytes, currentLocalVariableTableOffset);
                    // createDebugLabel(startPc, labels);
                    this.#createLabel(startPc, labels);
                    let length = readUnsignedShort(bytes, currentLocalVariableTableOffset + 2);
                    // createDebugLabel(startPc + length, labels);
                    this.#createLabel(startPc + length, labels);
                    currentLocalVariableTableOffset += 10;
                }
            } else if ('LocalVariableTypeTable' === attributeName) {
                localVariableTypeTableOffset = currentOffset;
            } else if ('LineNumberTable' === attributeName) {
                let currentLineNumberTableOffset = currentOffset;
                let lineNumberTableLength = readUnsignedShort(bytes, currentLineNumberTableOffset);
                currentLineNumberTableOffset += 2;
                while (lineNumberTableLength-- > 0) {
                    let startPc = readUnsignedShort(bytes, currentLineNumberTableOffset);
                    let lineNumber = readUnsignedShort(bytes, currentLineNumberTableOffset + 2);
                    currentLineNumberTableOffset += 4;
                    // createDebugLabel(startPc, labels);
                    this.#createLabel(startPc, labels, lineNumber);
                    // labels[startPc].addLineNumber(lineNumber);
                }
            } else if ('RuntimeVisibleTypeAnnotations' === attributeName) {
                // visibleTypeAnnotationOffsets =
                //     readTypeAnnotations(methodVisitor, context, currentOffset, /* visible = */ true);
            } else if ('RuntimeInvisibleTypeAnnotations' === attributeName) {
                // invisibleTypeAnnotationOffsets =
                //     readTypeAnnotations(methodVisitor, context, currentOffset, /* visible = */ false);
            } else if ('StackMapTable' === attributeName) {
                // if (FRAMES) {
                //     stackMapFrameOffset = currentOffset + 2;
                //     stackMapTableEndOffset = currentOffset + attributeLength;
                // }
            } else if ("StackMap" === attributeName) {
                // if (FRAMES) {
                //     stackMapFrameOffset = currentOffset + 2;
                //     stackMapTableEndOffset = currentOffset + attributeLength;
                //     compressedFrames = false;
                // }
            } else {
                // Attribute attribute =
                //     readAttribute(
                //         context.attributePrototypes,
                //         attributeName,
                //         currentOffset,
                //         attributeLength,
                //         charBuffer,
                //         codeOffset,
                //         labels);
                // attribute.nextAttribute = attributes;
                // attributes = attribute;
            }
            currentOffset += attributeLength;
        }

        // SKIP FRAMES

        let currentVisibleTypeAnnotationIndex = 0;
        let currentVisibleTypeAnnotationBytecodeOffset = this.getTypeAnnotationBytecodeOffset(visibleTypeAnnotationOffsets, 0);
        let currentInvisibleTypeAnnotationIndex = 0;
        let currentInvisibleTypeAnnotationBytecodeOffset = this.getTypeAnnotationBytecodeOffset(invisibleTypeAnnotationOffsets, 0);

        const instructions = {};

        let instructionIndex = 0;
        currentOffset = bytecodeStartOffset;
        console.log(this.name)
        while (currentOffset < bytecodeEndOffset) {
            const currentBytecodeOffset = currentOffset - bytecodeStartOffset;

            console.log('')
            console.log('currentBytecodeOffset:', currentBytecodeOffset)

            // Visit the instruction at this bytecode offset.
            let opcode = bytes[currentOffset] & 0xFF;

            let currentLabel = labels[currentBytecodeOffset];
            if (currentLabel != null) {
                // currentLabel.accept(methodVisitor, (context.parsingOptions & SKIP_DEBUG) == 0);
                console.log('insnIndex:', instructionIndex, 'label:', currentLabel.index, 'line:', currentLabel.lineNumber)
            }
            console.log('insnIndex:', instructionIndex, 'opcode:', opcode, 'reverseOpcode:', OpcodesReverse[opcode])

            // console.log('instructionIndex:', instructionIndex, 'opcode:', opcode, 'reverseOpcode:', OpcodesReverse[opcode])
            switch (opcode) {
                case Opcodes.NOP:
                case Opcodes.ACONST_NULL:
                case Opcodes.ICONST_M1:
                case Opcodes.ICONST_0:
                case Opcodes.ICONST_1:
                case Opcodes.ICONST_2:
                case Opcodes.ICONST_3:
                case Opcodes.ICONST_4:
                case Opcodes.ICONST_5:
                case Opcodes.LCONST_0:
                case Opcodes.LCONST_1:
                case Opcodes.FCONST_0:
                case Opcodes.FCONST_1:
                case Opcodes.FCONST_2:
                case Opcodes.DCONST_0:
                case Opcodes.DCONST_1:
                case Opcodes.IALOAD:
                case Opcodes.LALOAD:
                case Opcodes.FALOAD:
                case Opcodes.DALOAD:
                case Opcodes.AALOAD:
                case Opcodes.BALOAD:
                case Opcodes.CALOAD:
                case Opcodes.SALOAD:
                case Opcodes.IASTORE:
                case Opcodes.LASTORE:
                case Opcodes.FASTORE:
                case Opcodes.DASTORE:
                case Opcodes.AASTORE:
                case Opcodes.BASTORE:
                case Opcodes.CASTORE:
                case Opcodes.SASTORE:
                case Opcodes.POP:
                case Opcodes.POP2:
                case Opcodes.DUP:
                case Opcodes.DUP_X1:
                case Opcodes.DUP_X2:
                case Opcodes.DUP2:
                case Opcodes.DUP2_X1:
                case Opcodes.DUP2_X2:
                case Opcodes.SWAP:
                case Opcodes.IADD:
                case Opcodes.LADD:
                case Opcodes.FADD:
                case Opcodes.DADD:
                case Opcodes.ISUB:
                case Opcodes.LSUB:
                case Opcodes.FSUB:
                case Opcodes.DSUB:
                case Opcodes.IMUL:
                case Opcodes.LMUL:
                case Opcodes.FMUL:
                case Opcodes.DMUL:
                case Opcodes.IDIV:
                case Opcodes.LDIV:
                case Opcodes.FDIV:
                case Opcodes.DDIV:
                case Opcodes.IREM:
                case Opcodes.LREM:
                case Opcodes.FREM:
                case Opcodes.DREM:
                case Opcodes.INEG:
                case Opcodes.LNEG:
                case Opcodes.FNEG:
                case Opcodes.DNEG:
                case Opcodes.ISHL:
                case Opcodes.LSHL:
                case Opcodes.ISHR:
                case Opcodes.LSHR:
                case Opcodes.IUSHR:
                case Opcodes.LUSHR:
                case Opcodes.IAND:
                case Opcodes.LAND:
                case Opcodes.IOR:
                case Opcodes.LOR:
                case Opcodes.IXOR:
                case Opcodes.LXOR:
                case Opcodes.I2L:
                case Opcodes.I2F:
                case Opcodes.I2D:
                case Opcodes.L2I:
                case Opcodes.L2F:
                case Opcodes.L2D:
                case Opcodes.F2I:
                case Opcodes.F2L:
                case Opcodes.F2D:
                case Opcodes.D2I:
                case Opcodes.D2L:
                case Opcodes.D2F:
                case Opcodes.I2B:
                case Opcodes.I2C:
                case Opcodes.I2S:
                case Opcodes.LCMP:
                case Opcodes.FCMPL:
                case Opcodes.FCMPG:
                case Opcodes.DCMPL:
                case Opcodes.DCMPG:
                case Opcodes.IRETURN:
                case Opcodes.LRETURN:
                case Opcodes.FRETURN:
                case Opcodes.DRETURN:
                case Opcodes.ARETURN:
                case Opcodes.RETURN:
                case Opcodes.ARRAYLENGTH:
                case Opcodes.ATHROW:
                case Opcodes.MONITORENTER:
                case Opcodes.MONITOREXIT:
                    // methodVisitor.visitInsn(opcode);
                    instructions[currentBytecodeOffset] = new InsnNode(opcode);
                    currentOffset += 1;
                    break;
                case Opcodes.ILOAD_0:
                case Opcodes.ILOAD_1:
                case Opcodes.ILOAD_2:
                case Opcodes.ILOAD_3:
                case Opcodes.LLOAD_0:
                case Opcodes.LLOAD_1:
                case Opcodes.LLOAD_2:
                case Opcodes.LLOAD_3:
                case Opcodes.FLOAD_0:
                case Opcodes.FLOAD_1:
                case Opcodes.FLOAD_2:
                case Opcodes.FLOAD_3:
                case Opcodes.DLOAD_0:
                case Opcodes.DLOAD_1:
                case Opcodes.DLOAD_2:
                case Opcodes.DLOAD_3:
                case Opcodes.ALOAD_0:
                case Opcodes.ALOAD_1:
                case Opcodes.ALOAD_2:
                case Opcodes.ALOAD_3:
                    opcode -= Opcodes.ILOAD_0;
                    // methodVisitor.visitVarInsn(Opcodes.ILOAD + (opcode >> 2), opcode & 0x3);
                    currentOffset += 1;
                    break;
                case Opcodes.ISTORE_0:
                case Opcodes.ISTORE_1:
                case Opcodes.ISTORE_2:
                case Opcodes.ISTORE_3:
                case Opcodes.LSTORE_0:
                case Opcodes.LSTORE_1:
                case Opcodes.LSTORE_2:
                case Opcodes.LSTORE_3:
                case Opcodes.FSTORE_0:
                case Opcodes.FSTORE_1:
                case Opcodes.FSTORE_2:
                case Opcodes.FSTORE_3:
                case Opcodes.DSTORE_0:
                case Opcodes.DSTORE_1:
                case Opcodes.DSTORE_2:
                case Opcodes.DSTORE_3:
                case Opcodes.ASTORE_0:
                case Opcodes.ASTORE_1:
                case Opcodes.ASTORE_2:
                case Opcodes.ASTORE_3:
                    opcode -= Opcodes.ISTORE_0;
                    // methodVisitor.visitVarInsn(Opcodes.ISTORE + (opcode >> 2), opcode & 0x3);
                    currentOffset += 1;
                    break;
                case Opcodes.IFEQ:
                case Opcodes.IFNE:
                case Opcodes.IFLT:
                case Opcodes.IFGE:
                case Opcodes.IFGT:
                case Opcodes.IFLE:
                case Opcodes.IF_ICMPEQ:
                case Opcodes.IF_ICMPNE:
                case Opcodes.IF_ICMPLT:
                case Opcodes.IF_ICMPGE:
                case Opcodes.IF_ICMPGT:
                case Opcodes.IF_ICMPLE:
                case Opcodes.IF_ACMPEQ:
                case Opcodes.IF_ACMPNE:
                case Opcodes.GOTO:
                case Opcodes.JSR:
                case Opcodes.IFNULL:
                case Opcodes.IFNONNULL:
                    // methodVisitor.visitJumpInsn(
                    //     opcode, labels[currentBytecodeOffset + readShort(currentOffset + 1)]);
                    currentOffset += 3;
                    break;
                case Opcodes.GOTO_W:
                case Opcodes.JSR_W:
                    // methodVisitor.visitJumpInsn(
                    //     opcode - wideJumpOpcodeDelta,
                    //     labels[currentBytecodeOffset + readInt(currentOffset + 1)]);
                    currentOffset += 5;
                    break;
                case Opcodes.ASM_IFEQ:
                case Opcodes.ASM_IFNE:
                case Opcodes.ASM_IFLT:
                case Opcodes.ASM_IFGE:
                case Opcodes.ASM_IFGT:
                case Opcodes.ASM_IFLE:
                case Opcodes.ASM_IF_ICMPEQ:
                case Opcodes.ASM_IF_ICMPNE:
                case Opcodes.ASM_IF_ICMPLT:
                case Opcodes.ASM_IF_ICMPGE:
                case Opcodes.ASM_IF_ICMPGT:
                case Opcodes.ASM_IF_ICMPLE:
                case Opcodes.ASM_IF_ACMPEQ:
                case Opcodes.ASM_IF_ACMPNE:
                case Opcodes.ASM_GOTO:
                case Opcodes.ASM_JSR:
                case Opcodes.ASM_IFNULL:
                case Opcodes.ASM_IFNONNULL: {
                    // opcode =
                    //     opcode < Opcodes.ASM_IFNULL
                    //         ? opcode - Opcodes.ASM_OPCODE_DELTA
                    //         : opcode - Opcodes.ASM_IFNULL_OPCODE_DELTA;
                    // Label target = labels[currentBytecodeOffset + readUnsignedShort(currentOffset + 1)];
                    // if (opcode == Opcodes.GOTO || opcode == Opcodes.JSR) {
                    //     // Replace GOTO with GOTO_W and JSR with JSR_W.
                    //     methodVisitor.visitJumpInsn(opcode + Opcodes.WIDE_JUMP_OPCODE_DELTA, target);
                    // } else {
                    //     // Compute the "opposite" of opcode. This can be done by flipping the least
                    //     // significant bit for IFNULL and IFNONNULL, and similarly for IFEQ ... IF_ACMPEQ
                    //     // (with a pre and post offset by 1).
                    //     opcode = opcode < Opcodes.GOTO ? ((opcode + 1) ^ 1) - 1 : opcode ^ 1;
                    //     Label endif = createLabel(currentBytecodeOffset + 3, labels);
                    //     methodVisitor.visitJumpInsn(opcode, endif);
                    //     methodVisitor.visitJumpInsn(Constants.GOTO_W, target);
                    //     // endif designates the instruction just after GOTO_W, and is visited as part of the
                    //     // next instruction. Since it is a jump target, we need to insert a frame here.
                    //     insertFrame = true;
                    // }
                    currentOffset += 3;
                    break;
                }
                case Opcodes.ASM_GOTO_W:
                    // // Replace ASM_GOTO_W with GOTO_W.
                    // methodVisitor.visitJumpInsn(
                    //     Opcodes.GOTO_W, labels[currentBytecodeOffset + readInt(currentOffset + 1)]);
                    // // The instruction just after is a jump target (because ASM_GOTO_W is used in patterns
                    // // IFNOTxxx <L> ASM_GOTO_W <l> L:..., see MethodWriter), so we need to insert a frame
                    // // here.
                    // insertFrame = true;
                    currentOffset += 5;
                    break;
                case Opcodes.WIDE:
                    opcode = bytes[currentOffset + 1] & 0xFF;
                    if (opcode == Opcodes.IINC) {
                        // methodVisitor.visitIincInsn(
                        //     readUnsignedShort(currentOffset + 2), readShort(currentOffset + 4));
                        currentOffset += 6;
                    } else {
                        // methodVisitor.visitVarInsn(opcode, readUnsignedShort(currentOffset + 2));
                        currentOffset += 4;
                    }
                    break;
                case Opcodes.TABLESWITCH: {
                    // Skip 0 to 3 padding bytes.
                    currentOffset += 4 - (currentBytecodeOffset & 3);
                    // Read the instruction.
                    let defaultLabel = labels[currentBytecodeOffset + readInt(bytes, currentOffset)];
                    let low = readInt(bytes, currentOffset + 4);
                    let high = readInt(bytes, currentOffset + 8);
                    currentOffset += 12;
                    let table = [...Array(high - low + 1)].fill(null);
                    for (let i = 0; i < table.length; ++i) {
                        table[i] = labels[currentBytecodeOffset + readInt(bytes, currentOffset)];
                        currentOffset += 4;
                    }
                    // methodVisitor.visitTableSwitchInsn(low, high, defaultLabel, table);
                    break;
                }
                case Opcodes.LOOKUPSWITCH: {
                    // // Skip 0 to 3 padding bytes.
                    // currentOffset += 4 - (currentBytecodeOffset & 3);
                    // // Read the instruction.
                    let defaultLabel = labels[currentBytecodeOffset + readInt(bytes, currentOffset)];
                    let numPairs = readInt(bytes, currentOffset + 4);
                    currentOffset += 8;
                    let keys = [...Array(numPairs)].fill(null);
                    let values = [...Array(numPairs)].fill(null);
                    for (let i = 0; i < numPairs; ++i) {
                        keys[i] = readInt(bytes, currentOffset);
                        values[i] = labels[currentBytecodeOffset + readInt(bytes, currentOffset + 4)];
                        currentOffset += 8;
                    }
                    // methodVisitor.visitLookupSwitchInsn(defaultLabel, keys, values);
                    break;
                }
                case Opcodes.ILOAD:
                case Opcodes.LLOAD:
                case Opcodes.FLOAD:
                case Opcodes.DLOAD:
                case Opcodes.ALOAD:
                case Opcodes.ISTORE:
                case Opcodes.LSTORE:
                case Opcodes.FSTORE:
                case Opcodes.DSTORE:
                case Opcodes.ASTORE:
                case Opcodes.RET:
                    // methodVisitor.visitVarInsn(opcode, classBuffer[currentOffset + 1] & 0xFF);
                    currentOffset += 2;
                    break;
                case Opcodes.BIPUSH:
                case Opcodes.NEWARRAY:
                    // methodVisitor.visitIntInsn(opcode, classBuffer[currentOffset + 1]);
                    currentOffset += 2;
                    break;
                case Opcodes.SIPUSH:
                    // methodVisitor.visitIntInsn(opcode, readShort(currentOffset + 1));
                    currentOffset += 3;
                    break;
                case Opcodes.LDC:
                    // methodVisitor.visitLdcInsn(readConst(classBuffer[currentOffset + 1] & 0xFF, charBuffer));
                    currentOffset += 2;
                    break;
                case Opcodes.LDC_W:
                case Opcodes.LDC2_W:
                    // methodVisitor.visitLdcInsn(readConst(readUnsignedShort(currentOffset + 1), charBuffer));
                    currentOffset += 3;
                    break;
                case Opcodes.GETSTATIC:
                case Opcodes.PUTSTATIC:
                case Opcodes.GETFIELD:
                case Opcodes.PUTFIELD:
                case Opcodes.INVOKEVIRTUAL:
                case Opcodes.INVOKESPECIAL:
                case Opcodes.INVOKESTATIC:
                case Opcodes.INVOKEINTERFACE: {
                    // int cpInfoOffset = cpInfoOffsets[readUnsignedShort(currentOffset + 1)];
                    // int nameAndTypeCpInfoOffset = cpInfoOffsets[readUnsignedShort(cpInfoOffset + 2)];
                    // String owner = readClass(cpInfoOffset, charBuffer);
                    // String name = readUTF8(nameAndTypeCpInfoOffset, charBuffer);
                    // String descriptor = readUTF8(nameAndTypeCpInfoOffset + 2, charBuffer);
                    // if (opcode < Opcodes.INVOKEVIRTUAL) {
                    //     methodVisitor.visitFieldInsn(opcode, owner, name, descriptor);
                    // } else {
                    //     boolean isInterface =
                    //         classBuffer[cpInfoOffset - 1] == Symbol.CONSTANT_INTERFACE_METHODREF_TAG;
                    //     methodVisitor.visitMethodInsn(opcode, owner, name, descriptor, isInterface);
                    // }
                    if (opcode == Opcodes.INVOKEINTERFACE) {
                        currentOffset += 5;
                    } else {
                        currentOffset += 3;
                    }
                    break;
                }
                case Opcodes.INVOKEDYNAMIC: {
                    // int cpInfoOffset = cpInfoOffsets[readUnsignedShort(currentOffset + 1)];
                    // int nameAndTypeCpInfoOffset = cpInfoOffsets[readUnsignedShort(cpInfoOffset + 2)];
                    // String name = readUTF8(nameAndTypeCpInfoOffset, charBuffer);
                    // String descriptor = readUTF8(nameAndTypeCpInfoOffset + 2, charBuffer);
                    // int bootstrapMethodOffset = bootstrapMethodOffsets[readUnsignedShort(cpInfoOffset)];
                    // Handle handle =
                    // (Handle) readConst(readUnsignedShort(bootstrapMethodOffset), charBuffer);
                    // Object[] bootstrapMethodArguments =
                    // new Object[readUnsignedShort(bootstrapMethodOffset + 2)];
                    // bootstrapMethodOffset += 4;
                    // for (int i = 0; i < bootstrapMethodArguments.length; i++) {
                    //     bootstrapMethodArguments[i] =
                    //         readConst(readUnsignedShort(bootstrapMethodOffset), charBuffer);
                    //     bootstrapMethodOffset += 2;
                    // }
                    // methodVisitor.visitInvokeDynamicInsn(
                    //     name, descriptor, handle, bootstrapMethodArguments);
                    currentOffset += 5;
                    break;
                }
                case Opcodes.NEW:
                case Opcodes.ANEWARRAY:
                case Opcodes.CHECKCAST:
                case Opcodes.INSTANCEOF:
                    // methodVisitor.visitTypeInsn(opcode, readClass(currentOffset + 1, charBuffer));
                    currentOffset += 3;
                    break;
                case Opcodes.IINC:
                    // methodVisitor.visitIincInsn(
                    //     classBuffer[currentOffset + 1] & 0xFF, classBuffer[currentOffset + 2]);
                    currentOffset += 3;
                    break;
                case Opcodes.MULTIANEWARRAY:
                    // methodVisitor.visitMultiANewArrayInsn(
                    //     readClass(currentOffset + 1, charBuffer), classBuffer[currentOffset + 3] & 0xFF);
                    currentOffset += 4;
                    break;
                default:
                    throw new Error('AssertionError');
            }
            instructionIndex++;
        }
        this.instructions = instructions;

        this.jvmFunction.load(this.instructions, this.tryCatches);
    }

    getTypeAnnotationBytecodeOffset(typeAnnotationOffsets, typeAnnotationIndex) {
        if (typeAnnotationOffsets == null || typeAnnotationIndex >= typeAnnotationOffsets.length
                || readByte(this.bytes, typeAnnotationOffsets[typeAnnotationIndex]) < 0x43) {
            return -1;
        }
        return readUnsignedShort(this.bytes, typeAnnotationOffsets[typeAnnotationIndex] + 1);
    }

    /**
     * Create a label (or return existing) at index
     * @param index {int}
     * @param labels {[]}
     * @param lineNumber {int|false}
     * @returns {JvmLabel}
     */
    #createLabel(index, labels, lineNumber = false) {
        console.log('creating label at index ' + index)
        if (labels[index] === null)
            return labels[index] = JvmLabel.createLabel(index, lineNumber);
        return labels[index];
    }

}