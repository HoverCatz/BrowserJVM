package compilertesting.everything.v210;

public @interface MyClassAnnotation {
    String value();
    TestInner inner();

    public @interface TestInner {
        String value();
    }
}