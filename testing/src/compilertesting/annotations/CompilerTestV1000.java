package compilertesting . annotations;

@TestAnnotation(
    abc = 123,
    def = "hello",
    ghi = {"hello", "world"},
    inner = @TestAnnotation.TestInnerAnnotation(
        abc = 123,
        def = "hello",
        ghi = {"hello", "world"}
    )
)
public class CompilerTestV1000 {

}