package compilertesting.annotations;

@TestAnnotation1(abc = 123, inner = @TestAnnotation1.TestInnerAnnotation1(abc = 456))
@TestAnnotation2.TestInnerAnnotation2(abc = 789)
public class CompilerTestV1002 {

}