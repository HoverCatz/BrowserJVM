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
    if (value == null) {
        switch (asmType) {
            case 'B': // byte
            case 'C': // char
            case 'S': // short
            case 'I': // int
            case 'F': // float
            case 'D': // double
            case 'J': // long
            case 'Z': // boolean
                // If our asm-type is primitive, it can't be null.
                // Anything else CAN be null tho.
                return false;
        }
        return true;
    }
    const type = typeof value;
    if (type === 'string' && (asmType === 'java/lang/String' || asmType === 'java/lang/CharSequence')) return true;
    if ((type === 'bool' || type === 'boolean') && (asmType === 'Z' || asmType === 'java/lang/Boolean')) return true;
    if (getTypeString(value) === asmType)
        return true;
    if (value instanceof JvmNumber && value.constructor.name === asmType)
        return true;
    if (value instanceof JvmClass)
        return value.isInstanceOf(asmType) || value.constructor.name === asmType;
    return false;
}

function assertAsmType(name, obj, asmType) {
    if (!compareTypes(obj, asmType)) {
        throw new JvmError(`val${name} wasn't of asmType '${asmType}', it was '${getTypeString(obj)}' instead.`);
    }
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
    desc = desc.substring(1, desc.indexOf(')'));
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

function isPrimitiveDesc(desc) {
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