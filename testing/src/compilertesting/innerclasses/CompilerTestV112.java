package compilertesting.innerclasses;

public class CompilerTestV112 {

    public static void main(String[] args) {
        new CompilerTestV112().test();
    }

    void test() {
        InnerClass1.main(null);
    }

    static class InnerClass1 {
        int abc = 1;

        public static void main(String[] args) {
            System.out.println("Hello world :)");
        }

        static class InnerClass2 {
            int abc = 2;
            static class InnerClass3 {
                int abc = 3;
                static class InnerClass4 {
                    int abc = 4;
                }
            }
        }

    }

    static class InnerClass5 {
        int abc = 5;
    }

}
