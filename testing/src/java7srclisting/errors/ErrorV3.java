package java7srclisting.errors;

public class ErrorV3 {

    void test1() {
        char c = '\\';
        String abc = " ";
    }

    void test2() {
        try {
            {
                // sequence is `\DDD'
            }
        } catch (Exception e) {
        }
    }

}
