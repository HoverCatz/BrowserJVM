package compilertesting.annotations;

import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.*;

@Target({PACKAGE, TYPE, ANNOTATION_TYPE, METHOD, CONSTRUCTOR, FIELD,
        LOCAL_VARIABLE, PARAMETER})
public @interface TestAnnotation3 {
    int abc() default 123;
    String def() default "hello";
    String[] ghi() default {"hello", "world"};
    TestInnerAnnotation3 inner();

    @Target({PACKAGE, TYPE, ANNOTATION_TYPE, METHOD, CONSTRUCTOR, FIELD,
            LOCAL_VARIABLE, PARAMETER})
    @interface TestInnerAnnotation3 {
        int abc() default 123;
        String def() default "hello";
        String[] ghi() default {"hello", "world"};
    }
}
