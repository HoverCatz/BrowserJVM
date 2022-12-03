const JvmNumberType = {
    // 8-bit
    Byte: 'JvmByte',
    // 16-bit
    Char: 'JvmChar',
    Short: 'JvmShort',
    // 32-bit
    Int: 'JvmInteger',
    Float: 'JvmFloat',
    // 64-bit
    Long: 'JvmLong',
    Double: 'JvmDouble',
}

const JvmNumberAsmSymbols = {
    Byte: 'B',
    Char: 'C',
    Short: 'S',
    Int: 'I',
    Float: 'F',
    Long: 'J',
    Double: 'D'
}

class JvmNumber {

    /**
     * @type {number|BigInt}
     */
    value;

    /**
     * @type {JvmNumberType}
     */
    type;

    /**
     * @type {string}
     */
    asmSymbol;

    /**
     * @param value {number|BigInt}
     * @param type {JvmNumberType}
     * @param asmSymbol {string}
     */
    constructor(value, type, asmSymbol) {
        this.value = value;
        this.type = type;
        this.asmSymbol = asmSymbol;
    }

    /** Do math operation (this + other) */ addWithOther(other) { }
    /** Do math operation (this - other) */ subWithOther(other) { }
    /** Do math operation (this * other) */ mulWithOther(other) { }
    /** Do math operation (this / other) */ divWithOther(other) { }
    /** Do math operation (this % other) */ remWithOther(other) { }
    /** Do math operation (this << other) */ shlWithOther(other) { }
    /** Do math operation (this >> other) */ shrWithOther(other) { }
    /** Do math operation (this >>> other) */ ushrWithOther(other) { }
    /** Do math operation (this & other) */ andWithOther(other) { }
    /** Do math operation (this | other) */ orWithOther(other) { }
    /** Do math operation (this ^ other) */ xorWithOther(other) { }
    /** Do math operation (-this) */ neg() { }

    /**
     * Set number value
     * @param value {number|BigInt}
     * @returns {this}
     */
    set(value) {
        this.value = value;
        return this;
    }

    /**
     * Get number value
     * @returns {number|BigInt}
     */
    get() {
        return this.value;
    }

    /**
     * Adds a value to this number
     * @param value {number|BigInt}
     * @returns {this}
     */
    add(value) {
        this.value = value;
        return this;
    }

    /**
     * Get the number type JvmNumberType(Byte, Char, Short, Int, Float, Long, Double)
     * @returns {JvmNumberType}
     */
    get type() {}

    /**
     * Compare two JvmNumber values
     * @param other {JvmNumber}
     * @returns {boolean}
     */
    equals(other) {
        let thisVal = this.get().toString();
        if (thisVal.endsWith('n')) thisVal = thisVal.slice(0, 1);
        let otherVal = other.get().toString();
        if (otherVal.endsWith('n')) otherVal = otherVal.slice(0, 1);
        return thisVal === otherVal;
    }

    /**
     * Compare two JvmNumber types and values
     * @param other {JvmNumber}
     * @returns {boolean}
     */
    equalsStrict(other) {
        if (this.type !== other.type) return false;
        return this.get().toString() === other.get().toString();
    }

    /**
     * Get the ASM type string
     * @returns {string}
     */
    getAsmType() {
        return this.asmSymbol;
    }

    /**
     * Returns the string version of the value
     * @returns {string}
     */
    toString() {
        return `${this.value}`;
    }

    /** @type {BigInt} */
    static get MAX_VALUE() {}
    /** @type {BigInt} */
    static get EPSILON_VALUE() {}
    /** @type {BigInt} */
    static get MIN_VALUE() {}
}

// 8-bit
class JvmByte extends JvmNumber {

    /** @param value {number|BigInt} */
    constructor(value) {
        super(JvmByte.#clamp(value), JvmNumberType.Byte, JvmNumberAsmSymbols.Byte);
    }

    static of(value) {
        return new JvmByte(value);
    }

    /**
     * @param value {number|BigInt}
     */
    static #clamp(value) {
        if (typeof value === 'number')
            value = BigInt.asIntN(8, BigInt(value));
        return Math.trunc(Number(value));
    }

