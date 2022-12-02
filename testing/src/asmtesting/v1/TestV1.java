package asmtesting.v1;

public class TestV1 extends TestV1Super implements TestV1Itz1, TestV1Itz2 {

    final int ab = 12;
    final long cd = 34;
    final float ef = 56.25f;
    final double gh = 78.75;

    public static void main(String[] args) {
        try {
            new TestV1();
        } catch (Exception e) {

        }
    }

    public TestV1() {
        System.out.println("Hello world");
        int test = ab;
        if (test == 12)
            System.out.println(ab);
//        System.out.println(cd);
//        System.out.println(ef);
//        System.out.println(gh);
    }

    static class TestV1Inner {

    }

}
