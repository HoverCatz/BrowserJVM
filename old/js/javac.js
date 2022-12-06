let javaSourceCode = `
    package obzcu.re.testing;
    
    // Comment
        /* Multi-line
           comment */
    /** Yet another comment! */
    //import obzcu.re.testing.Test;
    
    public class Test  /*
        extends TestExtend */{
        static int abc = /* test comment */ 3;
        public String test = "   Hello    world ;)   ";
        public static void main(String[] args)
        {
    //        System.out.println(/* test comment */ "/* hi */Hello world! " + /* test comment */ abc);
        }
        void testCalls()
        {
            System.out.println("Hello world");
        }
        /*
        public void heyhey() { byebye(); }
        static void byebye() { test(); }
        void test() {
            abc = 6;
        }
        void testLoop() {
            for (int i = 0; i < 10; i++) {
                for (int i = 0; i < 10; i++) {
                    owo 1;
                    if (i == 69) {
                        return;
                    }
                    do {
                        owo 4;
                        for (owo 5; owo 6; owo 7) {
                            owo 8;
                            owo = 9 + owo + 10;
                        }
                    } while (true);
                }
                owo;
                for (int i = 0; i < 10; i++) {
                    owo 2;
                    while (true) {
                        owo 3;
                    }
                }
            }
        }
        void testIf() {
            if (123) {
                a;
                ab;
                abc;
                if (456) {
                    b;
                    bc;
                    bcd;
                }
                k;
                kl;
                klm;
            }
            if (789) {
                c;
                for (cc; cc < 10; cc++) {
                    ccc;
                }
            }
            d;
        }
        */
    }
`;

// fetch("String.java").then(async response =>
// {
//     const text = await response.text();
//     processSourceCode(text);
// });

const iter = function (arr) {
    let cur = -1;
    arr.next = (function () { return (++cur >= this.length) ? false : this[cur]; });
    arr.peekNext = (function () { return ((cur + 1) >= this.length) ? false : this[cur + 1] });
    arr.peekNextNext = (function () { return ((cur + 2) >= this.length) ? false : this[cur + 2] });
    arr.peekNextN = (function (n) { return ((cur + n) >= this.length) ? false : this[cur + n] });
    arr.prev = (function () { return (--cur < 0) ? false : this[cur]; });
    arr.peekPrev = (function () { return (cur - 1) < 0 ? false : this[cur - 1] });
    arr.peekPrevPrev = (function () { return (cur - 2) < 0 ? false : this[cur - 2] });
    arr.peekPrevN = (function (n) { return (cur - n) < 0 ? false : this[cur - n] });
    arr.index = (function() { return cur; });
    arr.len = (function() { return this.length; });
    return arr;
};
const JavaClass = function (pkg, className, access, ownerClass, extend, implement) {
    const clazz = [ ];
    clazz.package = pkg;
    clazz.className = className;
    clazz.extend = extend;
    clazz.implement = implement;
    clazz.access = access;
    clazz.ownerClass = ownerClass;
    clazz.fields = { };
    clazz.functions = { };
    clazz.curlyCount = 0;
    clazz.imports = [ ];
    clazz.findFunction = (function(find) {
        for (const i in this.functions) {
            const func = this.functions[i];
            if (func.functionName === find) {
                return func;
            }
        }
        // TODO: Recursive search through all superClasses
        return null;
    });
    clazz.findField = (function(find) {
        for (const i in this.fields) {
            const field = this.fields[i];
            if (field.fieldName === find) {
                return field;
            }
        }
        return null;
    });
    return clazz;
};
const JavaFunction = function (annotations, access, retType, functionName, args, ownerClass) {
    const func = [ ];
    func.annotations = annotations;
    func.access = access;
    func.retType = retType;
    func.functionName = functionName;
    func.arguments = args;
    func.ownerClass = ownerClass;
    func.instructions = [ ];
    func.curlyCount = 0;
    func.print = function () { return (annotations + " " + access.join(' ')).trim() + " " + retType + " " + functionName + " (" + args + ")" }
    return func;
};
const JavaField = function (fieldName, access, type, ownerClass, value) {
    const field = [ ];
    field.fieldName = fieldName;
    field.access = access;
    field.type = type;
    field.ownerClass = ownerClass;
    field.value = value;
    return field;
};
const defaultSuperClass = 'java.lang.Object';
const accessModifiers = [ "public", "private", "protected", "static", "final", "native", "abstract", "transient", "volatile", "synchronized" ];
const returnTypes = [ "void", "String", "int" ]; // TODO: Add more
let clazzes;

