package asmtesting;

import org.objectweb.asm.ClassReader;
import org.objectweb.asm.tree.ClassNode;

import java.io.File;
import java.nio.file.Files;

public class AsmTester {

    public static void main(String[] args) {
        new AsmTester();
    }

    public AsmTester() {
        try {

            File file = new File("out/production/BrowserJVM/asmtesting/TestV1.class");

            byte[] bytes = Files.readAllBytes(file.toPath());
            ClassReader reader = new ClassReader(bytes);
            ClassNode node = new ClassNode();
            reader.accept(node, ClassReader.SKIP_FRAMES);

        } catch (Throwable t) {
            t.printStackTrace();
        }
    }

}
