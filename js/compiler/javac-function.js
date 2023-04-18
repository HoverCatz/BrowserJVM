class JavaFunctionReader extends JavacUtils {

    /** @type {{}} */
    clz;

    /** @type [] */
    topLevelClasses;

    constructor(clz, iter) {
        super(iter);
        this.clz = clz;
        console.log(`constructor(${this.text})`)
        console.log('')
    }

    parseFunctionCode(throwErrors = true) {
        const output = { stack: [] };
        try {
            const iter = this.iter;
            const text = iter.text;

            // while (iter.curr < iter.len) {
            for (let i = 0; i < 100; i++) {
                this.skipWhitespace(iter);

                const start = iter.index();
                let [ index, found ] =
                    this.indexOfFirst(['=', ';', '(', '{'], iter);
                if (index === -1) {
                    index = iter.len;
                    if (iter.curr == index)
                        break;
                    found = ';';
                }
                console.log(`index: ${index}, start: ${start}, found: ${found}`)

                if (found === '(') {
                    // while (iter.curr < iter.len) {
                    for (let i = 0; i < 100; i++) {
                        found = this.skipAllBracketsUntilSemicolonBy([found], iter);
                        if (!found) break;
                    }
                    [ index, found ] = this.indexOfFirst([';'], iter);
                    if (index === -1)
                        index = iter.len;
                    iter.setIndex(index + 1);
                    // console.log(`start: ${start}`)
                    // console.log(`index: ${index}`)
                    if (start == index)
                        continue;
                    const sub = text.substring(start, index).trim();
                    if (sub.length === 0)
                        break;
                    console.warn('A ' + sub)
                    console.log('')

                    output.stack.push(sub);
                    continue;
                }

                if (found === '=') {
                    // while (iter.curr < iter.len) {
                    for (let i = 0; i < 100; i++) {
                        found = this.skipAllBracketsUntilSemicolon(iter);
                        if (!found) break;
                    }
                    [ index, found ] = this.indexOfFirst([';'], iter);
                    if (index === -1)
                        index = iter.len;
                    // console.log(`! ${index} '${text.substring(start, index)}'`)
                    found = ';';
                }

                if (found === ';') {
                    iter.setIndex(index + 1);
                    if (start == index)
                        continue;
                    const sub = text.substring(start, index).trim();
                    if (sub.length === 0)
                        break;
                    const subIter = new Iterator(sub);
                    console.warn('B ' + sub)
                    console.log('')

                    const subIterNoComments = new Iterator(sub);
                    this.removeComments(subIterNoComments);
                    const isIfCheck = subIterNoComments.iterMatch('^if\\s*\\(', false) ?
                        'if' : (subIterNoComments.iterMatch('^else\\s*if\\s*\\(', false) ? 'else if' : (
                            subIterNoComments.iterMatch('^else\\s*', false) ? 'else' : false
                        ));
                    if (!!isIfCheck) {
                        console.log(`isIfCheck: ${isIfCheck}`)
                        const ifOutput = this.parseIfCheck(subIter, isIfCheck);
                        output.stack.push(ifOutput);
                        continue;
                    } else if (subIterNoComments.iterMatch('^for\\s*\\(', false)) {
                        const forOutput = this.parseForLoop(subIter);
                        output.stack.push(forOutput);
                        continue;
                    } else if (subIterNoComments.iterMatch('^while\\s*\\(', false)) {
                        const whileOutput = this.parseWhileLoop(subIter);
                        output.stack.push(whileOutput);
                        continue;
                    } else if (subIterNoComments.iterMatch('^try\\s*\\{', false) ||
                            subIterNoComments.iterMatch('^try\\s*\\(', false)) {
                        const tryOutput = this.parseTry(subIter);
                        output.stack.push(tryOutput);
                        continue;
                    } else if (subIterNoComments.iterMatch('^catch\\s*\\(', false)) {
                        const catchOutput = this.parseCatch(subIter);
                        output.stack.push(catchOutput);
                        continue;
                    } else if (subIterNoComments.iterMatch('^finally\\s*\\{', false)) {
                        const finallyOutput = this.parseFinally(subIter);
                        output.stack.push(finallyOutput);
                        continue;
                    }

                    output.stack.push(sub);
                    continue;
                } else if (found === '{') {
                    this.skipAllBracketsUntilSemicolonBy(['{'], iter);
                    this.skipWhitespace(iter);
                    if (iter.char() === '.') {
                        // We aren't done!
                        const [ index, b ] =
                            this.indexOfFirst([';'], iter);
                        if (index === -1) break;
                        iter.setIndex(index + 1);

                        const end = iter.index();
                        const sub = text.substring(start, end).trim();
                        const subIter = new Iterator(sub);
                        console.warn('A ' + sub)
                        console.log('')

                        const subIterNoComments = new Iterator(sub);
                        this.removeComments(subIterNoComments);
                        const isIfCheck = subIterNoComments.iterMatch('^if\\s*\\(', false) ?
                            'if' : (subIterNoComments.iterMatch('^else\\s*if\\s*\\(', false) ? 'else if' : (
                                subIterNoComments.iterMatch('^else\\s*', false) ? 'else' : false
                            ));
                        if (!!isIfCheck) {
                            console.log(`isIfCheck: ${isIfCheck}`)
                            const ifOutput = this.parseIfCheck(subIter, isIfCheck);
                            output.stack.push(ifOutput);
                            continue;
                        } else if (subIterNoComments.iterMatch('^for\\s*\\(', false)) {
                            const forOutput = this.parseForLoop(subIter);
                            output.stack.push(forOutput);
                            continue;
                        } else if (subIterNoComments.iterMatch('^while\\s*\\(', false)) {
                            const whileOutput = this.parseWhileLoop(subIter);
                            output.stack.push(whileOutput);
                            continue;
                        } else if (subIterNoComments.iterMatch('^try\\s*\\{', false) ||
                                subIterNoComments.iterMatch('^try\\s*\\(', false)) {
                            const tryOutput = this.parseTry(subIter);
                            output.stack.push(tryOutput);
                            continue;
                        } else if (subIterNoComments.iterMatch('^catch\\s*\\(', false)) {
                            const catchOutput = this.parseCatch(subIter);
                            output.stack.push(catchOutput);
                            continue;
                        } else if (subIterNoComments.iterMatch('^finally\\s*\\{', false)) {
                            const finallyOutput = this.parseFinally(subIter);
                            output.stack.push(finallyOutput);
                            continue;
                        }

                        output.stack.push(sub);
                        continue;
                    }
                    const end = iter.index();
                    const innerText = text.substring(start, end).trim();
                    const innerIter = new Iterator(innerText);
                    const innerIterNoComments = new Iterator(innerText);
                    this.removeComments(innerIterNoComments);
                    const isIfCheck = innerIterNoComments.iterMatch('^if\\s*\\(', false) ?
                        'if' : (innerIterNoComments.iterMatch('^else\\s*if\\s*\\(', false) ? 'else if' : (
                            innerIterNoComments.iterMatch('^else\\s*', false) ? 'else' : false
                        ));
                    if (innerText.startsWith('{') && innerText.endsWith('}')) {
                        innerIter.removeFirst(1);
                        innerIter.removeLast(1);
                    } else if (!!isIfCheck) {
                        console.log(`isIfCheck: ${isIfCheck}`)
                        const ifOutput = this.parseIfCheck(innerIter, isIfCheck);
                        output.stack.push(ifOutput);
                        continue;
                    } else if (innerIterNoComments.iterMatch('^for\\s*\\(', false)) {
                        const forOutput = this.parseForLoop(innerIter);
                        output.stack.push(forOutput);
                        continue;
                    } else if (innerIterNoComments.iterMatch('^while\\s*\\(', false)) {
                        const whileOutput = this.parseWhileLoop(innerIter);
                        output.stack.push(whileOutput);
                        continue;
                    } else if (innerIterNoComments.iterMatch('^try\\s*\\{', false) ||
                            innerIterNoComments.iterMatch('^try\\s*\\(', false)) {
                        const tryOutput = this.parseTry(innerIter);
                        output.stack.push(tryOutput);
                        continue;
                    } else if (innerIterNoComments.iterMatch('^catch\\s*\\(', false)) {
                        const catchOutput = this.parseCatch(innerIter);
                        output.stack.push(catchOutput);
                        continue;
                    } else if (innerIterNoComments.iterMatch('^finally\\s*\\{', false)) {
                        const finallyOutput = this.parseFinally(innerIter);
                        output.stack.push(finallyOutput);
                        continue;
                    }
                    if (innerIter.text.trim().length === 0)
                        continue;
                    if (text.trim() === innerIter.text.trim()) {
                        output.error = 'Infinite loop detected due to not correctly parsing text.';
                        output.text = text;
                        return output;
                    }
                    // console.warn('C ' + innerText)
                    // console.log('')
                    const innerParse = new JavaFunctionReader(this.clz, innerIter);
                    const innerOutput = innerParse.parseFunctionCode();
                    output.stack.push(innerOutput);
                    continue;
                }
                throw new Error(`Invalid character found: '${found}' at index ${index}`);

            }

        } catch (e) {
            console.error('Error:')
            console.error(e)
            output.error = e;
        }
        return output;
    }

    /**
     * Parse if check
     * @param iter {Iterator}
     * @param which {string} 'if', 'else if', 'else'
     * @return {{}}
     */
    parseIfCheck(iter, which) {
        let text = iter.text;
        console.log(`parseIfCheck(${text}, ${which})`)

        let ifHeader = '';
        let ifData = '';

        const start = iter.index();

        // const start = iter.index();
        if (which === 'else') {
            if (!iter.iterMatch('^else\\s*', false)) return {
                error: 'Invalid `else` statement.',
                text: text
            };
            iter.removeFirst(4); // Remove 'else'
            iter.init();
            text = iter.text;
            this.skipWhitespace(iter); // Remove whitespace
            ifHeader = '';
            ifData = text.substring(iter.index());
        } else {
            let [ openIndex, found ] =
                this.indexOfFirst(['('], iter);
            if (openIndex === -1) return {
                error: 'Open-index for character `(` not found.'
            };

            this.skipAllBracketsUntilSemicolonBy(['('], iter);
            const end = iter.index();

            ifHeader = text.substring(openIndex, end).trim();
            ifData = text.substring(end).trim();
        }
        console.log(`ifHeader: ${ifHeader}`)
        console.log(`ifData: ${ifData}`)

        const ifIter = new Iterator(ifData);
        if (ifData.startsWith('{') && ifData.endsWith('}')) {
            ifIter.removeFirst(1);
            ifIter.removeLast(1);
            ifIter.init();
        }
        const ifParse = new JavaFunctionReader(this.clz, ifIter);
        const ifParsedData = ifParse.parseFunctionCode();

        const output = {
            type: which,
            header: ifHeader,
            data: ifParsedData
        };
        return output;
    }

    /**
     * Parse for loop
     * @param iter {Iterator}
     * @return {{}}
     */
    parseForLoop(iter) {
        const text = iter.text;
        console.log(`parseForLoop(${text})`)

        const [ openIndex, found ] = this.indexOfFirst(['('], iter);
        if (openIndex === -1) return {
            error: 'Open-index for character `(` not found.'
        };

        // const start = iter.index();
        this.skipAllBracketsUntilSemicolonBy(['('], iter);
        const end = iter.index();

        const forHeader = text.substring(openIndex, end).trim();
        const forData = text.substring(end).trim();
        console.log(`forHeader: ${forHeader}`)
        console.log(`forData: ${forData}`)

        const forIter = new Iterator(forData);
        if (forData.startsWith('{') && forData.endsWith('}')) {
            forIter.removeFirst(1);
            forIter.removeLast(1);
            forIter.init();
        }
        const forParse = new JavaFunctionReader(this.clz, forIter);
        const forParsedData = forParse.parseFunctionCode();

        const output = {
            type: 'for',
            header: forHeader,
            data: forParsedData
        };
        return output;
    }

    /**
     * Parse while loop
     * @param iter {Iterator}
     * @return {{}}
     */
    parseWhileLoop(iter) {
        const text = iter.text;
        console.log(`parseWhileLoop(${text})`)

        const [ openIndex, found ] = this.indexOfFirst(['('], iter);
        if (openIndex === -1) return {
            error: 'Open-index for character `(` not found.'
        };

        // const start = iter.index();
        this.skipAllBracketsUntilSemicolonBy(['('], iter);
        const end = iter.index();

        const whileHeader = text.substring(openIndex, end).trim();
        const whileData = text.substring(end).trim();
        console.log(`whileHeader: ${whileHeader}`)
        console.log(`whileData: ${whileData}`)

        const whileIter = new Iterator(whileData);

        if (whileData.startsWith('{') && whileData.endsWith('}')) {
            whileIter.removeFirst(1);
            whileIter.removeLast(1);
            whileIter.init();
        }

        const whileParse = new JavaFunctionReader(this.clz, whileIter);
        const whileParsedData = whileParse.parseFunctionCode();

        const output = {
            type: 'while',
            header: whileHeader,
            data: whileParsedData
        };
        return output;
    }

    /**
     * Parse Try
     * @param iter {Iterator}
     * @return {{}}
     */
    parseTry(iter) {
        const text = iter.text;
        console.log(`parseTry(${text})`)

        // const start = iter.index();
        let [ openIndex, found ] =
            this.indexOfFirst(['('], iter);
        let [ openIndex2, found2 ] =
            this.indexOfFirst(['{'], iter);
        let end = -1;
        if (openIndex !== -1 && openIndex < openIndex2) {
            // try-open-resource found!
            openIndex2 = openIndex;
            this.skipAllBracketsUntilSemicolonBy(['('], iter);
            end = iter.index();
        } else {
            end = openIndex2;
        }
        if (end === -1) return {
            error: 'Didn\'t find character {. c',
            text: text
        };

        const tryHeader = text.substring(openIndex2, end).trim();
        const tryData = text.substring(end).trim();
        console.log(`tryHeader: ${tryHeader}`)
        console.log(`tryData: ${tryData}`)

        const tryIter = new Iterator(tryData);

        if (tryData.startsWith('{') && tryData.endsWith('}')) {
            tryIter.removeFirst(1);
            tryIter.removeLast(1);
            tryIter.init();
        }

        const tryParse = new JavaFunctionReader(this.clz, tryIter);
        const tryParsedData = tryParse.parseFunctionCode();

        const output = {
            type: 'try',
            header: tryHeader,
            data: tryParsedData
        };
        return output;
    }

    /**
     * Parse Catch
     * @param iter {Iterator}
     * @return {{}}
     */
    parseCatch(iter) {
        const text = iter.text;
        console.log(`parseCatch(${text})`)

        // const start = iter.index();
        let [ openIndex, found ] =
            this.indexOfFirst(['('], iter);
        if (openIndex !== -1)
            // try-open-resource found!
            this.skipAllBracketsUntilSemicolonBy(['('], iter);

        const catchHeader = text.substring(openIndex, iter.index()).trim();

        [ openIndex, found ] = this.indexOfFirst(['{'], iter);
        const end = found === '{' ? openIndex - 1 : -1;
        if (end === -1) return {
            error: 'Didn\'t find character {. a',
            text: text
        };

        const catchData = text.substring(end).trim();
        console.log(`catchHeader: ${catchHeader}`)
        console.log(`catchData: ${catchData}`)

        const catchIter = new Iterator(catchData);

        if (catchData.startsWith('{') && catchData.endsWith('}')) {
            catchIter.removeFirst(1);
            catchIter.removeLast(1);
            catchIter.init();
        }

        const catchParse = new JavaFunctionReader(this.clz, catchIter);
        const catchParsedData = catchParse.parseFunctionCode();

        const output = {
            type: 'catch',
            header: catchHeader,
            data: catchParsedData
        };
        return output;
    }

    /**
     * Parse Finally
     * @param iter {Iterator}
     * @return {{}}
     */
    parseFinally(iter) {
        const text = iter.text;
        console.log(`parseFinally(${text})`)

        // const start = iter.index();
        let [ openIndex, found ] = this.indexOfFirst(['{'], iter);
        const end = found === '{' ? openIndex - 1 : -1;
        if (end === -1) return {
            error: 'Didn\'t find character {. b',
            text: text
        };

        const finallyHeader = text.substring(openIndex, end).trim();
        const finallyData = text.substring(end).trim();
        console.log(`finallyHeader: ${finallyHeader}`)
        console.log(`finallyData: ${finallyData}`)

        const finallyIter = new Iterator(finallyData);

        if (finallyData.startsWith('{') && finallyData.endsWith('}')) {
            finallyIter.removeFirst(1);
            finallyIter.removeLast(1);
            finallyIter.init();
        }

        const finallyParse = new JavaFunctionReader(this.clz, finallyIter);
        const finallyParsedData = finallyParse.parseFunctionCode();

        const output = {
            type: 'finally',
            header: finallyHeader,
            data: finallyParsedData
        };
        return output;
    }

}