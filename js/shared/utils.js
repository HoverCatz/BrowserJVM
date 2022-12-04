/* Attempt deep-cloning objects */
function deepCloneObject(input, cache = null) {
    if (input == null)
        return input;
    const type = typeof input;
    if (type === 'string' || type === 'number' ||
        type === 'boolean' || type === 'function' ||
        type === 'bigint')
        return input;
    if (type === 'object') {
        if (input instanceof Date)
            return new Date(input.getTime());
        if (cache !== null && cache.has(input))
            return cache.get(input);
        if (input instanceof Array) {
            const len = input.length;
            const cloned = [...Array(len)];
            if (cache === null) cache = new WeakMap();
            cache.set(input, cloned);
            for (let i = 0; i < len; i++)
                cloned[i] = deepCloneObject(input[i], cache);
            return cloned;
        }
        if (input instanceof Object) {
            const cloned = {};
            if (cache === null) cache = new WeakMap();
            cache.set(input, cloned);
            for (let attr in input)
                if (input.hasOwnProperty(attr))
                    cloned[attr] = deepCloneObject(input[attr], cache);
            return cloned;
        }
    }
    console.warn('Unknown type `' + type + '`, not sure if deepCloneObject works or not.');
    return input;
}

/* Compare two objects */
function compareObjects(in1, in2, strict = false) {
    if ((!strict && in1 == in2) || (strict && in1 === in2 ))
        return true;
    if (in1 == null && in2 != null) return false;
    if (in2 == null && in1 != null) return false;
    try {
        const json1 = JSON.stringify(in1);
        const json2 = JSON.stringify(in2);
        if (json1 === json2)
            return true;
    } catch { }
    try {
        const entries1 = Object.entries(in1).toString();
        const entries2 = Object.entries(in2).toString();
        if (entries1 === entries2)
            return true;
    } catch { }
    return false;
}

/* Case object from A to B */
/**
 * Cast object {obj} to type {toType}
 * @param obj {any}
 * @param toType {string}
 * @returns {string|number|BigInt|boolean|JvmNumber|false}
 */
