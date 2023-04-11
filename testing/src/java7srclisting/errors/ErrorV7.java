package java7srclisting.errors;

public class ErrorV7 {

    static {
        try {

        } catch (Throwable e) {
            throw new AssertionError(e);
        }
    }

}
