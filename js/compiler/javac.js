/*

    package compilertesting.fields;
    public class CompilerTestV1 {

    }

*/

function test(iter, text) {
    const doTest = false;
    if (!doTest)
        return false;

    const test = new JavacUtils(iter, text);

    console.log(test.readUntil('{', iter, false));

    const start = iter.index();
    test.skipUntilClosingChar('{', iter)
    const end = iter.index();
    const classText = text.substring(start, end);
    console.log(`classText: '${classText}'`)

    iter = new Iterator(classText);
    iter.next()
    iter.removeLast()
    test.skipUntilCharOutsideBrackets(';', iter)

    return true;
}

let maxFields = 0;
let classMaxField = null;

let maxFunctions = 0;
let classMaxFunctions = null;

function countFieldsAndFunctions(classes, fileName) {
    if (!classes || Object.keys(classes).length == 0) return;
    let numFields = 0;
    let numFunctions = 0;
    for (let i = 0; i < classes.length; i++) {
        const data = classes[i];
        if ('body' in data) {
            if ('fields' in data.body)
                numFields += data.body.fields.length;
            if ('functions' in data.body)
                numFunctions += data.body.functions.length;
        }
        const inner = data.innerClasses;
        if (inner.length > 0) {
            const len = inner.length;
            for (let j = 0; j < len; j++) {
                const innerObj = inner[j];
                countFieldsAndFunctions(innerObj, fileName);
            }
        }
    }
    if (numFields > maxFields) {
        maxFields = numFields;
        classMaxField = fileName;
        console.log(`maxFields: ${maxFields}, classMaxField: ${classMaxField}`)
    }
    if (numFunctions > maxFunctions) {
        maxFunctions = numFunctions;
        classMaxFunctions = fileName;
        console.log(`maxFunctions: ${maxFunctions}, classMaxField: ${classMaxFunctions}`)
    }
}

async function compileJavaSourceFile(fileName) {
    const response = await fetch(fileName);
    if (!response.ok) {
        console.log('Fetch failed')
        return false;
    }
    const text = await response.text();
    // const text = `hello "abc" world;`;
    // const text = `
    //     package test1.test2.test3;
    //     import a.b.c;
    //     import d.e.f;
    //     @TestAnnotation(a=1, b=2)
    //     class TestClass {
    //        //class-data
    //     }
    // `;
    const iter = new Iterator(text);

    if (!!test(iter, text))
        return null;

    // console.log(fileName)
    const sourceReader = new JavaSourceReader(fileName, text, iter);
    return sourceReader.parseSourceCode().then(json => {
        // console.log(json)
        // console.log(JSON.stringify(json, null, 4))
        console.log('done')

        if (json && json.result) {
            countFieldsAndFunctions(json.result.topLevelClasses, fileName)
        }

        return json;
    }).catch(error => {
        console.error(error)
    });
}
