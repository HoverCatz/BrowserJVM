class JavacUtils {

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
        'protected': Opcodes.ACC_PROTECTED,
        'private': Opcodes.ACC_PRIVATE,
        'static': Opcodes.ACC_STATIC,
        'final': Opcodes.ACC_FINAL,
        'abstract': Opcodes.ACC_ABSTRACT,
        'deprecated': Opcodes.ACC_DEPRECATED,
        'strictfp': Opcodes.ACC_STRICT
        // Records aren't supported in java7
    };

    classTypes = [
        'class',
        'enum',
        'interface'
    ];

    /**
     * @param iter {Iterator}
     */
    constructor(iter) {
        this.iter = iter;
        this.done = false;
        this.alphaNumericArray = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
        ];
        this.annotationArray = ['@', '.', '('];
        this.alphaNumericAnnotationArray = this.annotationArray.concat(this.alphaNumericArray);
    }

    get text() {
        return this.iter.text;
    }

    /**
     * Check if character is alpha-numeric (a-zA-Z0-9)
     * @param char {string}
     * @returns {boolean}
     */
    isAlphaNumeric(char) {
        // return /[a-zA-Z0-9]/.test(char);
        // return this.alphaNumericArray.includes(char);
        return /\w/.test(char);
    }

    /**
     * Check if character is a whitespace (space, tab, newline)
     * @param char {string}
     * @returns {boolean}
     */
    isWhitespace(char) {
        return /\s/.test(char);
    }

    /**
     * Test if name is a valid java name.
     * - They must begin with a letter, underscore (_), or dollar sign ($).
     * - Subsequent characters can be letters, digits, underscores, or dollar signs.
     * @param name {string}
     * @returns {boolean}
     */
    isValidJavaName(name) {
        return /^[$A-Za-z_*][\w$]*$/.test(name);
    }

    /**
     * @param iter {Iterator}
     * @returns {[int,int|null|false]|false}
     * @throws {Error}
     */
    detectNextItem(iter) {
        if (!this.skipWhitespace(iter))
            return false;
        const [ index, first ] = this.indexOfFirst(['@', '{', ';', '=', '('], iter);
        if (index === false || index === -1)
            return [ -1, false ];
        const type = this.charToType(first);
        if (type === '')
            return [ -2 - index, first ];
        //    throw new Error(`Unknown type '${first}' at index ${index}.`);
        return [ index, type ];
    }

    charToType(char) {
        switch (char) {
            case '@': return ClassItemType.Annotation;
            case '{': return ClassItemType.Class;
            case ';': return ClassItemType.FieldNoValue;
            case '=': return ClassItemType.Field;
            case '(': return ClassItemType.Function;
        }
        return '';
    }

    /**
     * Skip until we find the next closing character:
     * ( -> ), { -> }, [ -> ]
     * @param char {string}
     * @param iter {Iterator}
     */
    skipUntilClosingChar(char, iter = null) {
        iter = (iter === null ? this.iter : iter);

        let findClosing = (char === '(' ? ')' : (char === '{' ? '}' : (char === '[' ? ']' : (char === '<' ? '>' : false))));
        if (findClosing === false)
            throw new Error(`Invalid open-character: '${char}'`);

        let count = 0;

        let len = iter.len;
        for (let i = iter.curr; i < len; i++) {
            const c = iter.char();

            // console.log(`c: ${c}, ignored: ${iter.isIgnore(i)}`)

            iter.next();
            if (iter.isIgnore(i))
                continue;

            if (c === char) {
                count++;
                // console.log('opening (' + count + ')')
            }
            else if (c === findClosing) {
                count--;
                // console.log('closing (' + count + ')')
                if (count === 0) {
                    // iter.next(); // Skip last closing character
                    // console.log('!END!')
                    break;
                }
            }
        }
    }

    skipAllBracketsUntilSemicolon(iter = null) {
        this.skipAllBracketsUntilSemicolonBy(['(', '{', '['], iter);
    }

    skipAllBracketsUntilSemicolonBy(chars, iter = null) {
        iter = (iter === null ? this.iter : iter);

        const [ index, found ] =
            this.indexOfFirst(chars.concat([';']), iter);
        // console.log(`firstFound: ${found ?? -1}`)
        if (index === -1 || found === ';')
            return;
        this.skipUntilClosingChar(found, iter);
    }

    indexOfFirst(chars, iter = null, test = false) {
        iter = (iter === null ? this.iter : iter);
        const index = iter.curr;

        const len = iter.len;
        for (let i = index; i < len; i++) {

            // console.log(`${i}, ${iter.char()}: ${iter.getIgnore(i)}`)

            if (iter.isIgnore(i)) {
                iter.next();
                continue;
            }

            const c = iter.char();
            if (chars.includes(c)) {
                iter.setIndex(index);
                return [ i, c ];
            }

            iter.next();
        }
        iter.setIndex(index);
        return [ -1, null ];
    }

    skipWhitespace(iter = null, skipComments = true) {
        iter = (iter === null ? this.iter : iter);
        const len = iter.len;
        for (let i = iter.curr; i < len; i++) {

            if (skipComments && iter.isIgnore(i)) {
                iter.next();
                continue;
            }

            const c = iter.char();
            if (this.isWhitespace(c)) {
                iter.next();
                continue;
            }

            break;
        }
        return true;
    }

    peekAlphaNumeric(iter = null) {
        return this.readAlphaNumeric(iter, true);
    }

    readAlphaNumeric(iter = null, isPeek = false) {
        iter = (iter === null ? this.iter : iter);
        if (!this.skipWhitespace(iter)) {
            this.done = true;
            return false;
        }
        let output = '';
        for (let i = iter.curr, n = 0; i < iter.len; i++, n++) {
            let c;
            if (isPeek) c = iter.peek(n);
            else c = iter.char();
            if (!this.isAlphaNumeric(c)) break;
            if (!isPeek)
                iter.next();
            output += c;
        }
        return output;
    }

    readUntil(c, iter = null, include = true) {
        iter = (iter === null ? this.iter : iter);
        let output = '';
        while (true) {
            const char = iter.char();
            if (!char) {
                this.done = true;
                return false;
            }
            if (char === c) {
                if (include) {
                    output += char;
                    if (!iter.next()) {
                        this.done = true;
                        return false;
                    }
                }
                break;
            }
            output += char;
            if (!iter.next()) {
                this.done = true;
                return false;
            }
        }
        return output;
    }

    /**
     * Removes comments from the iterator
     * @param iter {Iterator}
     */
    removeComments(iter) {
        iter = (iter === null ? this.iter : iter);
        const chars = iter.chars;
        let output = '';
        for (let i = 0; i < iter.len; i++) {
            if (iter.isIgnore(i)) continue;
            output += chars[i];
        }
        iter.setText(output);
    }

    /**
     * Convert accessFlags (int) to a readable string
     * @param accessFlags {int}
     * @returns {string}
     */
    static accessFlagsToString(accessFlags) {
        const strings = [];

        if ((Opcodes.ACC_PUBLIC & accessFlags) != 0x0)
            strings.push('public');
        else
        if ((Opcodes.ACC_PRIVATE & accessFlags) != 0x0)
            strings.push('private');
        else
        if ((Opcodes.ACC_PROTECTED & accessFlags) != 0x0)
            strings.push('protected');

        if ((Opcodes.ACC_STATIC & accessFlags) != 0x0)
            strings.push('static');

        if ((Opcodes.ACC_FINAL & accessFlags) != 0x0)
            strings.push('final');

        if ((Opcodes.ACC_ABSTRACT & accessFlags) != 0x0)
            strings.push('abstract');

        if ((Opcodes.ACC_DEPRECATED & accessFlags) != 0x0)
            strings.push('deprecated');

        if ((Opcodes.ACC_STRICT & accessFlags) != 0x0)
            strings.push('strictfp');

        return strings.join(' ');
    }

    /**
     Convert a readable string to accessFlags (int)
     * @param flagStrings {string[]}
     * @returns {number}
     */
    static stringsToAccessFlags(flagStrings) {
        let accessFlags = 0x0;
        flagStrings.forEach(flag => {
            switch (flag) {
                case 'public':     accessFlags |= Opcodes.ACC_PUBLIC; break;
                case 'private':    accessFlags |= Opcodes.ACC_PRIVATE; break;
                case 'protected':  accessFlags |= Opcodes.ACC_PROTECTED; break;
                case 'static':     accessFlags |= Opcodes.ACC_STATIC; break;
                case 'final':      accessFlags |= Opcodes.ACC_FINAL; break;
                case 'abstract':   accessFlags |= Opcodes.ACC_ABSTRACT; break;
                case 'deprecated': accessFlags |= Opcodes.ACC_DEPRECATED; break;
                case 'strictfp':   accessFlags |= Opcodes.ACC_STRICT; break;
            }
        });
        return accessFlags;
    }

}

