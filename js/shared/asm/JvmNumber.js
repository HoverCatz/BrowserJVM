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
     * @param value {number|BigInt}
     * @param type {JvmNumberType}
     */
    constructor(value, type) {
        this.value = value;
        this.type = type;
    }

    /**
     * Set number value
     * @param value {number|BigInt}
     */
    set(value) {
        this.value = value;
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
     */
    add(value) {
        this.value = value;
    }

    /**
     * Get the number type JvmNumberType(Int, Float, Long, Double)
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
        return 'JvmNumber';
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
        super(JvmByte.#clamp(value), JvmNumberType.Byte);
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
        super.set(JvmByte.#clamp(value));
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
    }

    getAsmType() {
        return 'B';
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

    /** @param value {number|BigInt} */
    constructor(value) {
        super(JvmChar.#clamp(value), JvmNumberType.Char);
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
        super.set(JvmChar.#clamp(value));
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
    }

    getAsmType() {
        return 'C';
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
        super(JvmShort.#clamp(value), JvmNumberType.Short);
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
        super.set(JvmShort.#clamp(value));
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
    }

    getAsmType() {
        return 'S';
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
        // const typeString = getTypeString(value);
        // const numberType = getNumberType(typeString);
        super(JvmInteger.#clamp(value), JvmNumberType.Int);
    }

    static of(value) {
        return new JvmInteger(value);
    }

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
        super.set(JvmInteger.#clamp(value));
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
    }

    getAsmType() {
        return 'I';
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
        super(Math.fround(value), JvmNumberType.Float);
    }

    static of(value) {
        return new JvmFloat(value);
    }

    set(toAdd) {
        if (typeof toAdd === 'bigint')
            toAdd = Number(BigInt.asIntN(32, toAdd));
        super.set(Math.fround(toAdd));
    }

    /** @returns {number} */
    get() {
        return Math.fround(this.value);
    }

    add(toAdd) {
        if (typeof toAdd === 'bigint')
            toAdd = Number(BigInt.asIntN(32, toAdd));
        this.set(this.get() + Math.fround(toAdd));
    }

    getAsmType() {
        return 'F';
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
        super(JvmLong.#clamp(value), JvmNumberType.Long);
    }

    static of(value) {
        return new JvmLong(value);
    }

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
        this.value = JvmLong.#clamp(value);
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
    }

    getAsmType() {
        return 'J';
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
class JvmDouble extends JvmNumber {

    /** @param value {number|BigInt} */
    constructor(value) {
        super(JvmDouble.#clamp(value), JvmNumberType.Double);
    }

    static of(value) {
        return new JvmDouble(value);
    }

    /**
     * @param value {number|BigInt}
     */
    static #clamp(value) {
        if (typeof value === 'bigint')
            value = Number(value);
        return value;
    }

    getAsmType() {
        return 'D';
    }

    /** @type {number} */
    static get MAX_VALUE() { return 1.797_693_134_862_315_7E+308 };
    // static get MAX_VALUE() { return 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368 };
    static get EPSILON_VALUE() { return 4.94065645841246544176568792868221372365059802614324764425585682500675507270208751865299836361635992379796564695445717730926656710355939796398774796010781878126300713190311404527845817167848982103688718636056998730723050006387409153564984387312473397273169615140031715385398074126238565591171026658556686768187039560310624931945271591492455329305456544401127480129709999541931989409080416563324524757147869014726780159355238611550134803526493472019379026810710749170333222684475333572083243193609238289345836806010601150616980975307834227731832924790498252473077637592724787465608477820373446969953364701797267771758512566055119913150489110145103786273816725095583738973359899E-32 };
    /** @type {number} */
    static get MIN_VALUE() { return -JvmDouble.MAX_VALUE };
}