package compilertesting.innerclasses;

public class CompilerTestV110 {

    public static void main(String[] args) {
        new CompilerTestV110().test();
    }

    void test() {
        InnerClass1.main(null);
    }

    static class InnerClass1 {

        public static void main(String[] args) {
            System.out.println("Hello world :)");
        }

    }

}
