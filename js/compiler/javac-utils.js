class JavacUtils {

    /** @type string */
    text;

    /** @type Iterator */
    iter;

    /** @type boolean */
    done;

    /** @type string[] */
    alphaNumericArray;

    /** @type string[] */
    alphaNumericAnnotationArray;

    /** @type string[] */
    annotationArray;

    accessWords = {
        'public': Opcodes.ACC_PUBLIC,
        'private': Opcodes.ACC_PRIVATE,
        'protected': Opcodes.ACC_PROTECTED,
        'static': Opcodes.ACC_STATIC,
        'final': Opcodes.ACC_FINAL,
        'abstract': Opcodes.ACC_ABSTRACT,
        'deprecated': Opcodes.ACC_DEPRECATED
        // Records aren't supported in java7
    };

    classTypes = [
        'class',
        'enum',
        'interface'
    ];

    /** @param iter {Iterator} */
    constructor(iter) {
        this.iter = iter;
        this.alphaNumericArray = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
            'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
            'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
            'y', 'z',
            'Y', 'Z',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
        ];
        this.annotationArray = ['@', '.', '('];
        this.alphaNumericAnnotationArray = this.annotationArray.concat(this.alphaNumericArray);
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
     * @param char {string}
     * @returns {boolean}
     */
    isWhitespace(char) {
        return /\s/.test(char);
    }

    indexOf(char, iter = null) {
        iter = (iter === null ? this.iter : iter);
        const index = iter.index();
        while (true) {
            const peek = iter.peek();
            if (!peek) {
                this.done = true;
                return false;
            }
            iter.next();
            if (peek === char)
                return iter.index();
        }
        iter.setIndex(index);
        return -1;
    }

    indexOfFirstSkipComments(chars, iter = null) {
        iter = (iter === null ? this.iter : iter);
        // Are we inside a string? ""
        let inString = false;
        // Keep track of string backslashes
        let inStringBackslash = 0;
        // Are we inside a normal comment? //
        let inComment1 = false;
        // Are we inside a multi-line comment? /*
        let inComment2 = false;
        const index = iter.index();
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

            if (chars.includes(char)) {
                return [ iter.index(), char ];
            }

        }
        return [ -1, null ];
    }

    indexOfFirst(chars, iter = null, skipComments = true) {
        if (skipComments)
            return this.indexOfFirstSkipComments(chars, iter);
        iter = (iter === null ? this.iter : iter);
        const index = iter.index();
        while (true) {
            const peek = iter.peek();
            if (!peek) {
                this.done = true;
                return [ false ];
            }
            iter.next();
            if (chars.includes(peek)) {
                const foundIndex = iter.index();
                iter.setIndex(index);
                return [ foundIndex, peek ];
            }
        }
        iter.setIndex(index);
        return [ -1, null ];
    }

    readWord(iter = null, doSkipWhitespace = true) {
        iter = (iter === null ? this.iter : iter);
        if (doSkipWhitespace && !this.skipWhitespace(iter)) return false;
        let output = '';
        while (true) {
            const peek = iter.peek();
            if (!peek) {
                this.done = true;
                return false;
            }
            if (!this.isAlphaNumeric(peek))
                break;
            output += iter.next();
        }
        if (doSkipWhitespace && !this.skipWhitespace(iter)) return false;
        return output;
    }

    peekWord(iter = null) {
        iter = (iter === null ? this.iter : iter);
        const index = iter.index();
        if (!this.skipWhitespace(iter)) return false;
        let output = '';
        while (true) {
            const peek = iter.peek();
            if (!peek) {
                this.done = true;
                return false;
            }
            if (!this.isAlphaNumeric(peek))
                break;
            output += iter.next();
        }
        iter.setIndex(index);
        return output;
    }

    #skipComments(peek, iter) {
        if (iter.peek(2) === '/') { // Single-line comment
            // Skip until next line
            if (!this.readUntil('\n', iter)) {
                this.done = true;
                return false;
            }
        } else if (iter.peek(2) === '*') { // Multi-line comment
            // Skip until next *
            while (true) {
                if (!this.readUntil('*', iter)) {
                    this.done = true;
                    return false;
                }
                peek = iter.peek();
                if (!peek) {
                    this.done = true;
                    return false;
                }
                if (peek === '/') {
                    iter.next();
                    break;
                }
            }
        }
        return true
    }

    skipWhitespace(iter = null, skipComments = true) {
        iter = (iter === null ? this.iter : iter);
        while (true) {
            let peek = iter.peek();
            if (!peek) {
                this.done = true;
                return false;
            }
            if (!this.isWhitespace(peek)) {
                if (skipComments && peek === '/') {
                    // Enter comment!
                    if (!this.#skipComments(peek, iter))
                        return false;
                    continue;
                }
                break;
            }
            iter.next();
        }
        return true;
    }

    readUntil(char, iter = null, include = true) {
        iter = (iter === null ? this.iter : iter);
        let output = '';
        while (true) {
            const peek = iter.peek();
            if (!peek) {
                this.done = true;
                return false;
            }
            if (peek === char) {
                if (include) {
                    output += peek;
                    if (!iter.next()) {
                        this.done = true;
                        return false;
                    }
                }
                break;
            }
            output += peek;
            if (!iter.next()) {
                this.done = true;
                return false;
            }
        }
        return output;
    }

    peekUntil(char, iter = null, include = true) {
        iter = (iter === null ? this.iter : iter);
        const index = iter.index();
        let output = '';
        while (true) {
            const peek = iter.peek();
            if (!peek) {
                this.done = true;
                return false;
            }
            if (peek === char) {
                if (include) {
                    output += peek;
                    if (!iter.next()) {
                        this.done = true;
                        return false;
                    }
                }
                break;
            }
            output += peek;
            if (!iter.next()) {
                this.done = true;
                return false;
            }
        }
        iter.setIndex(index);
        return output;
    }

    /**
     * @param text {string}
     * @param iter {Iterator}
     * @returns {*[]|false}
     * @throws {Error}
     */
    detectNextItem(text, iter) {
        if (!this.skipWhitespace(iter))
            return false;
        const [ index, first ] = this.indexOfFirst([';', '=', '(', '@', '{'], iter);
        console.log(index, first)
        if (index === false || index === -1)
            return [ -1, false ];
        switch (first) {
            case ';': return [ index, ClassItemType.FieldNoValue ];
            case '=': return [ index, ClassItemType.Field ];
            case '(': return [ index, ClassItemType.Function ];
            case '@': return [ index, ClassItemType.Annotation ];
            case '{': return [ index, ClassItemType.Class ];
        }
        return [ -2 - index, first ];
        // throw new Error(`Unknown type '${first}' at index ${index}.`);
    }

    /**
     * @param text {string}
     * @returns {string}
     */
    getTextWithoutComments(text) {
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
        // Resulting string
        let output = '';
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
                    output += char;
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

            output += char;
        }
        return output;
    }

    /**
     * @param text {string}
     * @param index {int}
     * @returns {(number|string)[]}
     */
    findOpenCloseRangeAllBrackets(text, index) {
        let countA = 0; // {
        let countB = 0; // (
        let countC = 0; // [
        // Are we inside a string? ""
        let inString = false;
        // Keep track of string backslashes
        let inStringBackslash = 0;
        // Are we inside a normal comment? //
        let inComment1 = false;
        // Are we inside a multi-line comment? /*
        let inComment2 = false;
        // Resulting indexes
        let startIndex = 0;
        let endIndex = 0;
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

            let allZero = (countA === 0 && countB === 0 && countC === 0);
            if (char === '{') {
                if (allZero) startIndex = iter.index();
                countA++;
            } else if (char === '}') {
                countA--;
            }

            else if (char === '(') {
                if (allZero) startIndex = iter.index();
                countB++;
            } else if (char === ')') {
                countB--;
            }

            else if (char === '[') {
                if (allZero) startIndex = iter.index();
                countC++;
            } else if (char === ']') {
                countC--;
            }

            if (!allZero) {
                allZero = (countA === 0 && countB === 0 && countC === 0);
                if (allZero) {
                    // If we just closed them all!
                    endIndex = iter.index();
                    break;
                }
            }

        }
        return [ startIndex, endIndex, text.substring(startIndex, endIndex) ];
    }

    /**
     * @param text {string}
     * @param index {int}
     * @param open {string|false}
     * @param close {string|false}
     * @returns {(number|string)[]}
     */
    findOpenCloseRange(text, index, open = false, close = false) {
        if (!open && !close)
            return this.findOpenCloseRangeAllBrackets(text, index);
        let openIndex = index;
        let closeIndex = index;
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
        const iter = new Iterator(text.substring(index));
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

    accessFlagsToString(access) {
        const strings = [];

        if ((Opcodes.ACC_PUBLIC & access) != 0x0)
            strings.push('public');
        else
        if ((Opcodes.ACC_PRIVATE & access) != 0x0)
            strings.push('private');
        else
        if ((Opcodes.ACC_PROTECTED & access) != 0x0)
            strings.push('protected');

        if ((Opcodes.ACC_STATIC & access) != 0x0)
            strings.push('static');

        if ((Opcodes.ACC_FINAL & access) != 0x0)
            strings.push('final');

        if ((Opcodes.ACC_ABSTRACT & access) != 0x0)
            strings.push('abstract');

        if ((Opcodes.ACC_DEPRECATED & access) != 0x0)
            strings.push('deprecated');

        return strings.join(' ');
    }

}

class ClassItemType {

    static Field = 'field';
    static FieldNoValue = 'field_no_value';
    static Function = 'function';
    static Annotation = 'annotation';

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
        return this.chars[this.curr];
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
