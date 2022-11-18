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
function castObjectTo(obj, toType) {
    if (obj == null) return obj;
    const type = typeof obj;
    switch (toType) {
        case 'int':
        case 'number': {
            if (type === 'string')
                return parseInt(obj);
            if (type === 'number')
                return obj;
            if (type === 'boolean')
                return (obj === true) ? 1 : 0;
            return parseInt(obj.toString());
        } break;
        case 'string': {
            if (type === 'string')
                return obj;
            if (type === 'boolean')
                return (obj === true) ? 'true' : 'false';
            return obj.toString();
        } break;
        case 'boolean': {
            if (type === 'string')
                return obj.toString().toLowerCase() === 'true';
            if (type === 'number')
                return obj.toString() !== '0';
            if (type === 'boolean')
                return obj;
            // Warning
        } break;
    }
    console.warn('Not sure what to cast here? Type=' + type + ', ToType=' + toType);
    return obj;
}