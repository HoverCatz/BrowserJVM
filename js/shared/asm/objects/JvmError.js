class JvmError extends Error {

    type; // type string (java/lang/Exception, java/lang/ArithmeticException, etc)

    constructor(message, type = '') {
        super(message);
        this.type = type;
    }

}