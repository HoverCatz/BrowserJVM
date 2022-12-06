package compilertesting;

public class Test {

    static String abc = "";

    public static void main(String[] args) {
        System.out.println(abc = test());
        System.out.println("Hello world!");
    }

    static String test() {
        return "Hello";
    }

    void testLoop(int a) {
        for (int i = 0; i < 10; i++) {
            testLoop(1);
            if (i == 5) {
                testLoop(2);
            }
            testLoop(3);
        }
    }

    void testLoop2(int a) {
        do {
            testLoop2(69);
        } while (true);
    }

    void testLoop3(int a) {
        while (true) {
            testLoop3(420);
        }
    }

}