class JvmField {

    /** @type JvmClass */ ownerClass;

    /** @type number */ accessFlags;
    /** @type string */ fieldName;
    /** @type string */ fieldDesc;

    /** @type string|null */ signature;
    /** @type any */ constantValue;

    /** @type boolean */ isFinalInstance;
    /** @type boolean */ isStaticInstance;

    /** @type any */ value; // any

    /** @type boolean */ isLoaded = false;

    static staticInstances = {}; // Key: 'ownerPackage/ownerClassName fieldName fieldDesc'

    constructor(ownerClass, accessFlags, fieldName, fieldDesc) {
        this.ownerClass = ownerClass;
        if (!!fieldName) {
            this.accessFlags = accessFlags;
            this.fieldName = fieldName;
            this.fieldDesc = fieldDesc;
            this.isFinalInstance = isFinal(accessFlags);
            this.isStaticInstance = isStatic(accessFlags);
            if (this.isStaticInstance) {
                const staticKey = this.getPath();
                if (!(staticKey in JvmField.staticInstances)) {
                    JvmField.staticInstances[staticKey] = this;
                }
            }
            this.signature = null;
            this.constantValue = null;
        }
    }

    /**
     Only meant to be used directly by ASM
     */
    asmLoad(accessFlags, fieldName, fieldDesc, signature, constantValue) {
        this.accessFlags = accessFlags;
        this.fieldName = fieldName;
        this.fieldDesc = fieldDesc;
        this.signature = signature;
        this.constantValue = constantValue;
        if (constantValue !== undefined && typeof this.value === 'undefined') {
            console.log('constantValue:`',constantValue,'`')
            if (constantValue == null) {
                this.setValue(null);
            } else if (isPrimitiveType(fieldDesc)) {
                const num = newJvmNumber(constantValue, getNumberType(fieldDesc));
                this.setValue(num);
            } else if (typeof constantValue === 'string') {
                this.setValue(constantValue);
            } else {
                throw new Error('Unknown constant type `' + (typeof constantValue) + '`: `' + constantValue + '`');
            }
        }
        this.isFinalInstance = isFinal(accessFlags);
        this.isStaticInstance = isStatic(accessFlags);
        if (this.isStaticInstance) {
            const staticKey = this.getPath();
            if (!(staticKey in JvmField.staticInstances)) {
                JvmField.staticInstances[staticKey] = this;
            }
        }
    }

    /**
     * Set the value of this Field.
     * Throws an error if we attempt to reassign a Final field, or if we try setting a value of the wrong type.
     * @param value
     * @throws {Error}
     */
    setValue(value = null) {
        const isFinalField = this.isFinalInstance;
        const isLoaded = this.isLoaded;
        if (isFinalField && isLoaded) {
            throw new Error('Final field `' + this.getPath() + '` can\'t be reassigned.');
        }
        const desc = this.fieldDesc;
        if (desc !== 'Ljava/lang/Object;' && !compareTypes(value, desc)) {
            throw new Error('Field `' + this.getPath() + '` is of wrong type. ValueType=`' + getTypeString(value) + '`, FieldDesc=`' + this.fieldDesc + '`');
        }
        this.value = value;
        if (isFinalField && !isLoaded)
            this.isLoaded = true;
    }

    /**
     * Set the value of this Field. Throws an error if the field is Final and if we already set a value earlier.
     * @param value
     * @throws {Error}
     */
    set(value = null) { this.setValue(value); }

    /**
     * Returns the value from this Field.
     * @returns {any}
     * @throws {Error}
     */
    getValue() {
        const isFinalField = this.isFinalInstance;
        if (isFinalField && !this.isLoaded) {
            throw new Error('Field `' + this.getPath() + '` isn\'t loaded.');
        }
        return this.value;
    }

    /**
     * Returns the value from this Field.
     * @returns {any}
     * @throws {Error}
     */
    get() { return this.getValue(); }

    /**
     * Get or create a new instance (static or not) of this Field.
     * @returns {JvmField}
     * @throws {Error}
     */
    getOrCreate() {
        if (this.isStaticInstance)
            return this.newInstance(true);
        return this.newInstance();
    }

    /**
     * Create new instance, or get the existing static instance.
     * @returns {JvmField}
     * @throws {Error}
     */
    newInstance(useStatic = false) {
        const staticKey = this.getPath();
        const accessFlags = this.accessFlags;
        const isStaticField = isStatic(accessFlags);
        if (useStatic && !isStaticField) {
            throw new Error('Field `' + this.getPath() + '` isn\'t static.');
        }
        if (!useStatic && isStaticField) {
            throw new Error('Field `' + this.getPath() + '` is static.');
        }
        const fieldName = this.fieldName;
        const fieldDesc = this.fieldDesc;
        const owner = this.ownerClass;
        if (isStaticField) {
            // This should always return an existing value.
            if (staticKey in JvmField.staticInstances) {
                console.log('returning an existing static field');
                return JvmField.staticInstances[staticKey];
            } else {
                // But if it doesn't, then something is wrong.
                throw new Error('Something went wrong while trying to fetch the existing static field.');
            }
        }
        const field = new JvmField(owner, accessFlags, fieldName, fieldDesc);
        if (typeof this.value !== 'undefined')
            field.setValue(this.value);
        if (isStaticField) {
            console.log('creating a new static field:', staticKey);
            if (!(staticKey in JvmField.staticInstances)) {
                JvmField.staticInstances[staticKey] = field;
            }
        } else {
            console.log('creating a new field instance');
        }
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
     * Returns the field-path to this Field.
     * @returns {string}
     */
    getFieldPath(asmSymbols = false) {
        let desc = this.fieldDesc;
        if (asmSymbols && isPrimitiveType(desc))
            desc = 'L' + desc + ';';
        return this.fieldName + '.' + desc;
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