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

    skipAllBracketsUntilSemicolon(iter = null, recursive = false) {
        return this.skipAllBracketsUntilSemicolonBy(['(', '{', '['], iter, recursive);
    }

    skipAllBracketsUntilSemicolonBy(chars, iter = null, recursive = false) {
        iter = (iter === null ? this.iter : iter);

        const [ index, found ] =
                iter.indexOfMany(chars.concat([';']));
        console.log(`firstFound: ${found ?? -1}, index: ${index}`)
        if (index === -1)
            return false;
        if (found !== ';')
            this.skipUntilClosingChar(found, iter);
        else
            return found;
        if (recursive)
            return this.skipAllBracketsUntilSemicolonBy(chars, iter, true);
        return found;
    }

    skipAllBrackets(iter = null) {
        this.skipAllBracketsBy(['(', '{', '['], iter);
    }

    skipAllBracketsBy(find, iter = null, recursive = true) {
        iter = (iter === null ? this.iter : iter);

        const [ index, found ] = iter.indexOfMany(find);
        // console.log(`firstFound: ${index}, ${found}`)
        if (index === -1)
            return;

        this.skipUntilClosingChar(found, iter);
        if (recursive)
            this.skipAllBracketsBy(find, iter, true);
    }

    indexOfFirst(chars, iter = null) {
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
        for (let i = iter.curr; i < len; i++)
            if ((skipComments && iter.isIgnore(i)) ||
                    this.isWhitespace(iter.char()))
                iter.next();
            else break;
    }

    peekAlphaNumeric(iter = null) {
        return this.readAlphaNumeric(iter, true);
    }

    readAlphaNumeric(iter = null, isPeek = false) {
        iter = (iter === null ? this.iter : iter);
        this.skipWhitespace(iter);
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
     * Removes comments from the iterator.
     * This replaces all comment-characters (ignored indexes), with whitespaces.
     * We do this so that we can have a comment-free string, while keeping the original char indexes.
     * @param iter {Iterator}
     */
    removeComments(iter = null) {
        iter = (iter === null ? this.iter : iter);
        const chars = iter.chars;
        let output = '';
        for (let i = 0; i < iter.len; i++)
            output += iter.isIgnore(i) ? ' ' : chars[i];
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

    /** @type {{}} */
    regexCache = {};

    /**
     * All indexes where it's either inside:
     * 1. String
     * 2. Char
     * 3. Comment (single or multi)
     * @type string[]
     */
    ignoredIndexes;

    constructor(text) {
        this.text = text;
        this.chars = text.split('');
        this.len = text.length;
        this.curr = 0;
        this.init();
    }

    * iterate(skipComments = true) {
        const curr = this.curr;
        const chars = this.chars;
        for (let i = curr; i < this.len; i++) {
            if (skipComments && this.isWhat([IterInsideWhat.IN_COMMENT], i))
                yield ' ';
            else
                yield chars[i - curr];
        }
    }

    /**
     * Check whether the current index should be ignored,
     * AKA current char is inside a comment.
     */
    isIgnore(i = 0) {
        return this.isWhat([IterInsideWhat.IN_SINGLE, IterInsideWhat.IN_MULTI], i);
    }

    /**
     * iter.isWhat(IterInsideWhat.PURE)
     * iter.isWhat(IterInsideWhat.IN_STRING)
     * iter.isWhat(IterInsideWhat.IN_SINGLE)
     * @param check {[]|string}
     * @param i {int}
     * @returns {boolean}
     */
    isWhat(check, i = this.curr) {
        // Make single string usable
        if (typeof check === 'string')
            check = [check];
        // Check for all types of comments (single and multi)
        const index = check.indexOf(IterInsideWhat.IN_COMMENT);
        if (index >= 0) {
            check.splice(index, 1);
            if (!check.includes(IterInsideWhat.IN_SINGLE)) check.push(IterInsideWhat.IN_SINGLE);
            if (!check.includes(IterInsideWhat.IN_MULTI))  check.push(IterInsideWhat.IN_MULTI);
        }
        // Actually search
        const what = this.ignoredIndexes[i];
        return check.includes(what);
    }

    getIgnore(i = 0) {
        return this.ignoredIndexes[i];
    }

    skipIgnores() {
        const skip = [
            IterInsideWhat.IN_SINGLE,
            IterInsideWhat.IN_MULTI
        ];
        while (this.isWhat(skip, this.curr))
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

    isDone() {
        return this.curr >= this.len;
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

    indexOfFirst(find, startAt = this.curr, skipComments = true) {
        return this.indexOfMany(find, startAt, skipComments, true);
    }

    indexOfLast(find, startAt = this.len - 1, skipComments = true) {
        return this.indexOfMany(find, startAt, skipComments, false);
    }

    indexOfMany(find, startAt = this.curr, skipComments = true, forward = true) {
        if (typeof find === 'string')
            find = [find];
        const len = this.len;
        const chars = this.chars;
        // console.log(`indexOfMany(${find},    ${startAt},    ${skipComments}),
        //     len: ${len}, chars: '${chars.join('').trim().substring(startAt)}'`)
        const add = forward ? 1 : -1;
        for (let i = startAt; forward ? (i < len) : (i => 0); i += add) {
            // console.log(`indexOfMany, i: ${i}, char: ${chars[i]}`)
            if (skipComments && this.isIgnore(i))
                continue;
            else if (find.includes(chars[i])) {
                // console.log(`!!!`, i, chars[i])
                return [ i, chars[i] ];
            }
        }
        return [ -1, ];
    }

    findFirstOfMany(find,
                    includeChar = false,
                    jumpTo = false,
                    jumpOver = true,
                    startIndex = this.curr
    ) {
        if (typeof find === 'string')
            find = [find];
        const len = this.len;
        const chars = this.chars;
        const skip = [
            IterInsideWhat.IN_SINGLE, IterInsideWhat.IN_MULTI,
            IterInsideWhat.IN_STRING, IterInsideWhat.IN_CHAR
        ];
        for (let i = startIndex; i < len; i++) {
            if (this.isWhat(skip, i))
                continue;
            const c = chars[i];
            if (!find.includes(c))
                continue;
            if (jumpTo) this.setIndex(jumpOver ? i + 1 : i);
            return [includeChar ? i + 1 : i, c];
        }
        return [-1,];
    }

    iterMatch(str, caseInsensitive = true, multiLine = true) {
        const flags = (caseInsensitive ? 'i' : '') + (multiLine ? 'm' : '');
        const key = str + flags;
        const cache = this.regexCache;
        let regex;
        if (key in cache)
            regex = cache[key];
        else {
            regex = new RegExp(str, flags);
            cache[key] = regex;
        }
        const toString = this.toString();
        return toString.match(regex) !== null;
    }

    iterFind(str, caseInsensitive = true, multiLine = true) {
        const toString = this.toString();
        const regex = new RegExp(str,
            (caseInsensitive ? 'i' : '') + (multiLine ? 'm' : '')
        );
        return toString.match(regex);
    }

    toString() {
        const len = this.len;
        const chars = this.chars;
        let result = '';
        for (let i = this.curr; i < len; i++)
            result += chars[i];
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
                this.ignoredIndexes[i] = IterInsideWhat.IN_CHAR;
                if (n === '\'' && (c !== '\\' || (c === '\\' && p === '\\'))) {
                    isInChar = false;
                    i++;
                    this.ignoredIndexes[i] = IterInsideWhat.IN_CHAR;
                    // console.log('Leaving char')
                }
                continue;
            }

            if (isInString) {
                this.ignoredIndexes[i] = IterInsideWhat.IN_STRING;
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
                this.ignoredIndexes[i] = IterInsideWhat.IN_SINGLE;
                if (c === '\n') {
                    isInSingleLineComment = false;
                    // console.log('Leaving single')
                }
                continue;
            }

            // Escape multi-line comment?
            if (isInMultiLineComment) {
                this.ignoredIndexes[i] = IterInsideWhat.IN_MULTI;
                if (c === '*' && n === '/') {
                    isInMultiLineComment = false;
                    // console.log('Leaving multi')
                    i++;
                    this.ignoredIndexes[i] = IterInsideWhat.IN_MULTI;
                }
                continue;
            }

            // Detect char
            if (c === '\'') {
                this.ignoredIndexes[i] = IterInsideWhat.IN_CHAR;
                isInChar = true;
                // console.log('Entering char')
                continue;
            }

            // Detect string
            if (c === '"') {
                this.ignoredIndexes[i] = IterInsideWhat.IN_STRING;
                if (n !== '"') {
                    isInString = true;
                    // console.log('Entering string')
                } else {
                    // console.log('Entering and Exited string')
                    i++;
                    this.ignoredIndexes[i] = IterInsideWhat.IN_STRING;
                }
                continue;
            }

            // Enter single-line comment
            if (c === '/' && n === '/') {
                // console.log('Entering single')
                isInSingleLineComment = true;
                this.ignoredIndexes[i] = IterInsideWhat.IN_SINGLE;
                i++;
                this.ignoredIndexes[i] = IterInsideWhat.IN_SINGLE;
                continue;
            }

            // Enter multi-line comment
            if (c === '/' && n === '*') {
                // console.log('Entering multi')
                isInMultiLineComment = true;
                this.ignoredIndexes[i] = IterInsideWhat.IN_MULTI;
                i++;
                this.ignoredIndexes[i] = IterInsideWhat.IN_MULTI;
                continue;
            }

            this.ignoredIndexes[i] = IterInsideWhat.PURE;
        }

        // for (let i = 0; i < len; i++) {
        //     console.log(`i: ${i}, c: ${this.chars[i]}, ignored: ${this.ignoredIndexes[i]}`)
        // }
    }

    noComments(instance, index = 0, skipWhitespace = true) {
        const noComments = new Iterator(this.text.substring(index).trim());
        instance.removeComments(noComments);
        if (skipWhitespace)
            instance.skipWhitespace(noComments);
        return noComments;
    }

}
class IterInsideWhat {
    static PURE = 'pure';
    static IN_STRING = 'in_string';
    static IN_CHAR = 'in_char';
    static IN_SINGLE = 'in_single'; // IN_COMMENT
    static IN_MULTI = 'in_multi'; // IN_COMMENT
    static IN_COMMENT = 'in_comment';
}