    set(value) {
        if (typeof value === 'bigint')
            value = BigInt.asIntN(6, value);
        return super.set(JvmByte.#clamp(value));
    }

    /** @returns {number} */
    get() {
        let value = this.value;
        if (typeof value === 'bigint')
            value = BigInt.asIntN(8, value);
        return JvmByte.#clamp(value);
    }

    add(toAdd) {
        if (typeof toAdd === 'bigint')
            toAdd = BigInt.asIntN(8, toAdd);
        let value = this.value;
        if (typeof value === 'bigint')
            value = BigInt.asIntN(8, value);
        value = JvmByte.#clamp(value) + JvmByte.#clamp(toAdd);
        this.value = JvmByte.#clamp(value);
        return this;
    }

    toString() {
        return `${this.get()}`;
    }

    static get MAX_VALUE() { return 127; }
    static get EPSILON_VALUE() { return 1; }
    static get MIN_VALUE() { return -128; }
}

// 16-bit
class JvmChar extends JvmNumber {

    /** @param value {string|number|BigInt} */
    constructor(value) {
        if (typeof value === 'string') {
            if (value.length !== 1) throw new Error('Wrong length of character string. Expecting 1 but got ' + value.length + '.');
            value = value.charCodeAt(0);
        }
        super(JvmChar.#clamp(value), JvmNumberType.Char, JvmNumberAsmSymbols.Char);
    }

    static of(value) {
        return new JvmChar(value);
    }

    /**
     * @param value {number|BigInt}
     */
    static #clamp(value) {
        if (typeof value === 'number')
            value = BigInt.asUintN(16, BigInt(value));
        return Math.trunc(Number(value));
    }

    set(value) {
        if (typeof value === 'bigint')
            value = BigInt.asIntN(16, value);
        return super.set(JvmChar.#clamp(value));
    }

    /** @returns {number} */
    get() {
        let value = this.value;
        if (typeof value === 'bigint')
            value = BigInt.asIntN(16, value);
        return JvmChar.#clamp(value);
    }

    add(toAdd) {
        if (typeof toAdd === 'bigint')
            toAdd = BigInt.asIntN(8, toAdd);
        let value = this.value;
        if (typeof value === 'bigint')
            value = BigInt.asIntN(8, value);
        value = JvmChar.#clamp(value) + JvmChar.#clamp(toAdd);
        this.value = JvmChar.#clamp(value);
        return this;
    }

    toString() {
        return `${this.get()}`;
    }

    static get MAX_VALUE() { return 65535; }
    static get EPSILON_VALUE() { return 1; }
    static get MIN_VALUE() { return 0; }
}

// 16-bit
class JvmShort extends JvmNumber {

    /** @param value {number|BigInt} */
    constructor(value) {
        super(JvmShort.#clamp(value), JvmNumberType.Short, JvmNumberAsmSymbols.Short);
    }

    static of(value) {
        return new JvmShort(value);
    }

    /**
     * @param value {number|BigInt}
     */
    static #clamp(value) {
        if (typeof value === 'number')
            value = BigInt.asIntN(16, BigInt(value));
        return Math.trunc(Number(value));
    }

    set(value) {
        if (typeof value === 'bigint')
            value = BigInt.asIntN(16, value);
        return super.set(JvmShort.#clamp(value));
    }

    /** @returns {number} */
    get() {
        let value = this.value;
        if (typeof value === 'bigint')
            value = BigInt.asIntN(16, value);
        return JvmShort.#clamp(value);
    }

    add(toAdd) {
        if (typeof toAdd === 'bigint')
            toAdd = BigInt.asIntN(16, toAdd);
        let value = this.value;
        if (typeof value === 'bigint')
            value = BigInt.asIntN(16, value);
        value = JvmShort.#clamp(value) + JvmShort.#clamp(toAdd);
        this.value = JvmShort.#clamp(value);
        return this;
    }

    toString() {
        return `${this.get()}`;
    }

    static get MAX_VALUE() { return 32767; }
    static get EPSILON_VALUE() { return 1; }
    static get MIN_VALUE() { return -32768; }
}

// 32-bit
class JvmInteger extends JvmNumber {

