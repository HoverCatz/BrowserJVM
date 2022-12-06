/*

    package compilertesting.fields;
    public class CompilerTestV1 {

    }

*/

async function compileJavaSourceFile(fileName) {
    const response = await fetch(fileName);
    const text = await response.text();
    const iter = new Iterator(text);

    const sourceReader = new JavaSourceReader(fileName, text, iter);
    sourceReader.parseSourceCode().then(json => {
        console.log(json)
    }).catch(error => {
        console.error(error)
    });
}
