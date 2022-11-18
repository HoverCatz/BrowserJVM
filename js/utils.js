/* Attempt deep-cloning objects */
const cloneObject = (input) => {
    if (input instanceof String || input instanceof Number) {
        return input;
    }
    if (typeof input === 'object') {
        const cloned = Object.assign({}, input); // Attempt deep-cloning
        if (compareObjects(input, cloned))
            return cloned;
    }
    return input;
}

/* Compare two objects */
const compareObjects = (in1, in2) => {
    if (in1 === in2) return true;
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