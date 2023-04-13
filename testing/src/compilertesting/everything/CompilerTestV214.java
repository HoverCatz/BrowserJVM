package compilertesting.everything;

class CompilerTestV214<T extends CompilerTestV214<? extends T>>
        extends Object
        implements Comparable<T>
{

    public int compareTo(T i) {
        for (int j = new CompilerTestV214() {
            @Override
            public String toString() {
                return super.toString();
            }
        }.hashCode(); j < 10; j++) {
            if (j == 5)
                return j - 5;
        }
        return 0;
    }

}