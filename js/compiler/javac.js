/*

    package compilertesting.fields;
    public class CompilerTestV1 {

    }

*/
class JavaSourceReader {

    /** @type string */
    fileName;

    /** @type string */
    text;

    /** @type Iterator */
    iter;

    constructor(fileName) {
        this.fileName = fileName;
    }

    async init() {
        const response = await fetch(this.fileName);
        this.text = await response.text();
        this.iter = new Iterator(this.text);
    }

    async parseSourceCode() {
        const iter = this.iter;

        // Skip the very first whitespace (if any)
        this.skipWhitespace();

        let word = this.readWord();
        console.log(word);

        console.log(this.readPackage());

        return '';
    }

    readWord(iter = null) {
        iter = (iter === null ? this.iter : iter);
        let output = '';
        while (true) {
            const char = iter.next();
            if (!this.isAlphaNumeric(char))
                break;
            output += char;
        }
        if (output.length > 0)
            iter.prev();
        return output;
    }

    readPackage(iter = null) {
        iter = (iter === null ? this.iter : iter);
        const packageEnd = this.text.indexOf(';', iter.index());
        const pkg = [];
        while (iter.index() < packageEnd) {
            // this.skipWhitespace(iter);
            const word = this.readWord(iter);
            console.log(`word: '${word}'`)
            pkg.push(word);
        }
        this.skipWhitespace(iter);
        return pkg.join('.');
    }

    skipWhitespace(iter = null) {
        iter = (iter === null ? this.iter : iter);
        let char;
        do {
            char = iter.next();
        } while (this.isWhitespace(char));
        iter.prev();
    }

    isAlphaNumeric(char) {
        return /[a-zA-Z0-9]/.test(char);
    }

    isWhitespace(char) {
        return /\s/.test(char);
    }

}

class Iterator {

    /** @type string */
    chars;

    /** @type int */
    len;

    /** @type int */
    curr = -1;

    constructor(text) {
        this.chars = text.split('');
        this.len = text.length;
    }

    index() {
        return this.curr;
    }

    setIndex(index) {
        this.curr = index;
    }

    length() {
        return this.length;
    }

    next(n = 1) {
        if ((this.curr += n) >= this.len) return false;
        return this.chars[this.curr];
    }

    prev(n = 1) {
        if ((this.curr -= n) < 0) return false;
        return this.chars[this.curr];
    }

    peek(n = 0) {
        if ((this.curr + n) >= this.len) return false;
        return this.chars[this.curr + n];
    }

    peekNext(n = 1) {
        return this.peek(n);
    }

    peekPrev(n = 1) {
        return this.peek(-n);
    }

}
