package java7srclisting;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

public class Java7SourceListing {

    public static void main(String[] args) {
        new Java7SourceListing();
    }

    private final StringBuilder output = new StringBuilder();

    private Java7SourceListing() {
        try {

            File here = new File(new File(".").getAbsolutePath());
            File file = new File("testing/java.7");

            output.append("const java7source = [\n");
            processFile(here.getAbsolutePath().length() - 1, file);
            output.append("];");

            Files.write(new File(here,
                    "testing/src/java7srclisting/output.txt").toPath(),
                    output.toString().getBytes(StandardCharsets.UTF_8));

        } catch (Throwable t) {
            t.printStackTrace();
        }
    }

    private void processFile(int prefix, File file) {
        if (file.isDirectory())
            for (File f : file.listFiles())
                processFile(prefix, f);
        else if (file.getName().endsWith(".java"))
            output.append("\t'")
                    .append(file.getAbsolutePath().substring(prefix).replace("\\", "/"))
                    .append("',\n");
    }

}
