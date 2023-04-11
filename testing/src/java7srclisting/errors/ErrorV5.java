package java7srclisting.errors;

public class ErrorV5 {

    void test() {
        String a = "aaa \" bbb";
        char b = 'b';
        char c = '\'';
        char d = '"';
        char e = '\"';
        char f = '\\';
    }

    void test2() {
        {
            {
                test3("\"");
            }
        }
    }

    void test3(String codebase) {

    }

}
