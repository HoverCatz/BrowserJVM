// This is any java primitive array.
class JvmArray extends JvmObject {

    /** @param value {any[]|null} */
    constructor(value) {
        super(value);
    }

    isNull() {
        return this.value === null;
    }

    size() {
        return this.value.length;
    }

    getItem(index) {
        if (index >= this.size())
            throw new Error('ArrayIndexOutOfBoundsException');
        return this.value[index];
    }

    setItem(index, item) {
        if (index >= this.size())
            throw new Error('ArrayIndexOutOfBoundsException');
        this.value[index] = item;
    }

    getValue() {
        return this.value;
    }

    setValue(newValue) {
        this.value = newValue;
    }

}