function castObjectTo(obj, toType) {
    if (obj == null)
        return obj;
    const type = (typeof obj).toLowerCase();
    if (type === 'undefined')
        return obj;
    toType = toType.toLowerCase();
    if (obj instanceof JvmNumber) {
        switch (toType) {
            case 'string':
                return obj.toString();
            case 'number': {
                const val = obj.get();
                if (typeof val === 'bigint')
                    return Number(val);
                return val;
            } break;
            case 'bigint': {
                const val = obj.get();
                if (typeof val === 'number')
                    return BigInt(val);
                return val;
            } break;
            case 'boolean': {
                let val = obj.get();
                if (typeof val === 'bigint')
                    val = Number(val);
                return val !== 0;
            } break;
            case 'b': case 'JvmByte'.toLowerCase(): return JvmByte.of(obj.get());
            case 'c': case 'JvmChar'.toLowerCase(): return JvmChar.of(obj.get());
            case 's': case 'JvmShort'.toLowerCase(): return JvmShort.of(obj.get());
            case 'i': case 'JvmInteger'.toLowerCase(): return JvmInteger.of(obj.get());
            case 'f': case 'JvmFloat'.toLowerCase(): return JvmFloat.of(obj.get());
            case 'j': case 'JvmLong'.toLowerCase(): return JvmLong.of(obj.get());
            case 'd': case 'JvmDouble'.toLowerCase(): return JvmDouble.of(obj.get());
        }
    }
    switch (type) {
        case 'number': {
            switch (toType) {
                case 'string':
                    return obj.toString();
                case 'i':
                case 'int':
                case 'integer':
                case 'number':
                    return obj;
                case 'bigint':
                    return BigInt(obj);
                case 'boolean':
                    return obj !== 0;
                case 'JvmByte'.toLowerCase(): return JvmByte.of(obj);
                case 'JvmChar'.toLowerCase(): return JvmChar.of(obj);
                case 'JvmShort'.toLowerCase(): return JvmShort.of(obj);
                case 'JvmInteger'.toLowerCase(): return JvmInteger.of(obj);
                case 'JvmFloat'.toLowerCase(): return JvmFloat.of(obj);
                case 'JvmLong'.toLowerCase(): return JvmLong.of(obj);
                case 'JvmDouble'.toLowerCase(): return JvmDouble.of(obj);
            }
        } break;
        case 'bigint': {
            switch (toType) {
                case 'string':
                    return obj.toString();
                case 'i':
                case 'int':
                case 'integer':
                case 'number':
                    return Number(obj);
                case 'bigint':
                    return obj;
                case 'JvmByte'.toLowerCase(): return JvmByte.of(obj);
                case 'JvmChar'.toLowerCase(): return JvmChar.of(obj);
                case 'JvmShort'.toLowerCase(): return JvmShort.of(obj);
                case 'JvmInteger'.toLowerCase(): return JvmInteger.of(obj);
                case 'JvmFloat'.toLowerCase(): return JvmFloat.of(obj);
                case 'JvmLong'.toLowerCase(): return JvmLong.of(obj);
                case 'JvmDouble'.toLowerCase(): return JvmDouble.of(obj);
            }
        } break;
        case 'string': {
            const lower = obj.toLowerCase();
            switch (toType) {
                case 'string':
                    return obj;
                case 'i':
                case 'int':
                case 'integer':
                case 'number': {
                    const val = parseInt(obj);
                    if (isNaN(val))
                        return (lower === 'true') ? 1 : (lower === 'false') ? 0 : val;
                    return val;
                } break;
                case 'bigint':
                    if (lower === 'true') return 1n; else
                    if (lower === 'false') return 0n; else
                    try {
                        return BigInt(obj);
                    } catch (e) {
                        return NaN;
                    }
                case 'boolean':
                    return lower === 'true';
                case 'JvmByte'.toLowerCase(): return JvmByte.of(Number(obj));
                case 'JvmChar'.toLowerCase(): return JvmChar.of(Number(obj));
                case 'JvmShort'.toLowerCase(): return JvmShort.of(Number(obj));
                case 'JvmInteger'.toLowerCase(): return JvmInteger.of(Number(obj));
                case 'JvmFloat'.toLowerCase(): return JvmFloat.of(Number(obj));
                case 'JvmLong'.toLowerCase(): return JvmLong.of(Number(obj));
                case 'JvmDouble'.toLowerCase(): return JvmDouble.of(Number(obj));
            }
        } break;
        case 'boolean': {
            const isTrue = obj === true;
            switch (toType) {
                case 'string':
                    return isTrue ? 'true' : 'false';
                case 'i':
                case 'int':
                case 'integer':
                case 'number':
                    return isTrue ? 1 : 0;
                case 'bigint':
                    return isTrue ? 1n : 0n;
                case 'JvmByte'.toLowerCase(): return JvmByte.of(isTrue ? 1 : 0);
                case 'JvmChar'.toLowerCase(): return JvmChar.of(isTrue ? 1 : 0);
                case 'JvmShort'.toLowerCase(): return JvmShort.of(isTrue ? 1 : 0);
                case 'JvmInteger'.toLowerCase(): return JvmInteger.of(isTrue ? 1 : 0);
                case 'JvmFloat'.toLowerCase(): return JvmFloat.of(isTrue ? 1 : 0);
                case 'JvmLong'.toLowerCase(): return JvmLong.of(isTrue ? 1 : 0);
                case 'JvmDouble'.toLowerCase(): return JvmDouble.of(isTrue ? 1 : 0);
            }
        } break;
    }
    console.warn('Not sure what to cast here? Type=' + type + ', ToType=' + toType);
    return obj;
}

/* Get object type string */
function getTypeString(obj) {
    if (obj === null) return 'null';
    const type = typeof obj;
    if (type === 'undefined') return 'undefined'; else
    if (type === 'function') return 'function';
    if (obj instanceof JvmNumber)
        return obj.getAsmType();
    else if (obj instanceof JvmClass)
        return obj.getPath(true);
    else if (obj instanceof JvmArray) // TODO: Check if this causes an issue
        return '[' + getTypeString(obj.value);
    return obj.constructor.name;
}

/* Add {value} to {list} by key {name_desc} */
function addToList(list, name_desc, value) {
    if (name_desc in list) {
        throw new Error('List already contains the key `' + name_desc + '`.');
    }
    list[name_desc] = value;
}

