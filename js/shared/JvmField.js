class JvmField {

    ownerClass;
    accessFlags;
    fieldName;
    defaultValue;

    isLoaded = false;

    constructor(ownerClass, accessFlags, fieldName) {
        this.ownerClass = ownerClass;
        this.accessFlags = accessFlags;
        this.fieldName = fieldName;
    }

    load(defaultValue = null) {
        if (this.isLoaded) {
            throw new Error('Function already loaded.');
        }
        this.defaultValue = defaultValue;
        this.isLoaded = true;
    }

}