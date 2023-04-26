class JavaFunctionReader extends JavacUtils {

    /** @type {{}} */
    info;

    /** @type [] */
    topLevelClasses;

    /** @type boolean */
    throwErrors;

    constructor(info, iter, throwErrors = true) {
        super(iter);
        this.info = info;
        this.throwErrors = throwErrors;
        console.log(`constructor(${this.text})`)
        console.log('')
    }

    static debugMode = false;
    static maxTries = 500;
    static currentTry = 0;

    parseFunctionCode(stopAfterFirst = false) {
        if (JavaFunctionReader.debugMode && ++JavaFunctionReader.currentTry >= JavaFunctionReader.maxTries)
            return { 'error': 'Too many tries (debug)' };
        // if (stopAfterFirst) console.log('stopAfterFirst')
        const output = { stack: [] };
        try {
            const iter = this.iter;

            let n = 0;
            // while (iter.curr < iter.len) {
            for (let i = 0; i < 10; i++) {
                this.skipWhitespace(iter);
                if (iter.isDone()) break;

                const start = iter.index();
                const [indexEnd, sub] = this.readOneStatement(iter.toString());
                iter.setIndex(start + indexEnd);

                // console.log(`! ADD: '${JSON.stringify(sub, null, 4)}'`)
                output.stack.push(sub);

                // We only want to parse one
                if (++n === 1 && stopAfterFirst)
                    break;
            }

        } catch (e) {
            console.error('Error:')
            console.error(e)
            output.error = e;
        }
        return output;
    }

    readOneStatement(text) {
        const iter = new Iterator(text);
        const nocc = iter.noComments(this);

        // Start index
        let start = nocc.index();

        let found;
        const output = {};

        // Find label
        found = nocc.iterFind('^\\s*(?<label>[a-zA-Z_][a-zA-Z0-9_]*)\\s*(?<colon>\\:)(?<end>)', false, false);
        if (!!found) {
            // Found label
            nocc.next(found[0].length);
            this.skipWhitespace(nocc);

            const sub = nocc.text.substring(start, found[1].length);
            console.log(`!!! LABEL: '${sub}'`)
            console.log(`!!! LABEL found: '`, found, `'`)

            output.label = found.groups.label;
            console.log(`SUB: '${nocc.toString()}'`)
        }

        // Find open bracket
        found = nocc.iterFind('^\\s*(?<open>\\{)', false, false);
        if (!!found) {
            // Found open curly bracket
            const _start = nocc.index();
            nocc.next(found.index);
            this.skipWhitespace(nocc);

            // Search closing curly bracket
            this.skipAllBracketsBy(['{'], nocc, false);

            // Remove open and closing curly bracket
            const sub = nocc.text.substring(_start + found.index + 1, nocc.index() - 1);

            // Re-parse new inner function code
            const func = new JavaFunctionReader(
                this.info,
                new Iterator(sub),
                this.throwErrors
            );
            const res = {...output, ...func.parseFunctionCode()}; // concat

            return [nocc.index(), res];
        }
        // No curly bracket.

        // Detect what comes next
        const which = this.detectWhich(nocc);
        console.log(`Found which: '${which}'`)

        let foundSemicolon = false;
        if (which === false ||
                which == FuncWhich.RETURN ||
                which == FuncWhich.NEW) {
            // Simple statement
            // Find first of `=` `;` `(` `{`
            // while (true) {
            for (let i = 0; i < 100; i++) {
                let [ indexFound, foundWhat ] = nocc.findFirstOfMany(['=', ';', '[', '(', '{']);
                console.log(`${indexFound}, ${foundWhat}`)
                if (indexFound === -1) break;

                // We found a field or variable assignment, continue searching
                while (foundWhat === '=') {
                    [ indexFound, foundWhat ] = nocc.findFirstOfMany(
                        ['=', ';', '[', '(', '{'], false, false, true,
                        indexFound + 1
                    );
                    // console.log(`${indexFound}, ${foundWhat}`)
                    if (indexFound === -1) break;
                }

                // Skip any ({ brackets
                if (foundWhat === '[' || foundWhat === '(' || foundWhat === '{') {
                    this.skipAllBracketsBy([foundWhat], nocc, false);
                    continue;
                }

                // We found the end?
                if (foundWhat === ';') {
                    nocc.setIndex(indexFound + 1);
                    foundSemicolon = true;
                    break;
                }
            }

            // Use start-end index
            const sub = nocc.text.substring(start, nocc.index() - (foundSemicolon ? 1 : 0));
            // console.log(sub);

            output.type = 'simple_statement';
            output.value = sub;
        } else if (which === FuncWhich.IF ||
                   which === FuncWhich.ELSE_IF ||
                   which === FuncWhich.ELSE) {

            let header = '';
            // console.log(`! if-check found: '${which}'`)

            let [ index, found ] = nocc.indexOfMany(['(']);
            if (which !== FuncWhich.ELSE) { // We expect one parenthesis{
                this.skipAllBracketsBy(['('], nocc, false);
                header = nocc.text.substring(index, nocc.index());
                // console.log(`! if-check header: '${header}'`)
            } else {
                [ index, found ] = nocc.indexOfMany(['{']);
                if (index === -1) {
                    this.skipWhitespace(nocc);
                    nocc.next(4);
                    this.skipWhitespace(nocc);
                }
                else
                    nocc.setIndex(index)
            }

            const nextText = nocc.text.substring(nocc.index());
            // console.log(`! if-check nextText: '`, nextText, `'`)
            const func = new JavaFunctionReader(
                this.info,
                new Iterator(nextText),
                false
            );
            const res = func.parseFunctionCode(true);
            // console.log(`! if-check output: '`, res, `'`)
            // console.log(`! if-check end-index: ${func.iter.index()}`)
            nocc.setIndex(nocc.index() + func.iter.index())

            output.type = which;
            output.header = header;
            output.data = res;
        } else if (which === FuncWhich.FOR_LOOP) {

            let header = '';
            // console.log(`! for-loop found`)

            const [ index, ] = nocc.indexOfMany(['(']);
            if (index === -1) {
                output.error = 'Couldn\'t find character `(`.';
                output.text = text;
                return [nocc.index(), output];
            }

            this.skipAllBracketsBy(['('], nocc, false);
            header = nocc.text.substring(index, nocc.index());
            // console.log(`! for-loop header: '${header}'`)

            const nextText = nocc.text.substring(nocc.index());
            // console.log(`! for-loop nextText: '`, nextText, `'`)
            const func = new JavaFunctionReader(
                this.info,
                new Iterator(nextText),
                false
            );
            const res = func.parseFunctionCode(true);
            // console.log(`! for-loop output: '`, res, `'`)
            // console.log(`! for-loop end-index: ${func.iter.index()}`)
            nocc.setIndex(nocc.index() + func.iter.index())

            output.type = which;
            output.header = header;
            output.data = res;
        } else if (which === FuncWhich.WHILE_LOOP) {

            let header = '';
            // console.log(`! while-loop found`)

            const [ index, ] = nocc.indexOfMany(['(']);
            if (index === -1) {
                output.error = 'Couldn\'t find character `(`.';
                output.text = text;
                return [nocc.index(), output];
            }

            this.skipAllBracketsBy(['('], nocc, false);
            header = nocc.text.substring(index, nocc.index());
            // console.log(`! while-loop header: '${header}'`)

            const nextText = nocc.text.substring(nocc.index());
            // console.log(`! while-loop nextText: '`, nextText, `'`)
            const func = new JavaFunctionReader(
                this.info,
                new Iterator(nextText),
                false
            );
            const res = func.parseFunctionCode(true);
            // console.log(`! while-loop output: '`, res, `'`)
            // console.log(`! while-loop end-index: ${func.iter.index()}`)
            nocc.setIndex(nocc.index() + func.iter.index())

            output.type = which;
            output.header = header;
            output.data = res;
        } else if (which === FuncWhich.TRY) {

            let header = '';
            // console.log(`! try found`)

            let [ index, found ] = nocc.indexOfMany(['(', '{']);
            if (found === '(') { // We can expect one parenthesis
                this.skipAllBracketsBy(['('], nocc, false);
                header = nocc.text.substring(index, nocc.index());
                // console.log(`! try header: '${header}'`)
            }
            else {
                [ index, found ] = nocc.indexOfMany(['{']);
                nocc.setIndex(index);
            }
            if (index === -1) {
                output.error = 'Couldn\'t find character `{`.';
                output.text = nocc.toString();
                return [nocc.index(), output];
            }

            const nextText = nocc.text.substring(nocc.index());
            // console.log(`! try nextText: '`, nextText, `'`)
            const func = new JavaFunctionReader(
                this.info,
                new Iterator(nextText),
                false
            );
            const res = func.parseFunctionCode(true);
            // console.log(`! try output: '`, JSON.stringify(res, null, 4), `'`)
            // console.log(`! try end-index: ${func.iter.index()}`)
            nocc.setIndex(nocc.index() + func.iter.index())

            output.type = which;
            output.header = header;
            output.data = res;
        } else if (which === FuncWhich.TRY_CATCH) {

            let header = '';
            // console.log(`! try_catch found`)

            let [ index, ] = nocc.indexOfMany(['(']);
            if (index === -1) {
                output.error = 'Couldn\'t find character `(`.';
                output.text = nocc.toString();
                return [nocc.index(), output];
            }

            this.skipAllBracketsBy(['('], nocc, false);
            header = nocc.text.substring(index, nocc.index());
            // console.log(`! try_catch header: '${header}'`);

            const nextText = nocc.text.substring(nocc.index());
            // console.log(`! try_catch nextText: '`, nextText, `'`)
            const func = new JavaFunctionReader(
                this.info,
                new Iterator(nextText),
                false
            );
            const res = func.parseFunctionCode(true);
            // console.log(`! try_catch output: '`, JSON.stringify(res, null, 4), `'`)
            // console.log(`! try_catch end-index: ${func.iter.index()}`)
            nocc.setIndex(nocc.index() + func.iter.index())

            output.type = which;
            output.header = header;
            output.data = res;
        } else if (which === FuncWhich.TRY_FINALLY) {

            let header = '';
            // console.log(`! try_finally found`)

            const [ index, ] = nocc.indexOfMany(['{']);
            if (index === -1) {
                output.error = 'Couldn\'t find character `{`.';
                output.text = nocc.toString();
                return [nocc.index(), output];
            }
            nocc.setIndex(index);

            const nextText = nocc.text.substring(nocc.index());
            // console.log(`! try_finally nextText: '`, nextText, `'`)
            const func = new JavaFunctionReader(
                this.info,
                new Iterator(nextText),
                false
            );
            const res = func.parseFunctionCode(true);
            // console.log(`! try_finally output: '`, JSON.stringify(res, null, 4), `'`)
            // console.log(`! try_finally end-index: ${func.iter.index()}`)
            nocc.setIndex(nocc.index() + func.iter.index())

            output.type = which;
            output.header = header;
            output.data = res;
        } else {
            console.log(`### WHAT IS THIS : ${which}`)
        }

        // Could be a single statement:
        //      < println("hello world"); >                 // ( ;
        //      < int owo; >                                // = ;
        //      < int owo = 3; >                            // = ;
        //      < int owo = test("uwu"); >                  // = ( ;
        //      < int owo = test("uwu") ? 420 : 240; >      // = ( ;
        //      <
        //        int owo = new String("") {                // = ( {
        //          @Override
        //          public String toString() {              // ( { (ignored)
        //              return "owo";                       // ;   (ignored)
        //          }
        //        }.hashCode();                             // ( ;
        //      >
        // Could also be an if statement, or a loop:
        //      < if (true) >           ;                   // if (
        //      < if (true) >           { }                 // if (
        //      < for (a; b; c) >       ;                   // for (
        //      < for (a; b; c) >       { }                 // for (
        //      < while (true) >        ;                   // while (
        //      < while (true) >        { }                 // while (
        //      < do >                  ; while (true);     // do ;
        //      < do >                  { } while (true);

        return [nocc.index(), output];
    }

    detectWhich(iter) {
        iter.skipIgnores();
        const isIfCheck = iter.iterMatch('^if\\s*\\(', false) ? FuncWhich.IF :
            (iter.iterMatch('^else\\s*if\\s*\\(', false)                    ? FuncWhich.ELSE_IF : (
                iter.iterMatch('^else\\s*', false)                          ? FuncWhich.ELSE : false
            ));
        if (!!isIfCheck)
            return isIfCheck;
        else if (iter.iterMatch('^for\\s*\\(', false))
            return FuncWhich.FOR_LOOP;
        else if (iter.iterMatch('^while\\s*\\(', false))
            return FuncWhich.WHILE_LOOP;
        else if (iter.iterMatch('^try\\s*\\{', false) ||
                 iter.iterMatch('^try\\s*\\(', false))
            return FuncWhich.TRY;
        else if (iter.iterMatch('^catch\\s*\\(', false))
            return FuncWhich.TRY_CATCH;
        else if (iter.iterMatch('^finally\\s*\\{', false))
            return FuncWhich.TRY_FINALLY;
        else if (iter.iterMatch('^return\\s*', false))
            return FuncWhich.RETURN;
        else if (iter.iterMatch('^new\\s*[a-zA-Z_$]', false))
            return FuncWhich.NEW;
        return false;
    }

}

class FuncWhich {
    static IF = 'if';
    static ELSE_IF = 'else_if';
    static ELSE = 'else';
    static FOR_LOOP = 'for_loop';
    static WHILE_LOOP = 'while_loop';
    static TRY = 'try';
    static TRY_CATCH = 'try_catch';
    static TRY_FINALLY = 'try_finally';
    static RETURN = 'return';
    static NEW = 'new';
    static isIf(which) {
        return which === FuncWhich.IF || which === FuncWhich.ELSE_IF || which === FuncWhich.ELSE;
    }
    static isTry(which) {
        return which === FuncWhich.TRY || which === FuncWhich.TRY_CATCH || which === FuncWhich.TRY_FINALLY;
    }
}