function isJvmType(object, type) {
    // Check for numbers
    if (type === 'JvmNumber')                  return object instanceof JvmNumber;
    if (type === 'JvmByte' || type === 'B')    return object instanceof JvmByte;
    if (type === 'JvmChar' || type === 'C')    return object instanceof JvmChar;
    if (type === 'JvmShort' || type === 'S')   return object instanceof JvmShort;
    if (type === 'JvmInteger' || type === 'I') return object instanceof JvmInteger;
    if (type === 'JvmFloat' || type === 'F')   return object instanceof JvmFloat;
    if (type === 'JvmLong' || type === 'J')    return object instanceof JvmLong;
    if (type === 'JvmDouble' || type === 'D')  return object instanceof JvmDouble;
    if (type === 'JvmBoolean')                 return object instanceof JvmBoolean;
    // Check for object types
    if (type === 'JvmClass')                   return object instanceof JvmClass;
    if (type === 'JvmObject' || type === 'A')  return object instanceof JvmObject;
    if (type === 'JvmString')                  return object instanceof JvmString;
    if (type === 'JvmArray')                   return object instanceof JvmArray;
    // Check for specific JvmArray inner-type
    if (type.startsWith('JvmArray<') && type.endsWith('>') && object instanceof JvmArray) {
        const innerType = getJvmArrayInnerType(type);
        if (innerType === object.asmType)
            return true;
        if (innerType === 'JvmNumber' && !!isJvmNumber(object.asmType))
            return true;
        return false;
    }
    // Check for errors
    if (type === 'JvmError')                   return object instanceof JvmError;
    // Otherwise false
    return false;
}

function getJvmTypeString(object, short = false) {
    // Check for numbers
    if (object instanceof JvmByte) return !short ? 'JvmByte' : 'B';
    if (object instanceof JvmChar) return !short ? 'JvmChar' : 'C';
    if (object instanceof JvmShort) return !short ? 'JvmShort' : 'S';
    if (object instanceof JvmInteger) return !short ? 'JvmInteger' : 'I';
    if (object instanceof JvmFloat) return !short ? 'JvmFloat' : 'F';
    if (object instanceof JvmLong) return !short ? 'JvmLong' : 'J';
    if (object instanceof JvmDouble) return !short ? 'JvmDouble' : 'D';
    if (object instanceof JvmBoolean) return !short ? 'JvmBoolean' : 'Z';
    if (object instanceof JvmNumber) return 'JvmNumber';
    // Check for object types
    if (object instanceof JvmClass) return 'JvmClass';
    if (object instanceof JvmString) return 'JvmString';
    if (object instanceof JvmArray) return `JvmArray<${object.asmType}>`;
    if (object instanceof JvmObject) return !short ? 'JvmObject' : 'A';
    // Check for errors
    if (object instanceof JvmError) return 'JvmError';
    // Check native js elements
    const type = typeof object;
    if (type === 'string') return 'string'; else
    if (type === 'number') return 'number'; else
    if (type === 'boolean') return 'boolean'; else
    if (type === 'function') return 'function'; else
    if (type === 'undefined') return 'undefined'; else
    if (type === 'bigint') return 'bigint'; else
    if (type === 'symbol') return 'symbol'; else
    // Probably 'object' at this point
    if (type === 'object') return 'object';
    console.log(`Invalid type: '${type}'`)
    return false;
}

function isJvmNumber(name) {
    switch (name) {
        case 'JvmNumber':
        case 'JvmByte':
        case 'JvmChar':
        case 'JvmShort':
        case 'JvmInteger':
        case 'JvmFloat':
        case 'JvmLong':
        case 'JvmDouble':
        case 'JvmBoolean':
            return true;
    }
    return false;
}

function isJvmObject(name) {
    switch (name) {
        case 'JvmString':
        case 'JvmArray':
        case 'JvmObject':
        case 'JvmClass':
            return true;
    }
    if (name.startsWith('JvmArray<') && name.endsWith('>'))
        return true;
    return false;
}

function getJvmArrayInnerType(name) {
    return name.substring(name.indexOf('<') + 1, name.lastIndexOf('>'));
}

function assertJvmType(name, object, type) {
    if (!isJvmType(object, type)) {
        throw new JvmError(`val${name} wasn't of type '${type}', it was '${getJvmTypeString(object)}' instead.`);
    }
}

function assertIsJvm(name, object, type) {
    type = asmTypeToJvmType(type, true);
    if (!(isJvmNumber(type) || isJvmObject(type))) {
        throw new JvmError(`val${name} wasn't a Jvm typed object, it was '${typeof object}' instead.`);
    }
}

