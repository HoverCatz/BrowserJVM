package asmtesting.v1;

public class TestV1 extends TestV1Super implements TestV1Itz1, TestV1Itz2 {

    final int ab = 12;
    final long cd = 34;
    final float ef = 56.25f;
    final double gh = 78.75;

    public static void main(String[] args) {
        new TestV1();
    }

    public TestV1() {

    }

    static class TestV1Inner {

    }

}
