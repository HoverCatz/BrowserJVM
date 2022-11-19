const STATIC_CLASS_LIST = {};

function addStaticClass(pkg, className, clz) {
    const key = (pkg.length > 0 ? (pkg + '.') : '') + className;
    STATIC_CLASS_LIST[key] = clz;
}

function findStaticClass(pkg, className) {
    const key = (pkg.length > 0 ? (pkg + '.') : '') + className;
    return STATIC_CLASS_LIST[key];
}