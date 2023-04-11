package java7srclisting.errors;

public class ErrorV2 {
    String b = "";

    void test() {
        {
            try {
                while ("//".isEmpty()) {

                }
            } catch (Exception e) {

            }
        }
    }

}
