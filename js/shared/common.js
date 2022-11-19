const STATIC_CLASS_LIST = {};

/**
 * Add class to {STATIC_CLASS_LIST}
 * @param pkg
 * @param className
 * @param clz
 */
function addStaticClass(pkg, className, clz) {
    const key = (pkg.length > 0 ? (pkg + '/') : '') + className;
    STATIC_CLASS_LIST[key] = clz;
}

/**
 * Find class by package+name
 * @param pkg_className
 * @returns {JvmClass|boolean}
 */
function findStaticClass(pkg_className) {
    return STATIC_CLASS_LIST[pkg_className] ?? false;
}

/**
 * @param pkg_className
 * @param field_name_desc
 * @param isStatic
 * @returns {JvmField|false}
 */
function findField(pkg_className, field_name_desc, isStatic) {
    const clz = findStaticClass(pkg_className);
    if (!clz) return false;
    return clz.findField(field_name_desc, isStatic);
}

function findFunction(pkg_className, function_name_desc, isStatic) {
    const clz = findStaticClass(pkg_className);
    if (!clz) return false;
    return clz.findFunction(function_name_desc, isStatic);
}