
/**
 * Add class to {STATIC_CLASS_LIST}
 * @param clz
 */
function addStaticClass(clz) {
    const key = clz.name;
    if (key in JvmClass.staticClasses) {
        throw new Error('Class `' + clz.name + '` already in list.');
    }
    JvmClass.staticClasses[key] = clz;
}

/**
 * Find class by package+name
 * @param pkg_className
 * @returns {JvmClass|boolean}
 */
function findStaticClass(pkg_className) {
    return JvmClass.staticClasses[pkg_className] ?? false;
}

/**
 * Returns a static field
 * @param pkg_className {string|JvmClass}
 * @param name {string}
 * @param desc {string}
 * @returns {JvmField|false}
 */
function findStaticField(pkg_className, name, desc) {
    const clz = (pkg_className instanceof JvmClass) ? pkg_className : findStaticClass(pkg_className);
    if (!clz) return false;
    return clz.findField(name, desc, true);
}

/**
 * Returns a static function
 * @param pkg_className {string|JvmClass}
 * @param name {string}
 * @param desc {string}
 * @returns {JvmFunction|false}
 */
function findStaticFunction(pkg_className, name, desc) {
    const clz = (pkg_className instanceof JvmClass) ? pkg_className : findStaticClass(pkg_className);
    if (!clz) return false;
    return clz.findFunction(name, desc, true);
}