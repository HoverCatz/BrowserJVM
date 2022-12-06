package compilertesting.annotations;

@TestAnnotation(
    abc = 123,
    def = "hello",
    ghi = {"hello", "world"},
    inner = @TestAnnotation.TestInnerAnnotation(
        abc = 456,
        def = "world",
        ghi = {"world", "meow"}
    )
)
@TestAnnotation.TestInnerAnnotation(abc = 789)
public class CompilerTestV1000 {

    int abc = 123;

    String hello = "world";

}