class ClassItemType {

    static Annotation = 'annotation';
    static Class = 'class';
    static Field = 'field';
    static FieldNoValue = 'field_no_value';
    static Function = 'function';

}

class ClassParseResult {

    /** @type string */
    reason;

    static of(reason, result = null) {
        const output = new ClassParseResult();
        output.reason = reason;
        output.result = result;
        return output;
    }

    static success(result) {
        const output = new ClassParseResult();
        output.result = result;
        output.reason = ClassParseResultReason.Success;
        return output;
    }

}

class ClassParseResultReason {

    static Success = 'class_parse_success';
    static SuccessButAbrupt = 'class_parse_success_but_abrupt';
    static Failed = 'class_parse_failed_no_error';
    static FailedWithError = 'class_parse_failed_with_error';

}

class Iterator {

    /** @type string */
    text;

    /** @type [] */
    chars;

    /** @type int */
    len;

    /** @type int */
    curr = -1;

    /** @type {{}} */
    bookmarks = {};

    /**
     * All indexes where it's either inside:
     * 1. String
     * 2. Char
     * 3. Comment (single or multi)
     * @type int[]
     */
    ignoredIndexes;

    constructor(text) {
        this.text = text;
        this.chars = text.split('');
        this.len = text.length;
        this.curr = 0;
        this.init();
    }

