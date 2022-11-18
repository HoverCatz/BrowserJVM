class JvmClass {

    package;
    accessFlags;
    className;
    superClass; // JvmClass

    fields; // JvmField
    functions; // JvmFunction

    isLoaded = false;

    constructor(pkg, accessFlags, className, superClass = false) {
        this.package = pkg;
        this.accessFlags = accessFlags;
        this.className = className;
        this.superClass = superClass; // If this is false, it means the superClass is java.lang.Object (the default one)
    }

    load(fields = {}, functions = { names: {}, args: {} }) {
        if (this.isLoaded) {
            throw new Error('Class already loaded');
        }
        this.fields = fields;
        this.functions = functions;
        this.isLoaded = true;
    }

    findField(name, isStatic) {
        if (name in this.fields) {
            const field = this.fields[name];
            if (isStatic && !field.isStatic) {
                throw new Error('Trying to access a non-static field as static.');
            }
            return field;
        }
        if (this.superClass) {
            return this.superClass.findField(name, isStatic);
        }
        return false;
    }

    findFunction(name, args, isStatic) {
        if (name in this.functions.names && args in this.functions.args) {
            const foundName = this.functions.names[name];
            const foundArgs = this.functions.args[name];
            if (foundName !== foundArgs) {
                throw new Error('Found name and found args didn\'t match');
            }
            if (isStatic && !foundName.isStatic) {
                throw new Error('Trying to access a non-static function as static.');
            }
            return foundName;
        }
        if (this.superClass) {
            return this.superClass.findFunction(name, args, isStatic);
        }
        return false;
    }

}