/*
const clazzes = processSourceCode(javaSourceCode);
processClasses(clazzes);

const clz = findClass('obzcu.re.testing.Test');
console.log(clz);
const fTest = clz.findField('test');
const fAbc = clz.findField('abc');
console.log(fTest.value);
console.log(fAbc.value);
const funcTest = clz.findFunction('testCalls');
console.log(funcTest);
*/

async function doStuff()
{
    await fetch("java.7.indexes.json").then(async response =>
    {
        const text = await response.text();
        console.time('json_load');
        const json = JSON.parse(text);
        console.timeEnd('json_load');

        const classes = json["classes"];
        const classesPackages = json["classesPackages"];
        const pkgQuick = json["pkgQuick"];

        const findClass = 'String';
        const pkgs = classesPackages[findClass];
        console.log('Finding full class by only name: `' + findClass + '`');
        if (typeof pkgs === 'object') {
            for (let i in pkgs) {
                let pkg = pkgs[i];
                if (typeof pkg === 'string')
                    console.log(findClassByName(pkg + '.' + findClass));
                else if (typeof pkg === 'number')
                    console.log(findClassByName(pkgQuick[pkg] + '.' + findClass));
            }
        } else {
            if (typeof pkgs === 'string')
                console.log(findClassByName(pkgs + '.' + findClass));
            else if (typeof pkgs === 'number')
                console.log(findClassByName(pkgQuick[pkgs] + '.' + findClass));
        }

        function findClassByName(name) {
            if (!name.includes('.'))
                return classes[name];
            const split = name.split('.');
            if (split.length === 1)
                return classes[split[0]];
            let i = 1, part = classes[split[0]];
            for (; i < split.length - 1; i++)
                part = part[split[i]];
            return part[split[i]];
        }
    });
    await fetch("testing/src/Test.java").then(async response =>
    {
        const text = await response.text();
        clazzes = processSourceCode(text);
        processClasses(clazzes);
    });
}
doStuff().then();

function findClass(find) {
    for (const i in clazzes) {
        const clazz = clazzes[i];
        if (clazz.package !== '' && (clazz.package + '.' + clazz.className) === find)
            return clazz;
        else if (clazz.package === '' && clazz.className === find)
            return clazz;
    }
    return null;
}

function fetchFunctionBlock(data) {
//    console.log('after: !' + after + '!');
    let curlyIndex = 1, charIndex = 0;
    for (charIndex in data) {
        const c = data[charIndex];
        if (/\s/g.test(c)) continue;
//        console.log('[' + charIndex + '] c: ' + c);
        if (c === '{') curlyIndex++;
        else if (c === '}') {
            curlyIndex--;
            if (curlyIndex === 0)
                break;
        }
    }
    const blockData = data.substring(0, charIndex).trim();
//    console.log("blockData: '" + blockData + "'");
    return [ charIndex, blockData ];
}

function findFirst(text, findArr = []) {
    if (findArr.length === 0) return [ -1, '' ];
    const chars = iter(text.split(''));
    const textLen = text.length;
    while (true)
    {
        const c = chars.next();
        if (!c) break;
        const index = chars.index();
outer:  for (const i in findArr)
        {
            const find = findArr[i];
            const flen = find.length;
            if (flen === 0 || flen > textLen)
                continue;
            if (flen === 1 && c === find)
                return [ index, find ];
            if (c !== find.charAt(0) || !chars.peekNextN(flen - 1))
                continue;
            for (let n = 1; n < flen; n++)
            {
                const peekN = chars.peekNextN(n);
                if (!peekN)
                    continue outer;
                const findN = find.charAt(n);
                if (peekN !== findN)
                    continue outer;
            }
            return [ index, find ];
        }
    }
    return [ -1, '' ];
}

function parseFunctionBlock(sub, after, elem)
{
    const [ i, blockData ] = fetchFunctionBlock(after);
//    console.log("blockData: '" + blockData + "'");

    const child = [];
    const data = blockData.trim();
    parseFunctionData(data, child);
    elem.push({key: sub, values: child});

    return i; // End of block (start of next block if any)
}

