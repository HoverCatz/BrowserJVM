class JavacUtils {

    /** @type string */
    text;

    /** @type Iterator */
    iter;

    constructor(iter) {
        this.iter = iter;
    }

    /**
     * Check if character is alpha-numeric (a-zA-Z0-9)
     * @param char {string}
     * @returns {boolean}
     */
    isAlphaNumeric(char) {
        return /[a-zA-Z0-9]/.test(char);
    }

    /**
     * Check if character is a whitespace (space, tab, newline)
     * @param char
     * @returns {boolean}
     */
    isWhitespace(char) {
        return /\s/.test(char);
    }

    readWord(iter = null) {
        iter = (iter === null ? this.iter : iter);
        this.skipWhitespace(iter);
        let output = '';
        while (true) {
            const peek = iter.peek();
            if (!this.isAlphaNumeric(peek))
                break;
            output += iter.next();
        }
        this.skipWhitespace(iter);
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
        while (true) {
            const peek = iter.peek();
            if (!this.isWhitespace(peek))
                break;
            iter.next();
        }
    }

    /**
     *
     * @param text {string}
     * @param index {int}
     * @param open {string}
     * @param close {string}
     * @returns {(number|string)[]}
     */
    findOpenCloseRange(text, index, open, close) {
        // Set up substring
        text = text.substring(index);
        let openIndex = 0;
        let closeIndex = 0;
        // Keep track of open/closing
        let count = 0;
        // Are we inside a string? ""
        let inString = false;
        // Keep track of string backslashes
        let inStringBackslash = 0;
        // Are we inside a normal comment? //
        let inComment1 = false;
        // Are we inside a multi-line comment? /*
        let inComment2 = false;
        // Make a new temporary iterator
        const iter = new Iterator(text);
        while (true) {
            const char = iter.next();
            if (!char)
                break;

            if (inString) {
                // Detect escaping
                if (char === '\\') {
                    inStringBackslash++;
                    if (inStringBackslash === 2) // Reset escape!
                        inStringBackslash = 0;
                } else if (char === '"' && inStringBackslash === 0) {
                    inString = false;
                    inStringBackslash = 0;
                } else {
                    inStringBackslash = 0;
                }
                continue;
            }

            if (char === '/' && !inComment1 && iter.peek() === '/') {
                inComment1 = true;
                iter.next(); // Skip /
                continue;
            } else if (inComment1) {
                if (char === '\n') {
                    inComment1 = false;
                }
                continue;
            }

            if (char === '/' && !inComment2 && iter.peek() === '*') {
                inComment2 = true;
                iter.next(); // Skip *
                continue;
            } else if (inComment2) {
                if (char === '*' && iter.peek() === '/') {
                    inComment2 = false;
                    iter.next(); // Skip last /
                }
                continue;
            }

            if (char === '"') {
                inString = true;
                continue;
            }

            if (char === open) {
                count++;
                if (count === 1)
                    openIndex += iter.index() + 1; // Ignore first opening symbol
            }
            else if (char === close) {
                count--;
                if (count === 0) {
                    closeIndex += iter.index(); // Ignore last closing symbol (no +1)
                    break;
                }
            }
        }
        return [ openIndex, closeIndex, text.substring(openIndex, closeIndex) ];
    }

}

class Iterator {

    /** @type string */
    chars;

    /** @type int */
    len;

    /** @type int */
    curr = -1;

    /** @type {{}} */
    bookmarks = {};

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

    setBookmark(num) {
        this.bookmarks[num] = this.index();
    }

    gotoBookmark(num) {
        this.setIndex(this.bookmarks[num]);
        delete this.bookmarks[num];
    }

    /**
     * Get the current character
     * @returns {string}
     */
    char() {
        return this.chars[this.chars];
    }

    next(n = 1) {
        if ((this.curr += n) >= this.len) return false;
        return this.chars[this.curr];
    }

    prev(n = 1) {
        if ((this.curr -= n) < 0) return false;
        return this.chars[this.curr];
    }

    peek(n = 1) {
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