    /** @param value {number|BigInt} */
    constructor(value) {
        super(JvmInteger.#clamp(value), JvmNumberType.Int, JvmNumberAsmSymbols.Int);
    }

    /**
     * Create a new {JvmInteger} instance by value
     * @param value {number|BigInt}
     * @returns {JvmInteger}
     */
    static of(value) {
        return new JvmInteger(value);
    }

    /* Some math operations */
    addWithOther(other) { return JvmInteger.of(this.get() + other.get()); }
    subWithOther(other) { return JvmInteger.of(this.get() - other.get()); }
    mulWithOther(other) { return JvmInteger.of(this.get() * other.get()); }
    divWithOther(other) { return JvmInteger.of(this.get() / other.get()); }
    remWithOther(other) { return JvmInteger.of(this.get() % other.get()); }
    shlWithOther(other) { return JvmInteger.of(this.get() << other.get()); }
    shrWithOther(other) { return JvmInteger.of(this.get() >> other.get()); }
    ushrWithOther(other) { return JvmInteger.of(this.get() >>> other.get()); }
    andWithOther(other) { return JvmInteger.of(this.get() & other.get()); }
    orWithOther(other) { return JvmInteger.of(this.get() | other.get()); }
    xorWithOther(other) { return JvmInteger.of(this.get() ^ other.get()); }
    neg() { return JvmInteger.of(-this.get()); }

    /**
     * @param value {number|BigInt}
     * @returns {number}
     */
    static #clamp(value) {
        if (typeof value === 'bigint')
            value = Number(value);
        return Math.trunc(value) | 0;
    }

    set(value) {
        if (typeof value === 'bigint')
            value = BigInt.asIntN(32, value);
        return super.set(JvmInteger.#clamp(value));
    }

    /** @returns {number} */
    get() {
        let value = this.value;
        if (typeof value === 'bigint')
            value = BigInt.asIntN(32, value);
        return JvmInteger.#clamp(value);
    }

    add(toAdd) {
        if (typeof toAdd === 'bigint')
            toAdd = BigInt.asIntN(32, toAdd);
        let value = this.value;
        if (typeof value === 'bigint')
            value = BigInt.asIntN(32, value);
        value = JvmInteger.#clamp(value) + JvmInteger.#clamp(toAdd);
        this.value = JvmInteger.#clamp(value);
        return this;
    }

    toString() {
        return `${this.get()}`;
    }

    /** @type {number} */
    static get MAX_VALUE() { return 2147483647 };
    /** @type {number} */
    static get EPSILON_VALUE() { return 1 };
    /** @type {number} */
    static get MIN_VALUE() { return -2147483648 };
}

// 32-bit
class JvmFloat extends JvmNumber {

    /** @param value {number} */
    constructor(value) {
        super(Math.fround(value), JvmNumberType.Float, JvmNumberAsmSymbols.Float);
    }

    static of(value) {
        return new JvmFloat(value);
    }

    /* Some math operations */
    addWithOther(other) { return JvmFloat.of(this.get() + other.get()); }
    subWithOther(other) { return JvmFloat.of(this.get() - other.get()); }
    mulWithOther(other) { return JvmFloat.of(this.get() * other.get()); }
    divWithOther(other) { return JvmFloat.of(this.get() / other.get()); }
    remWithOther(other) { return JvmFloat.of(this.get() % other.get()); }
    neg() { return JvmFloat.of(-this.get()); }

    set(toAdd) {
        if (typeof toAdd === 'bigint')
            toAdd = Number(BigInt.asIntN(32, toAdd));
        return super.set(Math.fround(toAdd));
    }

    /** @returns {number} */
    get() {
        return Math.fround(this.value);
    }

    add(toAdd) {
        if (typeof toAdd === 'bigint')
            toAdd = Number(BigInt.asIntN(32, toAdd));
        this.set(this.get() + Math.fround(toAdd));
        return this;
    }

    toString() {
        return `${this.get()}`;
    }

    /** @type {number} */
    static get MAX_VALUE() { return Math.fround(340282346638528859811704183484516925440) };
    /** @type {number} */
    static get EPSILON_VALUE() { return Math.fround(0.00000000000000000000000000000000000000000000140129846432481707092372958328991613128026194187651577175706828388979108268586060148663818836212158203125) };
    /** @type {number} */
    static get MIN_VALUE() { return Math.fround(-340282346638528859811704183484516925440) };
}

// 64-bit
class JvmLong extends JvmNumber {

