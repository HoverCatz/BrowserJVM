package compilertesting.annotations;

@ TestAnnotation1.TestInnerAnnotation1 ( abc = 11 )
@ TestAnnotation2.TestInnerAnnotation2 ( abc = 22 )
@   TestAnnotation3  .
        TestInnerAnnotation3 ( abc = 33 )
public class CompilerTestV1005 {

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
    public static int abc // owo
            = 66 + 3 + ((((true ? "123" : "123456").length()
            + (false ? 123 /* hello :) */ : 123456))
            /**
             * @author Test
             * @link https://google.com/
             * This is a comment :)
             */
            + test(123))) + new CompilerTestV1005() {
                                // Test comment }}}
                                   {
                                       def = 789 + test(654);
                                       // :D })
                                       /** test @{@link def} */
                                   }
                               }.def
            ;

    public int def = 666;

//    private String test;
//    private String test2;
//    private String test3;

    public static final int test(int i) {
        int x = 3;
        for (; i < 10; i++) {
            x += i;
            // abc
        }
        return i * x;
    }

}