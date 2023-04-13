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

            // while (true) {
            for (let i = 0; i < 100; i++) {
                this.skipWhitespace(iter);

                const start = iter.index();
                const [ index, found ] =
                    this.indexOfFirst([';', '{'], iter, i === 1);
                if (index === -1) break;
                // console.log(`index: ${index}, start: ${start}, found: ${found}`)

                if (found === ';') {
                    iter.setIndex(index + 1);
                    console.warn('A ' + text.substring(start, index))
                    console.log('')
                    output.stack.push(text.substring(start, index));
                    continue;
                } else if (found === '{') {
                    this.skipAllBracketsUntilSemicolonBy(['{'], iter);
                    const end = iter.index();
                    const innerText = text.substring(start, end).trim();
                    const innerIter = new Iterator(innerText);
                    const innerIterNoComments = new Iterator(innerText);
                    this.removeComments(innerIterNoComments);
                    if (innerText.startsWith('{') && innerText.endsWith('}')) {
                        innerIter.removeFirst(1);
                        innerIter.removeLast(1);
                    } else if (innerIterNoComments.iterMatch('^if\\s+\\(', false)) {
                        const ifOutput = this.parseIfCheck(innerIter);
                        output.stack.push(ifOutput);
                        continue;
                    } else if (innerIterNoComments.iterMatch('^for\\s+\\(', false)) {
                        const forOutput = this.parseForLoop(innerIter);
                        output.stack.push(forOutput);
                        continue;
                    } else if (innerIterNoComments.iterMatch('^while\\s+\\(', false)) {
                        const whileOutput = this.parseWhileLoop(innerIter);
                        output.stack.push(whileOutput);
                        continue;
                    }
                    if (innerIter.text.trim().length === 0)
                        continue;
                    // console.warn('B ' + innerText)
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
     * @return {{}}
     */
    parseIfCheck(iter) {
        const text = iter.text;
        console.log(`parseIfCheck(${text})`)

        const [ openIndex, found ] = this.indexOfFirst(['('], iter);
        if (openIndex === -1) return {
            error: 'Open-index for character `(` not found.'
        };

        // const start = iter.index();
        this.skipAllBracketsUntilSemicolonBy(['('], iter);
        const end = iter.index();

        const ifHeader = text.substring(openIndex, end).trim();
        const ifData = text.substring(end).trim();
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
            type: 'if',
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

        const start = iter.index();
        this.skipAllBracketsUntilSemicolonBy(['('], iter);
        const end = iter.index();
        iter.setIndex(end + 1);

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

        const start = iter.index();
        this.skipAllBracketsUntilSemicolonBy(['('], iter);
        const end = iter.index();
        iter.setIndex(end + 1);

        const whileHeader = text.substring(openIndex, end).trim();
        const whileData = text.substring(end).trim();
        console.log(`forHeader: ${whileHeader}`)
        console.log(`forData: ${whileData}`)

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

}