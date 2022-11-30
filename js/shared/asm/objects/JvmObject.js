// This is any java `Object` value.
class JvmObject {

    /**
     * @type {JvmString|JvmNumber|JvmNull}
     */
    value;

    /**
     * @param value {JvmString|JvmNumber|JvmNull}
     */
    constructor(value) {
        this.value = value;
    }

}