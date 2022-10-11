let javaSourceCode = `
    package obzcu.re.testing;
    
    // Comment
        /* Multi-line
           comment */
    /** Yet another comment! */
    import obzcu.re.testing.Test;
    
    public class Test 
        extends TestExtend{
        static int abc = /* test comment */ 3;
        public String test = "   Hello    world ;)   "; /*
        public static void main(String[] args)
        {
    //        System.out.println(/* test comment */ "/* hi */Hello world! " + /* test comment */ abc);
        }
        public void heyhey() { }
        static void byebye() { }
        void test() {
            abc = 6;
        }
        void testLoop() {
            for (int i = 0; i < 10; i++) {
                ;
            }
        } */
        void testIf() {
            if (123) {
                a;
                if (456) {
                    b;
                }
            }
            if (789) {
                c;
            }
            d;
        }
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
        for (const func in this.functions) {
            if (func.functionName === find) {
                return func;
            }
        }

        return null;
    });
    clazz.findField = (function(find) {
        for (const field in this.fields) {
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
const accessModifiers = [ "public", "private", "protected", "static", "final", "native", "abstract", "transient", "volatile", "synchronized" ];
const returnTypes = [ "void", "String", "int" ]; // TODO: Add more

const classes = processSourceCode(javaSourceCode);
processClasses(classes);

// TODO: Implement support for `import X` where X gets fetched from the url `java.7/X`, loaded through `asm.js`, and is
//  searched through when trying to access classes/fields/functions

// TODO: Add `extends` and `implements` to JavaClass

function findClass(find) {
    for (const clazz in classes)
        if (clazz.className === find)
            return clazz;
    return null;
}

function fetchFunctionBlock(after)
{
//    console.log('after: !' + after + '!');
    let curlyIndex = 1, charIndex = 0;
    for (charIndex in after) {
        const c = after[charIndex];
        if (/\s/g.test(c)) continue;
//        console.log('[' + charIndex + '] c: ' + c);
        if (c === '{') curlyIndex++;
        else
        if (c === '}') {
            curlyIndex--;
            if (curlyIndex === 0) {
                break;
            }
        }
    }
    const blockData = after.substring(0, charIndex).trim();
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
            const f = findArr[i];
            const flen = f.length;
            if (flen === 0 || flen > textLen)
                continue;
            if (flen === 1 && c === f)
                return [ index, f ];
            if (c !== f.charAt(0) || !chars.peekNextN(flen - 1))
                continue;
            for (let n = 1; n < flen; n++)
            {
                const peekN = chars.peekNextN(n);
                if (!peekN)
                    continue outer;
                const findN = f.charAt(n);
                if (peekN !== findN)
                    continue outer;
            }
            return [ index, f ];
        }
    }
    return [ -1, '' ];
}

function parseFunctionBlock(sub, after, elem)
{
    const [ i, blockData ] = fetchFunctionBlock(after);
//    console.log("blockData: '" + blockData + "'");

    let data = blockData.trim();

    const json = [{key: sub.trim(), value: data}];

    const [index] = findFirst(data, [ '{' ]);
    if (index !== -1)
        parseFunctionData(data, json);

    elem.push({type: 'block', values: json});

    return i; // End of block (start of next block if any)
}

function parseFunctionData(data, elem = [])
{
//    console.log('');
    while (true)
    {
        const [index, which] = findFirst(data, [ ';', '{' ]);
        if (index === -1)
            break;
//        console.log("Data: !" + data + "!");
        const sub = data.substring(0, index);
//        console.log("Sub: '" + sub + "' (" + sub.length + ")");
        if (which === '{')
        {
            const after = data.substring(index + 1);
            const ret = parseFunctionBlock(sub, after, elem);
//            console.log('Ret: ' + ret);
            data = after.substring(ret); // No clue why `+ 1` doesn't work here, it returns an empty string!
            data = data.substring(1);
        }
        // TODO: Add ; (semicolon) maybe?
        else
        {
//            console.log(sub + ';');
            elem.push({type: 'item', value: sub.trim() + ';'});
            data = data.substring(index + 1);
        }
//        console.log('');
    }
    if (data.trim().length === 0)
        return elem;
//    console.log('End of blocks');
    console.log("Rest of data: '" + data + "'");
}

function processClasses(classes) {
    const debug = false;

    // Debug whole class
    if (debug)
    for (const clazz of classes)
    {
        if (clazz.package !== '')
            document.write('package ' + clazz.package + ';<br><br>');
        if (clazz.imports.length > 0) {
            for (const i in clazz.imports)
                document.write('import ' + clazz.imports[i] + ';<br>');
            document.write('<br>');
        }
        if (clazz.access.length > 0)
            document.write(clazz.access.join(' ') + ' ');
        document.write('class ' + clazz.className);
        if (clazz.extend !== '')
            document.write(' extends ' + clazz.extend);
        if (clazz.implement !== '')
            document.write(' implements ' + clazz.implement);
        document.write(' {<br>');
        for (const name in clazz.fields)
        {
            const field = clazz.fields[name];
            if (field.value !== null)
                document.write('&nbsp;&nbsp;' + (field.access.length === 0 ? "" : field.access.join(' ') + ' ') + field.type + ' ' + name + ' = ' + field.value + ';<br>');
            else
                document.write('&nbsp;&nbsp;' + (field.access.length === 0 ? "" : field.access.join(' ') + ' ') + field.type + ' ' + name + ';<br>');
        }
        for (const name in clazz.functions)
        {
            const func = clazz.functions[name];
            document.write('&nbsp;&nbsp;' + (func.access.length === 0 ? "" : func.access.join(' ') + ' ') +
                (func.retType === "" ? "" : func.retType + ' ') + name + '(' + func.arguments.join(' ') + ') {' + '<br>');
            document.write(func.instructions.join('') + '<br>');
            document.write('&nbsp;&nbsp;}<br>');
        }
        document.write('}<br>');
    }

    // Parse all instructions
    for (const clazz of classes)
    {
        for (const name in clazz.functions)
        {
            const func = clazz.functions[name];
            const elements = parseFunctionData(func.instructions.join(''));
            for (const key in elements)
            {
                const value = elements[key];
                console.log(key, "!" + JSON.stringify(value, null, 4) + "!");
            }
        }
    }

}

function processSourceCode(javaSourceCode) {
    const defaultSuperClass = 'java.lang.Object';

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