    /**
     * Check whether the current index should be ignored,
     * AKA current char is inside a string, char or a comment.
     */
    isIgnore(i = 0) {
        return this.ignoredIndexes[i] !== 0;
    }

    getIgnore(i = 0) {
        return this.ignoredIndexes[i];
    }

    skipIgnores() {
        while (this.ignoredIndexes[this.curr] !== 0)
            if (!this.next())
                break;
    }

    setText(text) {
        this.text = text;
        this.chars = text.split('');
        this.len = text.length;
        this.curr = 0;
        this.init();
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

    setBookmark(key) {
        this.bookmarks[key] = this.index();
    }

    gotoBookmark(key) {
        this.setIndex(this.bookmarks[key]);
        delete this.bookmarks[key];
    }

    getBookmark(key) {
        return this.bookmarks[key];
    }

    /**
     * Get the current (last accessed) character
     * @returns {string|false}
     */
    char() {
        if (this.curr >= this.len) return false;
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

    peekLast(n = 1) {
        return this.peek(this.len - this.curr - n);
    }

    removeFirst(n = 1) {
        this.chars.splice(0, n);
        this.len = this.chars.length;
        this.text = this.chars.join('');
        this.curr -= n;
        if (this.curr < 0)
            this.curr = 0;
        this.ignoredIndexes.splice(0, n);
    }

    removeLast(n = 1) {
        if (n === 0) return;
        if (n < 0) n *= -1;
        this.chars.splice(-n);
        this.len = this.chars.length;
        this.text = this.chars.join('');
        this.ignoredIndexes.splice(-n);
    }

    findNext(c, jumpTo = false, jumpOver = true) {
        const curr = this.curr;
        for (let i = curr; i < this.len; i++)
            if (this.peek(i - curr) === c) {
                if (jumpTo)
                    this.setIndex(jumpOver ? i + 1 : i);
                return i;
            }
        return -1;
    }

    findFirstOfMany(chars,
                    includeChar = false,
                    jumpTo = false,
                    jumpOver = true,
                    skipComments = true,
                    skipStringsAndCharacters = true
    ) {
        const curr = this.curr;
        const len = this.len;

        let isInSingleLineComment = false,
            isInMultiLineComment = false,
            isInString = false,
            isInChar = false,
            inStringBackslash = false;

        for (let i = curr; i < len; i++) {
            const p = i < 0 ? '\n' : this.peek(i - curr - 1);
            const c = this.peek(i - curr);
            const n = i < len - 1 ? this.peek(i - curr + 1) : '\n';

            // console.log(`!!! ${c}`)

            if (skipStringsAndCharacters) {
                if (isInChar) {
                    if (n === '\'' && (c !== '\\' || (c === '\\' && p === '\\'))) {
                        isInChar = false;
                        // console.log('!!! Entering char')
                        i++;
                    }
                    continue;
                }

                if (isInString) {
                    // console.log(` inStringBackslash: ${inStringBackslash}`)
                    if (c === '\\') {
                        inStringBackslash = !inStringBackslash;
                    } else if (c === '"' && !inStringBackslash) {
                        isInString = false;
                        inStringBackslash = 0;
                        // console.log('Leaving string')
                        i++;
                    } else {
                        inStringBackslash = false;
                    }
                    continue;
                }
            }

            if (skipComments) {
                // Escape single-line comment?
                if (isInSingleLineComment) {
                    if (c === '\n') {
                        isInSingleLineComment = false;
                        // console.log('!!! Escaping single-line-comment')
                    }
                    continue;
                }

                // Escape multi-line comment?
                if (isInMultiLineComment) {
                    if (c === '*' && n === '/') {
                        isInMultiLineComment = false;
                        // console.log('!!! Escaping multi-line-comment')
                        i++;
                    }
                    continue;
                }
            }

            if (skipStringsAndCharacters) {
                // Detect char
                if (c === '\'') {
                    isInChar = true;
                    // console.log('!!! Entering char')
                    continue;
                }

                // Detect string
                if (c === '"') {
                    if (n !== '"') {
                        isInString = true;
                        // console.log('!!! entering string')
                    } else {
                        i++;
                        // console.log('!!! entering and exited string')
                    }
                    continue;
                }
            }

            if (skipComments) {
                // Enter single-line comment
                if (c === '/' && n === '/') {
                    isInSingleLineComment = true;
                    // console.log('!!! Entering single-line-comment')
                    i++;
                    continue;
                }

                // Enter multi-line comment
                if (c === '/' && n === '*') {
                    isInMultiLineComment = true;
                    // console.log('!!! Entering multi-line-comment')
                    i++;
                    continue;
                }
            }

            // console.log(`owo: ${c}`)
            if (chars.includes(c)) {
                if (jumpTo)
                    this.setIndex(jumpOver ? i + 1 : i);
                return [includeChar ? i + 1 : i, c];
            }
        }
        return [-1];
    }

    iterMatch(str, caseInsensitive = true, multiLine = true) {
        const toString = this.toString();
        const regex = new RegExp(str,
            (caseInsensitive ? 'i' : '') + (multiLine ? 'm' : '')
        );
        return toString.match(regex) !== null;
    }

    toString() {
        const curr = this.curr;
        let result = '';
        for (let i = curr; i < this.len; i++)
            result += this.peek(i - curr);
        return result;
    }

    // Set up the 'ignored' index-list
    init() {
        let isInString = false,
            isInChar = false,
            inStringBackslash = false,
            isInSingleLineComment = false,
            isInMultiLineComment = false;

        const len = this.len;
        const chars = this.chars;

        this.ignoredIndexes = [...Array(this.len)];
        for (let i = 0; i < len; i++) {
            this.ignoredIndexes[i] = 1;

            const p = i < 0 ? '\n' : chars[i - 1];
            const c = chars[i];
            const n = i < len - 1 ? chars[i + 1] : '\n';

            // console.log(`c: ${c}`)

            if (isInChar) {
                this.ignoredIndexes[i] = 3;
                if (n === '\'' && (c !== '\\' || (c === '\\' && p === '\\'))) {
                    isInChar = false;
                    i++;
                    this.ignoredIndexes[i] = 3;
                    // console.log('Leaving char')
                }
                continue;
            }

            if (isInString) {
                this.ignoredIndexes[i] = 2;
                // console.log(` inStringBackslash: ${inStringBackslash}`)
                if (c === '\\') {
                    inStringBackslash = !inStringBackslash;
                } else if (c === '"' && !inStringBackslash) {
                    isInString = false;
                    inStringBackslash = false;
                    // console.log('Leaving string')
                } else {
                    inStringBackslash = false;
                }
                continue;
            }

            // Escape single-line comment?
            if (isInSingleLineComment) {
                this.ignoredIndexes[i] = 4;
                if (c === '\n') {
                    isInSingleLineComment = false;
                    // console.log('Leaving single')
                }
                continue;
            }

            // Escape multi-line comment?
            if (isInMultiLineComment) {
                this.ignoredIndexes[i] = 5;
                if (c === '*' && n === '/') {
                    isInMultiLineComment = false;
                    // console.log('Leaving multi')
                    i++;
                    this.ignoredIndexes[i] = 5;
                }
                continue;
            }

            // Detect char
            if (c === '\'') {
                this.ignoredIndexes[i] = 3;
                isInChar = true;
                // console.log('Entering char')
                continue;
            }

            // Detect string
            if (c === '"') {
                this.ignoredIndexes[i] = 2;
                if (n !== '"') {
                    isInString = true;
                    // console.log('Entering string')
                } else {
                    // console.log('Entering and Exited string')
                    i++;
                    this.ignoredIndexes[i] = 2;
                }
                continue;
            }

            // Enter single-line comment
            if (c === '/' && n === '/') {
                // console.log('Entering single')
                isInSingleLineComment = true;
                this.ignoredIndexes[i] = 4;
                i++;
                this.ignoredIndexes[i] = 4;
                continue;
            }

            // Enter multi-line comment
            if (c === '/' && n === '*') {
                // console.log('Entering multi')
                isInMultiLineComment = true;
                this.ignoredIndexes[i] = 5;
                i++;
                this.ignoredIndexes[i] = 5;
                continue;
            }

            this.ignoredIndexes[i] = 0;
        }

        // for (let i = 0; i < len; i++) {
        //     console.log(`i: ${i}, c: ${this.chars[i]}, ignored: ${this.ignoredIndexes[i]}`)
        // }
    }

}