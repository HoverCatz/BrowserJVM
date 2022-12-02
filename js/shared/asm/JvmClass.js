class JvmClass {

    /** @type number */ accessFlags;
    /** @type string */ package;   // package only
    /** @type string */ className; // classname only
    /** @type string */ name;      // full name (package + className)
    /** @type JvmClass|string */ superClass;
    /** @type JvmClass[]|string[] */ interfaces;

    /** @type JvmField */ fields;
    /** @type JvmFunction */ functions;

    /** @type boolean */ isInstance = false;
    /** @type boolean */ isStaticInstance = true;

    // Jvm
    /** @type boolean */ isLoaded = false;
    /** @type number */ uniqueIdentifier = -1;

    /** @type string */ sourceFile = '';
    /** @type string */ signature = '';
    /** @type string */ sourceDebugExtension = '';
    /** @type string */ nestHostClass = '';
    /** @type string */ moduleMainClass = '';

    /** @type string[] */ nestMembers;
    /** @type string[] */ permittedSubClasses;
    /** @type string[] */ innerClasses;

    static uniqueIdentifierIndex = 0;
    static uniqueIdentifierMap = {}; // Key: 'uniqueIdentifier', Value: 'name: JvmClass'
    static staticClasses = {}; // Key: 'packageAndName', Value: 'static instance of JvmClass'

    /**
     * @param accessFlags {number}
     * @param pkg_className {string}
     * @param superClass {boolean|JvmClass}
     * @param interfaces {JvmClass[]}
     */
    constructor(accessFlags, pkg_className, superClass = false, interfaces = []) {
        if (!!pkg_className) { // Empty constructor or not
            this.accessFlags = accessFlags;
            this.name = pkg_className;
            if (pkg_className.includes('/')) {
                const index = pkg_className.lastIndexOf('/');
                this.package = pkg_className.substring(0, index);
                this.className = pkg_className.substring(index + 1);
            } else {
                this.package = '';
                this.className = pkg_className;
            }
            this.superClass = superClass; // If this is false, it means the superClass is java.lang.Object (the default one)
            this.interfaces = interfaces;
        } else {
            // This should only happen from within ASM!
            // All values will be filled in later when loading from .class files.
        }
    }

    /**
     * Only meant to be used directly by ASM
     * @param pkg_className
     */
    asmSetName(pkg_className) {
        this.name = pkg_className;
        if (pkg_className.includes('/')) {
            const index = pkg_className.lastIndexOf('/');
            this.package = pkg_className.substring(0, index);
            this.className = pkg_className.substring(index + 1);
        } else {
            this.package = '';
            this.className = pkg_className;
        }
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
    initialize(uniqueIdentifier, incrementUidIndex = true) {
        this.uniqueIdentifier = uniqueIdentifier;
        this.isInstance = true;
        this.isStaticInstance = false;
        if (!!this.superClass) {
            this.superClass = this.superClass.newInstance({
                'uniqueIdentifier': uniqueIdentifier,
                'incrementUidIndex': false
            });
            this.superClass.uniqueIdentifier = uniqueIdentifier;
        }
        const itzs = this.interfaces;
        for (const index in itzs) {
            const itz = itzs[index];
            let newItz = null;
            if (itz instanceof JvmClass) {
                this.interfaces[index] = newItz = itz.newInstance({
                    'uniqueIdentifier': uniqueIdentifier,
                    'incrementUidIndex': false
                });
            }
            else if (typeof itz === 'string') {
                const found = findStaticClass(itz); // This shouldn't be of asmTypeString so no need to trim it
                if (!!found) {
                    this.interfaces[index] = newItz = found.newInstance({
                        'uniqueIdentifier': uniqueIdentifier,
                        'incrementUidIndex': false
                    });
                }
                else
                    throw new Error('Interface `' + itz + '` not found.');
            }
            else
                throw new Error('Invalid interface value type `' + (typeof itz) + '` (value="' + itz + '")');
            newItz.uniqueIdentifier = uniqueIdentifier;
        }
        const map = JvmClass.uniqueIdentifierMap[uniqueIdentifier] ?? {};
        if (!(this.name in map))
            map[this.name] = this;
        if (!!this.superClass && !(this.superClass.name in map))
            map[this.superClass.name] = this.superClass;
        if (this.interfaces.length > 0)
            for (const index in this.interfaces) {
                const itz = this.interfaces[index];
                if (!(itz.name in map))
                    map[itz.name] = itz;
            }
        JvmClass.uniqueIdentifierMap[uniqueIdentifier] = map;
        // Set unique identifier values (for mapping the root class to the super-class and interface-classes,
        //     and reversed - mapping the super-class and interface-classes back to the root class)
        if (incrementUidIndex) {
            JvmClass.uniqueIdentifierIndex++;
        }
    }

    /**
     * Returns a new (static or not) instance of this class.
     *
     * This is NOT the same as executing the constructor! That happens through {@link JvmFunction.execute}.
     * @param settings
     * @returns {JvmClass}
     */
    newInstance(settings = {}) {
        if (!this.isLoaded)
            throw new Error('Class not loaded yet.');
        const clz = new JvmClass(this.accessFlags, this.name, this.superClass, this.interfaces);
        const newFields = {};
        for (const index in this.fields) {
            const field = this.fields[index];
            const newField = new JvmField(clz, field.accessFlags, field.fieldName, field.fieldDesc);
            newFields[newField.getFieldPath()] = newField;
        }
        const newFunctions = {};
        for (const index in this.functions) {
            const func = this.functions[index];
            const newFunc = new JvmFunction(clz, func.accessFlags, func.functionName, func.functionDesc);
            newFunc.load(func.instructions, func.tryCatches); // TODO: Clone instructions and/or tryCatches too? :>
            newFunctions[func.getFuncPath()] = newFunc;
        }
        clz.load(newFields, newFunctions);
        clz.initialize(
            settings.uniqueIdentifier ?? JvmClass.uniqueIdentifierIndex,
            settings.incrementUidIndex ?? true
        );
        return clz;
    }

    /**
     * Is this class an instance of the typeString specified?
     *
     * Examples:
     * - this: TestRoot extends TestSuper
     * - typeString: TestSuper
     * - result: true
     *
     * - this: TestRoot extends Object
     * - typeString: TestSuper
     * - result: false
     *
     * @param other {string|JvmClass}
     * @param returnInstance {boolean}
     * @returns {boolean|JvmClass}
     * @throws {Error}
     */
    isInstanceOf(other, returnInstance = false) {
        // Fix other type if necessary
        if (other instanceof JvmClass) {
            other = other.name;
        } else if (typeof other === 'string') {
            other = stripAsmDesc(other);
        } else {
            throw new Error('Invalid type for other: `' + (other) + '` (type: ' + typeof other + ')');
        }

        // Always return true if other is Object
        if (other === 'java/lang/Object' || other === 'Ljava/lang/Object;') {
            if (returnInstance) return this;
            return true;
        }

        // Check self
        const thisPath = this.getPath(true);
        if (thisPath === other) {
            if (returnInstance) return this;
            return true;
        }

        // Find other
        const found = findStaticClass(other);
        if (!found) return 1;

        // Check self, again!
        if (thisPath === found.getPath(true)) {
            if (returnInstance) return this;
            return true;
        }

        // Check superclass is instance of other
        if (this.superClass) {
            const ret = this.superClass.isInstanceOf(other, returnInstance);
            if (!!ret) return ret;
        }

        // If we don't have interfaces, just abort
        if (this.interfaces.length === 0)
            return this.#tryReverseInstanceOf(found, returnInstance);

        // Check any interface is instance of other
        const itzs = this.interfaces;
        for (const index in itzs) {
            const itz = itzs[index];
            if (itz instanceof JvmClass) {
                const ret = itz.isInstanceOf(other, returnInstance);
                if (!!ret) return ret;
            }
            else if (typeof itz === 'string') {
                const found = findStaticClass(stripAsmDesc(itz));
                if (!!found) {
                    const ret = found.isInstanceOf(other, returnInstance);
                    if (!!ret) return ret;
                } else
                    throw new Error('Interface `' + itz + '` not found.');
            }
            else
                throw new Error('Invalid interface value type `' + (typeof itz) + '` (value="' + itz + '")');
        }

        // Nothing worked, so I guess we aren't an instance of other!
        // TODO: Should we do tryReverseInstanceOf here too?
        return false;
    }

    /**
     * @param other {JvmClass}
     * @param returnInstance {boolean}
     * @returns {boolean}
     */
    #tryReverseInstanceOf(other, returnInstance) {
        const name = other.name;
        if (!returnInstance)
            console.log(name, this.name)
        const map = JvmClass.uniqueIdentifierMap[this.uniqueIdentifier];
        for (const clzName in map) {
            const clz = map[clzName];
            if (clz === other || clz.name === name) {
                if (returnInstance) return clz;
                return true;
            }
        }
        return false;
    }

    /**
     * Cast this instance to the Other class type (must be an instance of)
     * @param other {string|JvmClass}
     * @throws {Error}
     * @returns {JvmClass|boolean}
     */
    castTo(other) {
        const obj = this.isInstanceOf(other, true);
        if (!obj) {
            console.log(obj)
            throw new Error('This class `' + this.getPath() +
                '` is not an instance of other class `' + (other instanceof JvmClass ? other.getPath() : other) + '`.');
        }
        return obj;
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
        if (!this.isLoaded)
            throw new Error('Class not loaded yet.');
        const key = name + '.' + desc;
        if (key in this.fields) {
            const found = this.fields[key];
            if (isStatic && !found.isStaticInstance) {
                throw new Error('Trying to access a non-static field as static.');
            }
            if (!isStatic && found.isStaticInstance) {
                throw new Error('Trying to access a static field as non-static.');
            }
            if (isStatic) {
                const ownerPkg = (this.package.length > 0) ? (this.package + '/') : '';
                const ownerClassName = this.className;
                const staticKey = ownerPkg + ownerClassName + ' ' + name + ' ' + desc;
                if (staticKey in JvmField.staticInstances) {
                    console.log('returning an existing static field');
                    return JvmField.staticInstances[staticKey];
                }
            }
            return found;
        }
        if (!!this.superClass) {
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
     * @returns {JvmFunction|false}
     * @throws {Error}
     */
    findFunction(name, desc, isStatic) {
        if (!this.isLoaded)
            throw new Error('Class not loaded yet.');
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
    getPath(asmSymbols = false) {
        return asmSymbols ? ('L' + this.name + ';') : this.name;
    }

    /**
     * Format: <<package.>>classname
     * @returns the dotted package (if exists) and the classname.
     */
    getDottedPath() {
        return this.name.replaceAll('/', '.');
    }

    /**
     * Return the static instance of a class
     * @param pkg_className
     * @returns {JvmClass|boolean}
     */
    static of(pkg_className) {
        return JvmClass.staticClasses[pkg_className];
    }

}