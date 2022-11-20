class JvmClass {

    package;
    accessFlags;
    className;
    superClass; // JvmClass

    fields; // JvmField
    functions; // JvmFunction

    isStaticInstance = true;
    isLoaded = false;

    constructor(pkg, accessFlags, className, superClass = false) {
        this.package = pkg;
        this.accessFlags = accessFlags;
        this.className = className.replaceAll('.', '/');
        this.superClass = superClass; // If this is false, it means the superClass is java.lang.Object (the default one)
    }

    /**
     * Load field and function data into this class.
     * This can only happen once.
     * @param fields
     * @param functions
     */
    load(fields = {}, functions = {}) {
        if (this.isLoaded) {
            throw new Error('Class already loaded');
        }
        this.fields = fields;
        this.functions = functions;
        this.isLoaded = true;
    }

    /**
     * Initialize this class (as non-static).
     */
    initialize() {
        this.isStaticInstance = false;
        // TODO: Initialize superClass, if any.
    }

    /**
     * Returns a new (static or not) instance of this class.
     * @param isStatic
     * @returns {JvmClass}
     */
    newInstance(isStatic = false) {
        const clz = new JvmClass(this.package, this.accessFlags, this.className, this.superClass);
        clz.load(this.fields, this.functions);
        if (!isStatic)
            clz.initialize();
        return clz;
    }

    /**
     * Returns a new static instance of this class
     * @returns {JvmClass}
     */
    newStaticInstance() {
        return this.newInstance(true);
    }

    /**
     * Returns a JvmField,
     *   throws an Error if found Field doesn't match the isStatic you provided,
     *   or false if not found.
     * @param name
     * @param desc
     * @param isStatic
     * @returns {JvmField|Error|false}
     */
    findField(name, desc, isStatic) {
        const key = name + '.' + desc;
        if (key in this.fields) {
            const found = this.fields[key];
            if (isStatic && !found.isStaticInstance) {
                throw new Error('Trying to access a non-static field as static.');
            }
            if (!isStatic && found.isStaticInstance) {
                throw new Error('Trying to access a static field as non-static.');
            }
            return found;
        }
        if (this.superClass) {
            return this.superClass.findField(name, desc, isStatic);
        }
        return false;
    }

    /**
     * Returns a JvmFunction,
     *   throws an Error if found Function doesn't match the (name and arguments) or (the isStatic you provided),
     *   or false if not found.
     * @param name
     * @param desc
     * @param isStatic
     * @returns {JvmFunction|Error|false}
     */
    findFunction(name, desc, isStatic) {
        const key = name + desc;
        if (key in this.functions) {
            const found = this.functions[key];
            if (isStatic && !found.isStaticInstance) {
                throw new Error('Trying to access a non-static function as static.');
            }
            if (!isStatic && found.isStaticInstance) {
                throw new Error('Trying to access a static function as non-static.');
            }
            return found;
        }
        if (this.superClass) {
            return this.superClass.findFunction(name, desc, isStatic);
        }
        return false;
    }

    /**
     * Format: <<package/>>classname
     * @returns the package (if exists) and the classname.
     */
    getPath() {
        return (this.package.length > 0 ? (this.package + '/') : '') + this.className;
    }

    /**
     * Format: <<package.>>classname
     * @returns the dotted package (if exists) and the classname.
     */
    getDottedPath() {
        return (this.package.length > 0 ? (this.package.replaceAll('/', '.') + '.') : '') + this.className;
    }

}