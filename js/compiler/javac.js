/*

    package compilertesting.fields;
    public class CompilerTestV1 {

    }

*/

function test(iter, text) {
    const doTest = false;
    if (!doTest)
        return false;

    const test = new JavacUtils(iter);



    return true;
}

let maxFields = 0;
let classMaxField = null;

let maxFunctions = 0;
let classMaxFunctions = null;

let maxFunctionLength = 0;
let classMaxFunctionLength = null;

function countFieldsAndFunctions(classes, fileName) {
    if (!classes || Object.keys(classes).length == 0) return;
    let numFields = 0;
    let numFunctions = 0;
    let numFunctionLength = 0;
    for (let i = 0; i < classes.length; i++) {
        const data = classes[i];
        if ('body' in data) {
            if ('fields' in data.body)
                numFields += data.body.fields.length;
            if ('functions' in data.body) {
                numFunctions += data.body.functions.length;
                for (let func of data.body.functions) {
                    const bodyLen = func.body?.length ?? 0;
                    if (bodyLen > maxFunctionLength) {
                        maxFunctionLength = bodyLen;
                        classMaxFunctionLength = fileName + ' ' + func.header;
                        console.log(`maxFunctionLength: ${maxFunctionLength}, classMaxFunctionLength: ${classMaxFunctionLength}`)
                    }
                }
            }
        }
        const inner = data.innerClasses;
        if (inner.length <= 0)
            continue;
        const len = inner.length;
        for (let j = 0; j < len; j++) {
            const innerObj = inner[j];
            countFieldsAndFunctions(innerObj, fileName);
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
    const text = (await response.text()) + '\0'; // Add trailing-zero
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
    const iter = new CIterator(text);

    if (!!test(iter, text))
        return null;

    // console.log(fileName)
    const sourceReader = new JavaSourceReader(fileName, iter);
    return sourceReader.parseSourceCode().then(json => {
        // console.log(json)
        // console.log(JSON.stringify(json, null, 4))
        console.log('done')

        // if (json && json.result) countFieldsAndFunctions(json.result.topLevelClasses, fileName)

        return json;
    }).catch(error => {
        console.error(error)
    });
}