function asmTypeToJvmType(asmType, returnOriginalIfFalse = false) {
    let arrayCount = 0;
    while (asmType.startsWith('[')) {
        asmType = asmType.substring(1);
        arrayCount++;
    }
    const prefix = '['.repeat(arrayCount);
    switch (asmType) {
        case 'B': return prefix + 'JvmByte';
        case 'C': return prefix + 'JvmChar';
        case 'S': return prefix + 'JvmShort';
        case 'I': return prefix + 'JvmInteger';
        case 'F': return prefix + 'JvmFloat';
        case 'J': return prefix + 'JvmLong';
        case 'D': return prefix + 'JvmDouble';
        case 'Z': return prefix + 'JvmBoolean';
    }
    switch (stripAsmDesc(asmType)) {
        case 'java/lang/Byte':      return prefix + 'JvmByte';
        case 'java/lang/Character': return prefix + 'JvmChar';
        case 'java/lang/Short':     return prefix + 'JvmShort';
        case 'java/lang/Integer':   return prefix + 'JvmInteger';
        case 'java/lang/Float':     return prefix + 'JvmFloat';
        case 'java/lang/Long':      return prefix + 'JvmLong';
        case 'java/lang/Double':    return prefix + 'JvmDouble';
        case 'java/lang/Boolean':   return prefix + 'JvmBoolean';

        case 'java/lang/CharSequence':
        case 'java/lang/String':    return prefix + 'JvmString';
        case 'java/lang/Object':    return prefix + 'JvmObject';
    }
    return returnOriginalIfFalse ? false : asmType;
}

/*
 * Compare the type of the object {value} to the asm type {asmType}.
 * Example values:
 *   a. value: string
 *   a. asmType: java/lang/String
 *   b. value: null
 *   b. asmType: java/lang/String
 *   c. value: 123 (JvmInteger)
 *   c. asmType: I
 */
function compareTypes(value, asmType) {
    // Check jvm types
    const jvmType = asmTypeToJvmType(asmType);
    if (!!jvmType && isJvmType(value, jvmType))
        return true;

    // Primitive values can't be null
    if (value == null && isPrimitiveType(asmType))
        return false;

    return false;
    // if (value == null) {
    //     switch (asmType) {
    //         case 'B': // byte
    //         case 'C': // char
    //         case 'S': // short
    //         case 'I': // int
    //         case 'F': // float
    //         case 'D': // double
    //         case 'J': // long
    //         case 'Z': // boolean
    //             // If our asm-type is primitive, it can't be null.
    //             // Anything else CAN be null tho.
    //             return false;
    //     }
    //     return true;
    // }
    // const type = typeof value;
    // if (type === 'string' && (asmType === 'java/lang/String' || asmType === 'java/lang/CharSequence')) return true;
    // if ((type === 'bool' || type === 'boolean') && (asmType === 'Z' || asmType === 'java/lang/Boolean')) return true;
    // if (getTypeString(value) === asmType)
    //     return true;
    // if (value instanceof JvmNumber && value.constructor.name === asmType)
    //     return true;
    // if (value instanceof JvmClass)
    //     return value.isInstanceOf(asmType) || value.constructor.name === asmType;
    // if (value instanceof JvmError && asmType === 'JvmError')
    //     return true;
    // return false;
}

function assertLdcType(ldcType) {
    switch (ldcType) {
/* int    */ case 3:
/* float  */ case 4:
/* long   */ case 5:
/* double */ case 6:
/* type   */ case 7:
/* string */ case 8: return;
    }
    throw new Error('IllegalStateException');
}

function assertAsmType(name, obj, asmType) {
    if (!compareTypes(obj, asmType)) {
        throw new JvmError(`val${name} wasn't of asmType '${asmType}', it was '${getTypeString(obj)}' instead.`);
    }
}

function getArrayCount(desc) {
    let count = 0;
    while (desc.startsWith('[')) {
        desc = desc.substring(1);
        count++;
    }
    return count;
}

function stripAsmDesc(desc) {
    while (desc.startsWith('['))
        desc = desc.substring(1);
    if (desc.startsWith('L'))
        desc = desc.substring(1, desc.length - 1);
    return desc;
}

function getReturnType(desc) {
    return desc.substring(desc.lastIndexOf(')') + 1);
}

function getArgumentTypes(desc) {
    desc = desc.substring(desc.indexOf('(') + 1, desc.indexOf(')'));
    if (desc.length === 0)
        return [];
    const types = [];
    let currentString = '';
    let inString = false;
    let inArray = 0;
    for (const index in desc) {
        const c = desc[index];
        if (c === '[') {
            inArray++;
            continue;
        }
        if (c === 'L') {
            inString = true;
            continue;
        }
        if (c === ';' && inString) {
            if (inArray) {
                types.push('['.repeat(inArray) + 'L' + currentString + ';');
            } else {
                types.push('L' + currentString + ';');
            }
            currentString = '';
            inString = false;
            inArray = 0;
            continue;
        }
        if (!inString) {
            if (inArray) {
                types.push('['.repeat(inArray) + c);
                inArray = 0;
            } else {
                types.push(c);
            }
        } else {
            currentString += c;
        }
    }
    return types;
}

