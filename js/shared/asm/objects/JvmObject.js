// This is any java `Object` value.
class JvmObject {

    /**
     * @type {JvmString|JvmNumber|any|null}
     */
    value;

    /**
     * @param value {JvmString|JvmNumber|null}
     */
    constructor(value) {
        this.value = value;
    }

}