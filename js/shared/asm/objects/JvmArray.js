// This is any java primitive array.
// Examples:
// - int[] (JvmInteger[])
// - String[] (JvmString[])
// - int[][] (JvmArray<JvmInteger[]>[])
class JvmArray extends JvmObject {

    /** @type number */
    length;

    /** @type string */
    asmType;

    /**
     * @param values {any[]|null}
     * @param asmType {string}
     * @param length {number}
     */
    constructor(values, asmType, length = -1) {
        if ((values == null || values.length === 0) && length >= 0)
            values = [...Array(length)].fill(null);
        for (const index in values) {
            const object = values[index];
            assertJvmType(index, object, asmType);
        }
        super(values);
        this.length = values.length;
        this.asmType = asmType;
    }

    /**
     * Returns the length of this array
     * @returns {number}
     */
    getLength() {
        return this.length;
    }

    /**
     * Returns the asm type of this array
     * @returns {string}
     */
    getType() {
        return this.asmType;
    }

    /**
     * Checks if there is a value at all
     * @returns {boolean}
     */
    isNull() {
        return this.value === null;
    }

    /**
     * Gets the item at the specific index
     * @param index
     * @returns {*}
     */
    getItem(index) {
        if (index < 0 || index >= this.length)
            throw new Error(`Index ${index} out of bounds for length ${this.length}`, 'java/lang/ArrayIndexOutOfBoundsException');
        return this.value[index];
    }

    /**
     * Sets the item at the specific index
     * @param index
     * @param item
     */
    setItem(index, item) {
        if (index < 0 || index >= this.length)
            throw new Error(`Index ${index} out of bounds for length ${this.length}`, 'java/lang/ArrayIndexOutOfBoundsException');
        assertJvmType(index, item, this.asmType);
        this.value[index] = item;
    }

    /**
     * Gets the whole array element
     * @returns {any[]|null}
     */
    getValue() {
        return this.value;
    }

    /**
     * Sets the whole array element
     * @param newValue {any[]|null}
     */
    setValue(newValue) {
        this.value = newValue;
        this.length = newValue == null ? 0 : newValue.length
    }

    static of(asmType, ...values) {
        return new JvmArray(values, asmType, values.length);
    }

}