function isPrimitiveType(desc) {
    switch (desc) {
        case 'B':
        case 'C':
        case 'S':
        case 'I':
        case 'F':
        case 'D':
        case 'J':
        case 'Z':
        case 'V':
            return true;
    }
    return false;
}

function isPrimitiveInstance(primObject, ofClass) {

}

function compareNumbers(x, y) {
    return (x < y) ? -1 : ((x === y) ? 0 : 1);
}

function compareFloats(f1, f2) {
    if (f1 < f2)
        return -1;
    if (f1 > f2)
        return 1;
    const thisBits = floatToIntBits(f1);
    const anotherBits = floatToIntBits(f2);
    return (thisBits === anotherBits ? 0 :
            (thisBits < anotherBits ? -1 :
             1));
}

function compareDoubles(d1, d2) {
    if (d1 < d2)
        return -1;
    if (d1 > d2)
        return 1;
    const thisBits = doubleToLongBits(d1);
    const anotherBits = doubleToLongBits(d2);
    return (thisBits === anotherBits ? 0 :
            (thisBits < anotherBits ? -1 :
             1));
}

/**
 *
 * @param asmType
 * @returns {JvmNumberType|false}
 */
function getNumberType(asmType) {
    switch (asmType.toLowerCase()) {
        // 8-bit
        case 'b': // B
        case 'byte': // Byte
        case 'java/lang/byte': // java/lang/Byte
        case 'ljava/lang/byte;': // Ljava/lang/Byte;
            return JvmNumberType.Byte; // JvmNumber type `byte`

        // 16-bit
        case 'c': // C
        case 'char': // Character
        case 'java/lang/character': // java/lang/Character
        case 'ljava/lang/character;': // Ljava/lang/Character;
            return JvmNumberType.Char; // JvmNumber type `char`
        case 's': // S
        case 'short': // Short
        case 'java/lang/short': // java/lang/Short
        case 'ljava/lang/short;': // Ljava/lang/Short;
            return JvmNumberType.Short; // JvmNumber type `short`

        // 32-bit
        case 'i': // I
        case 'int':
        case 'integer': // Integer
        case 'java/lang/integer': // java/lang/Integer
        case 'ljava/lang/integer;': // Ljava/lang/Integer;
            return JvmNumberType.Int; // JvmNumber type `int`
        case 'f': // F
        case 'float': // float/Float
        case 'java/lang/float': // java/lang/Float
        case 'ljava/lang/float;': // Ljava/lang/Float;
            return JvmNumberType.Float; // JvmNumber type `float`

        // 64-bit
        case 'j': // J
        case 'long': // long/Long
        case 'java/lang/long': // java/lang/Long
        case 'ljava/lang/long;': // Ljava/lang/Long;
            return JvmNumberType.Long; // JvmNumber type `long`
        case 'd': // D
        case 'double': // double/Double
        case 'java/lang/double': // java/lang/Double
        case 'ljava/lang/double;': // Ljava/lang/Double;
            return JvmNumberType.Double; // JvmNumber type `double`
    }
    return false;
}

/**
 * Create a new JvmNumber for the specific type
 * @param value {number|BigInt}
 * @param type {JvmNumberType}
 * @returns {JvmByte|JvmChar|JvmShort|JvmInteger|JvmFloat|JvmLong|JvmDouble|false}
 */
function newJvmNumber(value, type = null) {
    switch (type) {
        // 8-bit
        case JvmNumberType.Byte: return new JvmByte(value);
        // 16-bit
        case JvmNumberType.Char: return new JvmChar(value);
        case JvmNumberType.Short: return new JvmShort(value);
        // 32-bit
        case JvmNumberType.Int: return new JvmInteger(value);
        case JvmNumberType.Float: return new JvmFloat(value);
        // 64-bit
        case JvmNumberType.Long: return new JvmLong(value);
        case JvmNumberType.Double: return new JvmDouble(value);
        default: {
            if (value instanceof JvmNumber) {
                const type = value.getAsmType();
                const numberType = getNumberType(type);
                if (numberType) {
                    return newJvmNumber(value, numberType);
                }
            }
        }
    }
    return false;
}