function parseFunctionData(data, elem = [])
{
//    console.log('');
    while (true)
    {
        let [index, which] = findFirst(data, [ ';', '{' ]);
        if (index === -1)
            break;
//        console.log("Data: !" + data + "!");
        let sub = data.substring(0, index).trim();
//        console.log("Sub: '" + sub + "' (" + sub.length + ")");
        if (sub.startsWith('for '))
        {
            [index, which] = findFirst(data, [ '{' ]);
            if (index === -1)
                break;
            sub = data.substring(0, index).trim();
        }
        if (which === '{')
        {
            const after = data.substring(index + 1);
            const json = [];
            const ret = parseFunctionBlock(sub, after, json);
            if (json.length === 1)
                elem.push(json[0]);
            else
            if (json.length > 1)
                elem.push(json);
//            console.log('Ret: ' + ret);
            data = after.substring(ret); // No clue why `+ 1` doesn't work here, it returns an empty string!
            data = data.substring(1);
        }
        // TODO: Add ; (semicolon) maybe?
        else
        {
            data = data.substring(index + 1);
//            console.log(sub + ';');
            const subTrimmed = sub.trim();
            if (subTrimmed.startsWith('while ('))
            {
                const lastItem = elem.at(-1);
                if (typeof lastItem !== 'undefined')
                {
                    lastItem['value'] = subTrimmed + ';';
                    continue;
                }
            }
            elem.push({type: 'item', value: subTrimmed + ';'});
        }
//        console.log('');
    }
    if (data.trim().length === 0)
        return elem;
//    console.log('End of blocks');
    console.log("Rest of data: '" + data + "'");
}

function isFunctionCall(value) {
    return value.includes('(') && value.includes(')');
}

function isFieldSet(value) {
    return value.includes('=');
}

function isReturn(value) {
    return value.trim().startsWith('return ');
}

function processInnerItem(value) {
    const newValue = {};

    let isFuncCall = this.isFunctionCall(value);
    let isFieldSet = this.isFieldSet(value);
    let isReturn = this.isReturn(value);

//    console.error(isFuncCall, isFieldSet, value);

    // If there is a fieldSet inside a function call (inside the arguments), then do this
    if (isFuncCall && isFieldSet) {
        const fieldIndex = value.indexOf('=');
        const funcIndex = value.indexOf('(');
        if (fieldIndex > funcIndex) {
            isFieldSet = false;
        }
    }

    if (isFuncCall && !isFieldSet) {

        const funcIndex = value.indexOf('(');
        const funcIndexEnd = value.lastIndexOf(')');
        newValue.func = value.substring(0, funcIndex);
        let args = value.substring(funcIndex + 1, funcIndexEnd);
        if (this.isFieldSet(args))
            args = processInnerItem(args);
        newValue.args = args;

    } else if (isFieldSet) {

        const fieldIndex = value.indexOf('=');
        newValue.field = value.substring(0, fieldIndex);
        let set = value.substring(fieldIndex + 1);
        if (this.isFunctionCall(set))
            set = processInnerItem(set);
        newValue.set = set;

    } else if (isReturn) {

        const find = 'return ';
        const retIndex = value.indexOf(find);

        let returnValue = value.substring(retIndex + find.length);
        if (this.isFunctionCall(returnValue) || this.isFieldSet(returnValue))
            returnValue = processInnerItem(returnValue);

        newValue.key = 'return';
        newValue.value = returnValue;

    }

    /*
    if (isFieldSet(value)) {
        const index = value.indexOf('=');
        newValue.fieldName = value.substring(0, index);
        let fieldSet = value.substring(index + 1);
        if (isFunctionCall(fieldSet) || isFieldSet(fieldSet))
            fieldSet = processInnerItem(fieldSet);
        newValue.fieldSet = fieldSet;
    } else if (isFunctionCall(value)) {
        const index = value.indexOf('(');
        const index2 = value.lastIndexOf(')');
        if (index2 > index) {
            let funcName = value.substring(0, index);
            let funcArgs = value.substring(index + 1, index2);
            if (isFieldSet(funcName)) {
                const fieldSet = processInnerItem(funcName + funcArgs);
                const index3 = funcName.indexOf('=');
                funcName = funcName.substring(0, index3);
                newValue.fieldName = funcName;
                newValue.fieldSet = fieldSet;
                newValue.funcArgs = funcArgs;
            } else {
                newValue.funcName = funcName;
                if (isFunctionCall(funcArgs) || isFieldSet(funcArgs))
                    funcArgs = processInnerItem(funcArgs);
                newValue.funcArgs = funcArgs;
            }
        }
    }
    */
//    console.log(JSON.stringify(newValue, null, 4));

    return newValue;
}

