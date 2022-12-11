package compilertesting.annotations;

import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.*;
import static java.lang.annotation.ElementType.PARAMETER;

@Target({PACKAGE, TYPE, ANNOTATION_TYPE, METHOD, CONSTRUCTOR, FIELD,
        LOCAL_VARIABLE, PARAMETER})
public @interface TestAnnotation1 {
    int abc() default 123;
    String def() default "hello";
    String[] ghi() default {"hello", "world"};
    TestInnerAnnotation1 inner();

    @Target({PACKAGE, TYPE, ANNOTATION_TYPE, METHOD, CONSTRUCTOR, FIELD,
            LOCAL_VARIABLE, PARAMETER})
    @interface TestInnerAnnotation1 {
        int abc() default 123;
        String def() default "hello";
        String[] ghi() default {"hello", "world"};
    }
}
