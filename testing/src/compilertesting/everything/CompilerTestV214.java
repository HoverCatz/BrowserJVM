package compilertesting.everything;

final class CompilerTestV214<T extends CompilerTestV214<? extends T>>
        extends Object
        implements Comparable<T>
{

    public int compareTo(T i) {
        return 0;
    }

}