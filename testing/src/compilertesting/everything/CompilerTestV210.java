// Single-line comment {([)}]
/**
 * This is a multi-line comment with double asterisks.
 * This class ({[represents]}]) an employee in the system {[({)]}}.
 */
/*
 * This is a multi-line comment with a single asterisk.
 * Contains: ([{)]}]{[(})
 */

package compilertesting.everything;

import compilertesting.everything.v210.MyClassAnnotation;
import compilertesting.everything.v210.Person;

import java.io.Serializable;
import java.util.*; // Wildcard import
import static java.lang.Math.max; // Static import

// Annotations with strings containing special characters
@MyClassAnnotation(
        value = "Employee class {{()}}[]",
        inner = @MyClassAnnotation.TestInner("hello")
)
@SuppressWarnings(value = {"unchecked", "rawtypes", "Using ()[]{} in a string"})
public class CompilerTestV210<T extends Number>
        extends Person<T>
        implements Comparable<CompilerTestV210<T>>, Serializable {

    // Instance variables
    private T id;
    private String name;
    private List<String> roles;

    // Constructor
    public CompilerTestV210(T id, String name) {
        this.id = id;
        this.name = name;
        this.roles = new ArrayList<>();
    }

    // Getters and Setters
    public T getId() {
        return id;
    }

    public void setId(T id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    // Methods
    public void addRole(String role) {
        this.roles.add(role);
    }

    @Override
    public int compareTo(CompilerTestV210<T> other) {
        return this.id.intValue() - other.id.intValue();
    }

    // Nested class
    public static class Builder<T extends Number> {
        private T id;
        private String name;

        public Builder<T> setId(T id) {
            this.id = id;
            return this;
        }

        public Builder<T> setName(String name) {
            this.name = name;
            return this;
        }

        public CompilerTestV210<T> build() {
            return new CompilerTestV210<>(id, name);
        }
    }

}