    /** @param value {number|BigInt} */
    constructor(value) {
        super(JvmLong.#clamp(value), JvmNumberType.Long, JvmNumberAsmSymbols.Long);
    }

    static of(value) {
        return new JvmLong(value);
    }

    /* Some math operations */
    addWithOther(other) { return JvmLong.of(this.get() + other.get()); }
    subWithOther(other) { return JvmLong.of(this.get() - other.get()); }
    mulWithOther(other) { return JvmLong.of(this.get() * other.get()); }
    divWithOther(other) { return JvmLong.of(this.get() / other.get()); }
    remWithOther(other) { return JvmLong.of(this.get() % other.get()); }
    shlWithOther(other) { return JvmLong.of(this.get() << other.get()); }
    shrWithOther(other) { return JvmLong.of(this.get() >> other.get()); }
    ushrWithOther(other) { return JvmLong.of(this.get() >>> other.get()); }
    andWithOther(other) { return JvmLong.of(this.get() & other.get()); }
    orWithOther(other) { return JvmLong.of(this.get() | other.get()); }
    xorWithOther(other) { return JvmLong.of(this.get() ^ other.get()); }
    neg() { return JvmLong.of(-this.get()); }

    /**
     * @param value {number|BigInt}
     */
    static #clamp(value) {
        if (typeof value === 'number')
            value = BigInt(Math.trunc(value));
        return BigInt.asIntN(64, value);
    }

    set(value) {
        if (typeof value === 'number')
            value = BigInt(value);
        return super.set(JvmLong.#clamp(value));
    }

    /** @type {BigInt} */
    get() {
        return JvmLong.#clamp(this.value);
    }

    /** @type {number} */
    getInt() {
        return Number(JvmLong.#clamp(this.value));
    }

    add(toAdd) {
        if (typeof toAdd === 'number')
            toAdd = BigInt(toAdd);
        let value = this.value;
        if (typeof value === 'number')
            value = BigInt(value);
        value = JvmLong.#clamp(value) + JvmLong.#clamp(toAdd);
        this.value = JvmLong.#clamp(value);
        return this;
    }

    toString() {
        return `${this.get()}`;
    }

    /** @type {BigInt} */
    static get MAX_VALUE() { return 9223372036854775807n };
    /** @type {BigInt} */
    static get EPSILON_VALUE() { return 1n };
    /** @type {BigInt} */
    static get MIN_VALUE() { return -9223372036854775808n };
}

// 64-bit
// TODO: I think this whole class needs to be looked at.
class JvmDouble extends JvmNumber {

    /** @param value {number|BigInt} */
    constructor(value) {
        super(JvmDouble.#clamp(value), JvmNumberType.Double, JvmNumberAsmSymbols.Double);
    }

    static of(value) {
        return new JvmDouble(value);
    }

    /* Some math operations */
    addWithOther(other) { return JvmDouble.of(this.get() + other.get()); }
    subWithOther(other) { return JvmDouble.of(this.get() - other.get()); }
    mulWithOther(other) { return JvmDouble.of(this.get() * other.get()); }
    divWithOther(other) { return JvmDouble.of(this.get() / other.get()); }
    remWithOther(other) { return JvmDouble.of(this.get() % other.get()); }
    neg() { return JvmDouble.of(-this.get()); }

    /**
     * @param value {number|BigInt}
     */
    static #clamp(value) {
        if (typeof value === 'bigint')
            value = Number(value);
        return value;
    }

    add(toAdd) {
        if (typeof toAdd === 'bigint')
            toAdd = Number(toAdd);
        let value = this.value;
        if (typeof value === 'bigint')
            value = Number(value);
        value = JvmDouble.#clamp(value) + JvmDouble.#clamp(toAdd);
        this.value = JvmDouble.#clamp(value);
        return this;
    }

    /** @type {number} */
    static get MAX_VALUE() { return 1.797_693_134_862_315_7E+308 };
    // static get MAX_VALUE() { return 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368 };
    static get EPSILON_VALUE() { return 4.94065645841246544176568792868221372365059802614324764425585682500675507270208751865299836361635992379796564695445717730926656710355939796398774796010781878126300713190311404527845817167848982103688718636056998730723050006387409153564984387312473397273169615140031715385398074126238565591171026658556686768187039560310624931945271591492455329305456544401127480129709999541931989409080416563324524757147869014726780159355238611550134803526493472019379026810710749170333222684475333572083243193609238289345836806010601150616980975307834227731832924790498252473077637592724787465608477820373446969953364701797267771758512566055119913150489110145103786273816725095583738973359899E-32 };
    /** @type {number} */
    static get MIN_VALUE() { return -JvmDouble.MAX_VALUE };
}