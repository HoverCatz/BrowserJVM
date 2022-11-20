const STATIC_CLASS_LIST = {};

/**
 * Add class to {STATIC_CLASS_LIST}
 * @param pkg
 * @param className
 * @param clz
 */
function addStaticClass(pkg, className, clz) {
    const key = (pkg.length > 0 ? (pkg + '/') : '') + className;
    if (key in STATIC_CLASS_LIST) {
        throw new Error('Class `' + clz.getPath() + '` already in list.');
    }
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
 * Returns a static field
 * @param pkg_className
 * @param name
 * @param desc
 * @returns {JvmField|false}
 */
function findStaticField(pkg_className, name, desc) {
    const clz = findStaticClass(pkg_className);
    if (!clz) return false;
    return clz.findField(name, desc, true);
}

/**
 * Returns a static function
 * @param pkg_className
 * @param name
 * @param desc
 * @returns {JvmFunction|false}
 */
function findStaticFunction(pkg_className, name, desc) {
    const clz = findStaticClass(pkg_className);
    if (!clz) return false;
    return clz.findFunction(name, desc, true);
}