package compilertesting.annotations;

@ TestAnnotation1.TestInnerAnnotation1 ( abc = 11 )
@ TestAnnotation2.TestInnerAnnotation2 ( abc = 22 )
@   TestAnnotation3  .
        TestInnerAnnotation3 ( abc = 33 )
public final class CompilerTestV1005 {

    @
            TestAnnotation1.
            TestInnerAnnotation1 ( abc = 44 )
    @TestAnnotation2

            .
            TestInnerAnnotation2
            ( abc =
                    55
            )
    @
            TestAnnotation3.


            TestInnerAnnotation3 ( abc = 66 )
    public static final int abc
//            = 77
            ;

}