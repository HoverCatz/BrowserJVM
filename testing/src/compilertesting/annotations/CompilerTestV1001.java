package compilertesting.annotations;

@TestAnnotation1(
    abc = 123,
    def = "hello",
    ghi = {"hello", "world"},
    inner = @TestAnnotation1.TestInnerAnnotation1(
        abc = 456,
        def = "world",
        ghi = {"world", "meow } { // /* )))"}
    )
)
@TestAnnotation1.TestInnerAnnotation1(abc = 789)
public class CompilerTestV1001 {

}