function processItem(item) {
    if (typeof item !== 'string') {
        console.error("Invalid item type '" + (typeof item) + "' -> '" + item + "'");
        return item;
    }
//    console.log("item: `" + item + "`");
    if (item.includes('{')) {
        console.error("Item value contains illegal curly-bracket '{' -> '" + item + "'");
        return item;
    }
    const newValue = {};
    newValue.key = item.key;
    newValue.values = [];
    const split = item.split(';');
    for (const i in split) {
        const value = split[i];
        if (value.length === 0) continue;
        newValue.values.push(processInnerItem(value));
    }
    console.log('');
    return newValue;
}

function prettyPrintJsonInstructions(json, tabCount = 2) {
    return JSON.stringify(json, null, 4);
    let output = '';
    let delimiter = '';

    function prettyPrintKeysMiddle(middle, tabCount) {

    }

    for (const i in json) {
        delimiter = '    '.repeat(tabCount);
        let elem = json[i];
        console.log('elem: ', JSON.stringify(elem));
        let out = delimiter;
        if ('key' in elem) {
            if (elem.key === 'return') {
                out += 'return ' + elem.value;
            } else {
                out += elem.key + ' {\n';
                out += prettyPrintJsonInstructions(elem.values, tabCount + 1);
                out += delimiter + '}';
            }
        } else if ('keys' in elem) {
            out += elem.keys.first + ' {\n';
            out += prettyPrintKeysMiddle(elem.keys.middle, tabCount + 1) + '\n';
            out += delimiter + '}';
        } else {
            out = 'no Key';
        }
        output += out + '\n';
    }
    return output;
}

function processDoWhileLoop(value) {
    const newValue = {};

    const index = value.indexOf('(');
    newValue.first = value.substring(0, index);

    const index2 = value.lastIndexOf(')');
    let last = value.substring(index + 1, index2);
    if (this.isFunctionCall(last) || this.isFieldSet(last))
        last = processInnerItem(last);
    newValue.last = last;

    return newValue;
}

function processWhileLoop(value) {
    const newValue = {};

    const index = value.indexOf('(');
    newValue.first = value.substring(0, index);

    const index2 = value.lastIndexOf(')');
    let middle = value.substring(index + 1, index2);
    if (this.isFunctionCall(middle) || this.isFieldSet(middle))
        middle = processInnerItem(middle);
    newValue.middle = middle;

    return newValue;
}

function processKey(key, elem) {
    const newValue = {};

    if (this.isFunctionCall(key)) {
        newValue.keys = processWhileLoop(key);
    } else if (key.trim() === 'do') {
        // do while
        newValue.key = key;
        newValue.values = processDoWhileLoop(elem.value);
    } else {
        newValue.key = key;
    }

    const newValues = [];
    const elements = elem.values;
    for (const i in elements) {
        let value = elements[i];
        const type = value.type;
        if (type === 'item') {
            value = processItem(value.value);
        } else if ('key' in value) {
            value = processKey(value.key, value);
        } else {
            console.log("Unknown type: '" + type + "'")
        }
        newValues.push(value);
    }
    newValue.values = newValues;

    return newValue;
}

