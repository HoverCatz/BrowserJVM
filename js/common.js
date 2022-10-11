// Dark mode! :)
document.write("<style>body{background-color:#292929;color:#f3f3f3}</style>");

const firstKey = list => { for (const k in list) return parseInt(k) };
const cloneList = list => list.map(x => x);
const verifyFieldAccess = field =>
{
    if (!field.owner) throw new Error("Field '" + field.name + ' ' + field.desc + "' doesn't have an owner.");
    let isInitialized = field.owner.initialized;
    if (debug) console.log('isInitialized', isInitialized);
    const isStatic = field.isStatic();
    if (debug) console.log('isStatic', isStatic);
    if (!isInitialized && !isStatic) throw new Error("Static instance of class '" + field.owner.name + "' can't access non-static field '" + field.name + ' ' + field.desc + "'.");
}
const verifyFunctionAccess = func =>
{
    if (!func.owner) throw new Error("Function '" + func.name + ' ' + func.desc + "' doesn't have an owner.");
    let isInitialized = func.owner.initialized;
    if (debug) console.log('isInitialized', isInitialized);
    const isStatic = func.isStatic();
    if (debug) console.log('isStatic', isStatic);
    if (!isInitialized && !isStatic) throw new Error("Static instance of class '" + func.owner.name + "' can't access non-static function '" + func.name + ' ' + func.desc + "'.");
}

const java_version = 7;
const useLocalClasses = true;
const localClassPkg = 'obzcu/re/';

JSON.safeStringify = (obj, indent = 2) => {
    let cache = [];
    const retVal = JSON.stringify(obj,
    (key, value) =>
            typeof value === "object" && value !== null
                ? cache.includes(value)
                    ? undefined
                    : cache.push(value) && value
                : value,
        indent
    );
    cache = null;
    return retVal;
};

const cleanStringify = (aObject) => {
    if (aObject && typeof aObject === 'object')
        aObject = copyWithoutCircularReferences([aObject], aObject);
    return JSON.stringify(aObject);

    function copyWithoutCircularReferences(references, object) {
        const cleanObject = {};
        Object.keys(object).forEach(function(key) {
            const value = object[key];
            if (value && typeof value === 'object') {
                if (references.indexOf(value) < 0) {
                    references.push(value);
                    if (value instanceof JvmClass)
                        cleanObject[key] = '<JvmClass>';
                    else
                        cleanObject[key] = copyWithoutCircularReferences(references, value);
                    references.pop();
                }
                else
                    cleanObject[key] = '###_Circular_###';
            } else if (typeof value !== 'function') {
                cleanObject[key] = value;
            }
        });
        return cleanObject;
    }
}

const print = ((buffer = '') => arg => {
    const splits = (buffer + arg).split('\n');
    if (splits.length === 1)
        buffer += arg;
    else
    {
        for (let i = 0; i < splits.length - 1; i++)
            console.log(splits[i]);
        buffer = splits[splits.length - 1];
    }
})();

function console_println () {
    let args = [].slice.call(arguments);
    let argsWithObjectCopies = args.map(copyIfRegularObject);
    return console.log.apply(console, argsWithObjectCopies);
}

function console_print () { // TODO: Implement non-newline printing
    let args = [].slice.call(arguments);
    let argsWithObjectCopies = args.map(copyIfRegularObject);
    return console.log.apply(console, argsWithObjectCopies);
}

function copyIfRegularObject (o) {
    const isRegularObject = typeof o === 'object' && !(o instanceof RegExp);
    return isRegularObject ? copyObject(o) : o;
}

function copyObject (o) {
    try
    {
        return JSON.parse(JSON.stringify(o));
    }
    catch
    {
        return JSON.parse(JSON.safeStringify(o));
    }
}