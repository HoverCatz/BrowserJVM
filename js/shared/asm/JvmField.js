class JvmField {

    ownerClass;

    accessFlags;
    fieldName;
    fieldDesc;
    isStaticInstance;

    value;

    isLoaded = false;

    static staticInstances = {}; // Key: 'ownerPackage/ownerClassName fieldName fieldDesc'

    constructor(ownerClass, accessFlags, fieldName, fieldDesc) {
        this.ownerClass = ownerClass;
        this.accessFlags = accessFlags;
        this.fieldName = fieldName;
        this.fieldDesc = fieldDesc;
        this.isStaticInstance = isStatic(accessFlags);
    }

    /**
     * Set the value of this Field. Throws an error if the field is Final and if we already set a value earlier.
     * @param value
     * @throws {Error}
     */
    setValue(value = null) {
        const isFinalField = isFinal(this.accessFlags);
        const isLoaded = this.isLoaded;
        if (isFinalField && isLoaded) {
            throw new Error('Final field `' + this.getPath() + '` can\'t be reassigned.');
        }
        this.value = value;
        if (isFinalField && !isLoaded)
            this.isLoaded = true;
    }

    /**
     * Returns the value from this Field.
     * @returns {any|object}
     * @throws {Error}
     */
    getValue() {
        const isFinalField = isFinal(this.accessFlags);
        if (isFinalField && !this.isLoaded) {
            throw new Error('Field `' + this.getPath() + '` isn\'t loaded.');
        }
        return this.value;
    }

    /**
     * Get or create a new instance (static or not) of this Field.
     * @returns {JvmField}
     * @throws {Error}
     */
    getOrCreate() {
        if (isStatic(this.accessFlags))
            return this.newInstance(true);
        return this.newInstance();
    }

    /**
     * Create new instance, or get the existing static instance.
     * @returns {JvmField}
     * @throws {Error}
     */
    newInstance(useStatic = false) {
        let staticKey;
        const accessFlags = this.accessFlags;
        const isStaticField = isStatic(accessFlags);
        if (useStatic && !isStaticField) {
            throw new Error('Field `' + this.getPath() + '` isn\'t static.');
        }
        if (!useStatic && isStaticField) {
            throw new Error('Field `' + this.getPath() + '` is static.');
        }
        const fieldName = this.fieldName;
        const owner = this.ownerClass;
        if (isStaticField) {
            const ownerPkg = (owner.package.length > 0) ? (owner.package + '/') : '';
            const ownerClassName = owner.className;
            staticKey = ownerPkg + ownerClassName + ' ' + fieldName + ' ' + this.fieldDesc;
            if (staticKey in JvmField.staticInstances) {
                console.log('returning an existing static field');
                return JvmField.staticInstances[staticKey];
            }
        }
        const field = new JvmField(owner, accessFlags, fieldName);
        field.setValue(this.value);
        if (isStaticField) {
            console.log('creating a new static field:', staticKey);
            JvmField.staticInstances[staticKey] = field;
        } else
            console.log('creating a new field instance');
        return field;
    }

    /**
     * Return either an existing or new non-static instance, or throws an Error if the field is static.
     * @returns {JvmField}
     * @throws {Error}
     */
    getOrCreateNonStaticInstance() {
        if (isStatic(this.accessFlags)) {
            throw new Error('Field `' + this.getPath() + '` is static.');
        }
        return this.newInstance();
    }

    /**
     * Return either an existing or new static instance, or throws an Error if the field isn't static.
     * @returns {JvmField}
     * @throws {Error}
     */
    getOrCreateStaticInstance() {
        if (!isStatic(this.accessFlags)) {
            throw new Error('Field `' + this.getPath() + '` isn\'t static.');
        }
        return this.newInstance(true);
    }

    /**
     * Returns the path to this Field.
     * @returns {string}
     */
    getPath() {
        return this.ownerClass.getPath() + ' ' + this.fieldName + '.' + this.fieldDesc;
    }

    /**
     * Returns the dotted path to this Field.
     * @returns {string}
     */
    getDottedPath() {
        return this.ownerClass.getDottedPath() + ' ' + this.fieldName + '.' + this.fieldDesc;
    }

}