function processClasses(classes) {
    let debug = 1;

    // Parse all instructions
    for (const clazz of classes)  {
        for (const name in clazz.functions) {
            const func = clazz.functions[name];
            const elements = parseFunctionData(func.instructions.join(''));
            for (const key in elements) {
                let elem = elements[key];
                const type = elem.type;
                if (type === 'item') {
                    elements[key] = processItem(elem.value);
                } else if ('key' in elem) {
                    elements[key] = processKey(elem.key, elem);
                } else {
                    console.log("Unknown type: '" + type + "'")
                }
            }
            if (debug)
                console.log("!" + JSON.stringify(elements, null, 4) + "!");
            func.instructions = elements;
        }
    }

    debug = 0;

    // Debug whole class
    if (debug) {
        const code = document.querySelector('code')
        const lineNumbers = document.querySelector('.line-numbers')

        let value = '';

        code.style.display = 'block';
        for (const clazz of classes)
        {
            if (clazz.package !== '')
                value += ('package ' + clazz.package + ';\n\n');
            if (clazz.imports.length > 0) {
                for (const i in clazz.imports)
                    value += ('import ' + clazz.imports[i] + ';\n');
                value += ('\n');
            }
            if (clazz.access.length > 0)
                value += (clazz.access.join(' ') + ' ');
            value += ('class ' + clazz.className);
            if (clazz.extend !== defaultSuperClass)
                value += (' extends ' + clazz.extend);
            if (clazz.implement !== '')
                value += (' implements ' + clazz.implement);
            value += (' {\n');
            for (const name in clazz.fields)
            {
                const field = clazz.fields[name];
                if (field.value !== null)
                    value += ('    ' + (field.access.length === 0 ? "" : field.access.join(' ') + ' ') + field.type + ' ' + name + ' = ' + field.value + ';\n');
                else
                    value += ('    ' + (field.access.length === 0 ? "" : field.access.join(' ') + ' ') + field.type + ' ' + name + ';\n');
            }
            for (const name in clazz.functions)
            {
                const func = clazz.functions[name];
                value += ('    ' + (func.access.length === 0 ? "" : func.access.join(' ') + ' ') +
                    (func.retType === "" ? "" : func.retType + ' ') + name + '(' + func.arguments.join(' ') + ') {' + '\n');
                value += (prettyPrintJsonInstructions(func.instructions));
                value += ('    }\n');
            }
            value += ('}\n');
        }
        value = hljs.highlightAuto(value).value
        code.innerHTML = value;

        const numberOfLines = value.split('\n').length
        lineNumbers.innerHTML = Array(numberOfLines)
            .fill('<span></span>')
            .join('')
    }

}

