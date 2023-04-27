package java7srclisting.errors;

public enum ErrorV10 {

    TEST(3) {
        // Any fields/functions here
        @Override
        public String toString() {
            return "OwO " + new Object() {
                @Override
                public String toString() {
                    return "Hehehe";
                }
            };
        }
    },
    TEST2 {
        // Any fields/functions here
    },
    TEST3; // None, nothing.

    ErrorV10(int i) {
    }
    ErrorV10() {
    }

    public static void test() {
        System.out.println(TEST);
    }

}