function processSourceCode(javaSourceCode) {

    let inClass = false;
    let inFunction = false;
    let inString = false;
    let inComment1 = false, inComment2 = false;

    let stringValue = "";
    let tempString = "";

    let currentPkg = '';
    let imports = [ ];

    let classes = [ ];
    let currentClass = null, currentFunction = null;
    let currentCurlyCount = 0;

    let print = "";

    let inStringBackslash = 0;

    const chars = iter(javaSourceCode.split(''));
    while (true)
    {
        // Get next character
        const c = chars.next();
        // And break the loop if this is the end
        if (!c)
            break;

        // Firstly, check if we are inside a string...
        if (inString)
        {
            // If we are inside a string, and this char is " and the previous one isn't escaped by '\'
            // then we break out of the string.

            if (c === '\\')
            {
                if (++inStringBackslash === 2)
                    inStringBackslash = 0;
            }
            else
            if (c === '"')
            {
                inString = false;
                inStringBackslash = 0;
                // TODO: Use stringValue in some way
                tempString += "\"" + stringValue + "\"";
                stringValue = "";
            }
            else
            {
                stringValue += c;
                inStringBackslash = 0;
            }

            continue;
        }

        // Skip comment format '//'
        {
            if (c === '/' && !inComment1 && chars.peekNext() === '/')
            {
                inComment1 = true;
                chars.next(); // Skip the /
                continue;
            }
            else if (inComment1)
            {
                if (c === '\n')
                {
                    inComment1 = false;
                    chars.next(); // Skip the newline
                }
                continue;
            }
        }

        // Skip comment format '/*'
        {
            if (c === '/' && !inComment2 && chars.peekNext() === '*')
            {
                inComment2 = true;
                chars.next(); // Skip the *
                continue;
            }
            else
            if (inComment2)
            {
                if (c === '*' && chars.peekNext() === '/')
                {
                    inComment2 = false;
                    chars.next(); // Skip the last '/'
                }
                continue;
            }
        }

        // Check if we should be inside a string
        if (c === '"') {
            inString = true;
            continue;
        }

        if (inFunction)
        {
            const tmp = currentCurlyCount;

            if (c === '}' && currentFunction.curlyCount === currentCurlyCount)
            {
                inFunction = false;
                if (currentCurlyCount > 0)
                    --currentCurlyCount;
                currentFunction.instructions = tempString.trimStart().split('');
                console.log("[" + tmp + " -> " + currentCurlyCount + "] Exiting function " + currentFunction.functionName);
                currentFunction = null;
                tempString = '';
                continue;
            }
            else
            if (c === '{')
            {
                currentCurlyCount++;
                console.log("[" + tmp + " -> " + currentCurlyCount + "] Loop inside function " + currentFunction.functionName);
            }
            else
            if (c === '}')
            {
                currentCurlyCount--;
                console.log("[" + tmp + " -> " + currentCurlyCount + "] Exiting loop inside function " + currentFunction.functionName);
            }

            tempString += c;
            continue;
        }

        let index;
        const getWord = () => {
            return getUntil(' ');
        }
        const getUntil = (delimiter) => {
            index = 0;
            const len = tempString.length;
            let result = '', skipFront = true, i = 0;
            for (; i < len; i++) {
                const char = tempString.charAt(i);
                const isDelimiter = char === delimiter;
                if (skipFront) {
                    if (/\s/g.test(char))
                        continue;
                    skipFront = false;
                }
                if (isDelimiter)
                    break;
                result += char;
            }
            index = i;
            return result;
        }
        const getNextWord = str =>
        {
            let index = 0;
            while (true)
            {
                let search = ' ';
                if (str.trim().startsWith('@'))
                {
                    search = ')';
                    const tmp = index;
                    index = str.indexOf(search, index);
                    if (index === -1)
                    {
                        search = ' ';
                        index = tmp;
                    }
                }
                index = str.indexOf(search, index);
                if (index === -1) return [ str, str.length ];
                if (search === ')') index++;
                if (str.substring(0, index).trim().length > 0)
                    break;
                index++;
            }
            return [ str.substring(0, index).trim(), index ];
        }
        const getFieldData = () =>
        {
            const annotations = [ ];
            const access = [ ];
            let ret = '';
            let name = '';
            const strings = [ ];
            let str = tempString;
            while (true)
            {
                const [word, index] = getNextWord(str);
                if (word.trim().length === 0)
                    break;
                strings.push(word.trim());
                str = str.substring(index);
            }
            let len = strings.length;
            while (len--)
            {
                const word = strings[len];
                if (word.startsWith('@'))
                    annotations.push(word);
                else
                if (accessModifiers.includes(word))
                    access.push(word);
                else
                    continue;
                strings.splice(len, 1);
            }
            name = strings.pop();
            ret = strings.pop();
            return [ annotations, access, ret, name ];
        }
        const getFunctionData = () =>
        {
            const annotations = [ ];
            const access = [ ];
            let ret = '';
            let name = '';
            const args = [ ];
            let str = tempString;
            const strings = [ ];
            const idx = str.lastIndexOf('(');
            let argsString = str.substring(idx + 1);
            argsString = argsString.substring(0, argsString.indexOf(')'));
            str = str.substring(0, idx);
            while (true)
            {
                const [word, index] = getNextWord(str);
                if (word.trim().length === 0)
                    break;
                strings.push(word.trim());
                str = str.substring(index);
            }
            let len = strings.length;
            while (len--)
            {
                const word = strings[len];
                if (word.startsWith('@'))
                    annotations.push(word);
                else
                if (accessModifiers.includes(word))
                    access.push(word);
                else
                    continue;
                strings.splice(len, 1);
            }
            if (strings.length === 1 && strings[0] === currentClass.className)
                name = strings.pop();
            else
            {
                name = strings.pop();
                ret = strings.pop();
            }
            args.push(argsString.split(','));
            return [ annotations, access, ret, name, args ];
        }

        if (inClass)
        {
            const tmp = currentCurlyCount;
            // Function
            if (c === '{' && tempString.includes('(') && tempString.includes(')'))
            {
                const [ annotations, access, ret, name, args ] = getFunctionData();
                currentFunction = new JavaFunction(annotations, access, ret, name, args, currentClass);

                currentCurlyCount++;
                console.log("[" + tmp + " -> " + currentCurlyCount + "] Entering function " + name);
                currentFunction.curlyCount = currentCurlyCount;
                currentClass.functions[name] = currentFunction;
                inFunction = true;

                print += currentFunction.print() + " {";
                tempString = "";
                continue;
            }
            else
                // Field
            if (c === ';')
            {
                let value = null;

                // TODO: Improve `value` fetching (does it work for multi-line values?)
                if (tempString.includes('='))
                {
                    const idx = tempString.indexOf('=');
                    value = tempString.substring(idx + 1);
                    tempString = tempString.substring(0, idx);
                }

                const [ annotations, access, ret, name ] = getFieldData();

                currentClass.fields[name] = new JavaField(name, access, ret, currentClass, value);

                if (tempString.includes('='))
                    print += access.join(' ') + " " + ret + " " + name + " = " + value + ";";
                else
                    print += access.join(' ') + " " + ret + " " + name + ";";

                tempString = "";
                continue;
            }
            else
            if (c === '}' && currentClass.curlyCount === currentCurlyCount)
            {
                const tmp = currentCurlyCount;
                if (currentCurlyCount > 0)
                    --currentCurlyCount;
                console.log("[" + tmp + " -> " + currentCurlyCount + "] Exiting class " + currentClass.className);
                currentClass = currentClass.ownerClass;
                if (currentCurlyCount === 0)
                    inClass = false;
                print += ' ' + tempString + ' }';
                // print += " {{{Just left class}}} ";
                tempString = '';
                continue
            }
        }

        // Not in function or class? Probably 'package', 'import' or 'class'

        if (c === ';')
        {
            if (tempString.includes('package '))
            {
                getWord();
                tempString = tempString.substring(index);

                getWord();
                currentPkg = tempString.substring(0, index).trim();

                print += "package " + currentPkg + ";";

                tempString = "";
                continue;
            }
            else
            if (tempString.includes('import '))
            {
                tempString = tempString.trim();
                getWord();
                tempString = tempString.substring(index);

                getWord();
                const imp = tempString.substring(0, index).trim();
                imports.push(imp);

                print += "import " + imp + ";";

                tempString = "";
                continue;
            }
            print += tempString + ";";
            tempString = "";
            continue;
        }

        const getAnnoThenAccessThenClassNameThenSuperClass = () =>
        {
            const annotations = [ ];
            const access = [ ];
            let name = '', extend = defaultSuperClass, implement = '';
            let nextIsExtends = false, nextIsImplements = false;
            while (true)
            {
                getWord();
                let str = tempString.substring(0, index).trim();
                tempString = tempString.substring(index);
                if (str.length === 0)
                    break;

                if (str.startsWith("@"))
                    annotations.push(str);
                else
                if (accessModifiers.includes(str))
                    access.push(str);
                else
                if (str === 'class')
                    continue;
                else
                if (str === 'extends')
                {
                    nextIsExtends = true;
                    continue;
                }
                else
                if (str === 'implements')
                {
                    nextIsImplements = true;
                    continue;
                }
                else
                {
                    if (nextIsExtends)
                    {
                        extend = str;
                        nextIsExtends = false;
                    }
                    else
                    if (nextIsImplements)
                    {
                        implement = str;
                        nextIsImplements = false;
                    }
                    else
                        name = str;
                }
            }
            return [ annotations, access, name, extend, implement ];
        }

        if (c === '{')
        {
            const tmp = currentCurlyCount;
            currentCurlyCount++;
            // Class
            if (tempString.startsWith('class ') || tempString.includes(' class '))
            {
                const [ annotations, access, name, extend, implement ] = getAnnoThenAccessThenClassNameThenSuperClass();

                currentClass = new JavaClass(currentPkg, name, access, currentClass, extend, implement);
                currentClass.curlyCount = currentCurlyCount;
                currentClass.imports = imports;
                console.log("[" + tmp + " -> " + currentCurlyCount + "] Entering class " + name + ", with superClass " + extend);

                if (currentCurlyCount === 1)
                    classes.push(currentClass);

                currentPkg = '';
                imports = [ ];

                print += access.join(' ') + " class " + name + " {";
                inClass = true;
            }
            else
                // Unknown
            {
                if (currentCurlyCount === 2)
                    print += ' ' + tempString + ' { /* Function */';
                else
                    print += ' ' + tempString + ' { /* Unknown (loop?) */';
                console.log("[" + tmp + " -> " + currentCurlyCount + "] Unknown " + name);
            }
            tempString = '';
            continue;
        }

        tempString += c;

        if (c === '\n')
            print += '<br>';
        else
        if (c === ' ')
            print += '&nbsp;';

    }

    // document.write(print);
    return classes;
}