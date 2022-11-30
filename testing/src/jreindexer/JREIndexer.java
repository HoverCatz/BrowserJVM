package jreindexer;

import com.google.gson.*;
import org.objectweb.asm.ClassReader;
import org.objectweb.asm.Type;
import org.objectweb.asm.tree.ClassNode;
import org.objectweb.asm.tree.FieldNode;
import org.objectweb.asm.tree.MethodNode;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class JREIndexer
{

    private static final JsonObject root = new JsonObject();
    private static final Map<String, JsonObject> packages = new HashMap<>();
    private static final Map<String, JsonObject> classes = new HashMap<>();
    private static final JsonObject classesPackages = new JsonObject();

    private static final Map<String, Integer> classCounts = new HashMap<>();
    private static final Map<String, Integer> packagesCounts = new HashMap<>();

    private static final Map<String, String> shortNames = new HashMap<String, String>() {{
        boolean useShort = true;
        if (useShort) {
            put("package", "p");
            put("access", "a");
            put("name", "n");
            put("desc", "d");
            put("arguments", "g");
            put("returnType", "r");
            put("super", "s");
            put("methods", "m");
            put("fields", "f");
            put("interfaces", "i");
        } else {
            put("package", "package");
            put("access", "access");
            put("name", "name");
            put("desc", "desc");
            put("arguments", "arguments");
            put("returnType", "returnType");
            put("super", "super");
            put("methods", "methods");
            put("fields", "fields");
            put("interfaces", "interfaces");
        }
    }};

    public static void main(String[] args)
    {
        File output = new File("java.7.indexes.json");
        File folder = new File("java.7/");
        try (FileOutputStream fos = new FileOutputStream(output)) {
            packages.put("", root);
            recursive(folder);

            JsonObject arr = new JsonObject();
            for (String key : new ArrayList<>(root.keySet())) {
                arr.add(key, root.get(key));
                root.remove(key);
            }
            root.add("classes", arr);

            JsonArray clzQuick = new JsonArray();
            List<String> clzQuickIndexes = new ArrayList<>();
            int curr = 0, max = 7009; // Using looping, I figured 7009 resulted in the smallest json string
            for (Map.Entry<String, Integer> entry : sortByComparator(classCounts, false).entrySet()) {
                String key = entry.getKey();
//                if (!key.contains(".") && !(key.contains("[") || key.contains(";")))
//                    continue;
//                System.out.println(key + " -> " + entry.getValue());
                clzQuick.add(key);
                clzQuickIndexes.add(key);
                if (++curr == max) break;
            }
            root.add("clzQuick", clzQuick);

            final String strFields = shortNames.get("fields");
            final String strMethods = shortNames.get("methods");
            final String strDesc = shortNames.get("desc");
            final String strArgs = shortNames.get("arguments");
            final String strRet = shortNames.get("returnType");
            final String strSuper = shortNames.get("super");
            final String strInterfaces = shortNames.get("interfaces");
            for (Map.Entry<String, JsonObject> entry : classes.entrySet()) {
//                String name = entry.getKey();
                JsonObject elem = entry.getValue();
                JsonArray fields = (JsonArray) elem.get(strFields);
                if (fields != null) {
                    for (JsonElement fieldElem : fields) {
                        JsonObject field = (JsonObject) fieldElem;
                        JsonElement elemDesc = field.get(strDesc);
                        String elemDescAsString = elemDesc.getAsString();
                        int index = clzQuickIndexes.indexOf(elemDescAsString);
                        if (index >= 0) {
                            field.remove(strDesc);
                            field.addProperty(strDesc, index);
//                            System.out.println("Replacing field desc '" + elemDescAsString + "' by index " + index + "!");
                        }
                    }
                }
                JsonArray methods = (JsonArray) elem.get(strMethods);
                if (methods != null) {
                    for (JsonElement methodElem : methods) {
                        JsonObject method = (JsonObject) methodElem;
                        JsonElement elemArgs = method.get(strArgs);
                        if (elemArgs != null) {
                            JsonArray arguments = elemArgs.getAsJsonArray();
                            for (JsonElement elemArg : arguments.deepCopy()) {
                                String elemArgAsString = elemArg.getAsString();
                                int index = clzQuickIndexes.indexOf(elemArgAsString);
                                if (index >= 0) {
                                    arguments.remove(elemArg);
                                    arguments.add(index);
//                                    System.out.println("Replacing method argument '" + elemArgAsString + "' by index " + index + "!");
                                }
                            }
                            if (arguments.size() == 1) {
                                method.remove(strArgs);
                                method.add(strArgs, arguments.get(0));
                            }
                        }
                        JsonElement elemRet = method.get(strRet);
                        if (elemRet != null) {
                            JsonPrimitive returnType = elemRet.getAsJsonPrimitive();
                            String elemRetAsString = returnType.getAsString();
                            int index = clzQuickIndexes.indexOf(elemRetAsString);
                            if (index >= 0) {
                                method.remove(strRet);
                                method.add(strRet, new JsonPrimitive(index));
//                                System.out.println("Replacing method returnType '" + elemArgAsString + "' by index " + index + "!");
                            }
                        }
                    }
                }
                JsonArray interfaces = (JsonArray) elem.get(strInterfaces);
                if (interfaces != null) {
                    if (interfaces.isJsonArray()) {
                        if (interfaces.size() == 1) {
                            interfaces.remove(interfaces);
                            String itzAsString = interfaces.getAsString();
                            int index = clzQuickIndexes.indexOf(itzAsString);
                            if (index >= 0)
                                elem.add(strInterfaces, new JsonPrimitive(index));
                            else
                                elem.add(strInterfaces, new JsonPrimitive(itzAsString));
                        } else if (interfaces.size() > 1) {
                            for (JsonElement elemArg : interfaces.deepCopy()) {
                                String elemArgAsString = elemArg.getAsString();
                                int index = clzQuickIndexes.indexOf(elemArgAsString);
                                if (index >= 0) {
                                    interfaces.remove(elemArg);
                                    interfaces.add(index);
//                                    System.out.println("Replacing interface '" + elemArgAsString + "' by index " + index + "!");
                                }
                            }
                        }
                    } else if (interfaces.isJsonPrimitive()) {
                        JsonPrimitive elemPrim = interfaces.getAsJsonPrimitive();
                        if (elemPrim.isString()) {
                            String elemAsString = elemPrim.getAsString();
                            int index = clzQuickIndexes.indexOf(elemAsString);
                            if (index >= 0) {
                                elem.remove(strInterfaces);
                                elem.add(strInterfaces, new JsonPrimitive(index));
                            }
                        }
                    }
                }
                JsonPrimitive objSuper = (JsonPrimitive) elem.get(strSuper);
                if (objSuper != null) {
                    if (objSuper.isString()) {
                        String asString = objSuper.getAsString();
                        int index = clzQuickIndexes.indexOf(asString);
                        if (index >= 0) {
                            elem.remove(strSuper);
                            elem.add(strSuper, new JsonPrimitive(index));
                        }
                    }
                }
            }

            JsonArray pkgQuick = new JsonArray();
            List<String> pkgQuickIndexes = new ArrayList<>();
            Map<String, Integer> packagesCountV2 = new HashMap<>();
            for (Map.Entry<String, Integer> entry : sortByComparator(packagesCounts, false).entrySet()) {
                String key = entry.getKey();
//                if (!key.contains(".") && !(key.contains("[") || key.contains(";")))
//                    continue;
//                System.out.println(key + " -> " + entry.getValue());
                packagesCountV2.put(key, key.length() * entry.getValue());
//                pkgQuick.add(key);
//                pkgQuickIndexes.add(key);
//                if (++curr == max) break;
            }
            curr = 0; max = 780; // Figured out that 780 results in the smallest json string
            for (Map.Entry<String, Integer> entry : sortByComparator(packagesCountV2, false).entrySet()) {
                String key = entry.getKey();
                if (curr++ >= max) {
                    classesPackages.remove(key);
                    continue;
                }
//                if (!key.contains(".") && !(key.contains("[") || key.contains(";")))
//                    continue;
//                System.out.println(key + " -> " + entry.getValue());
                pkgQuick.add(key);
                pkgQuickIndexes.add(key);
            }
            root.add("pkgQuick", pkgQuick);

            for (Map.Entry<String, JsonElement> entry : new ArrayList<>(classesPackages.entrySet())) {
                String key = entry.getKey();
                JsonElement elem = entry.getValue();
                if (elem.isJsonArray()) {
                    JsonArray asJsonArray = elem.getAsJsonArray();
                    for (JsonElement subElem : asJsonArray.deepCopy()) {
                        if (!subElem.isJsonPrimitive()) continue;
                        if (subElem.getAsJsonPrimitive().isString()) {
                            String asString = subElem.getAsString();
                            int index = pkgQuickIndexes.indexOf(asString);
                            if (index >= 0) {
                                asJsonArray.remove(subElem);
                                asJsonArray.add(new JsonPrimitive(index));
                            }
                        }
                    }
                } else if (elem.isJsonPrimitive()) {
                    if (elem.getAsJsonPrimitive().isString()) {
                        String asString = elem.getAsString();
                        int index = pkgQuickIndexes.indexOf(asString);
                        if (index >= 0) {
                            classesPackages.remove(key);
                            classesPackages.add(key, new JsonPrimitive(index));
                        }
                    }
                }
            }
            root.add("classesPackages", classesPackages);

            Gson gson = new GsonBuilder()
//                    .setPrettyPrinting()
                    .create();
            fos.write(gson.toJson(root).getBytes(StandardCharsets.UTF_8));
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }

    private static <T1> Map<T1, Integer> sortByComparator(Map<T1, Integer> unsortMap, final boolean order)
    {
        List<Map.Entry<T1, Integer>> list = new LinkedList<>(unsortMap.entrySet());
        Collections.sort(list, new Comparator<Map.Entry<T1, Integer>>() {
            @Override
            public int compare(Map.Entry<T1, Integer> o1, Map.Entry<T1, Integer> o2) {
                if (order) return o1.getValue().compareTo(o2.getValue());
                else return o2.getValue().compareTo(o1.getValue());
            }
        });
        Map<T1, Integer> sortedMap = new LinkedHashMap<>();
        for (Map.Entry<T1, Integer> entry : list)
            sortedMap.put(entry.getKey(), entry.getValue());
        return sortedMap;
    }

    private static void recursive(File file)
    {
        if (file.isFile())
        {
            String name = file.getName();
            if (!name.endsWith(".class"))
                return;
            processClassFile(file);
            return;
        }
        File[] files = file.listFiles();
        if (files == null || files.length == 0)
            return;
        for (File f : files)
            recursive(f);
    }

//    static Map<Integer, Integer> accessCounts = new HashMap<>();

    private static void processClassFile(File file)
    {
        try (FileInputStream fis = new FileInputStream(file))
        {
            ClassReader reader = new ClassReader(fis);
            ClassNode node = new ClassNode();
            reader.accept(node, ClassReader.SKIP_CODE | ClassReader.SKIP_FRAMES);

            String strName = shortNames.get("name");
            String strDesc = shortNames.get("desc");
            String strArgs = shortNames.get("arguments");
            String strRet = shortNames.get("returnType");
            String strAccess = shortNames.get("access");

            JsonArray fields = new JsonArray();
            for (FieldNode field : node.fields) {
                JsonObject obj = new JsonObject();
                if (field.access != 1)
                    obj.addProperty(strAccess, field.access);
                obj.addProperty(strName, field.name);
                obj.addProperty(strDesc, extractFieldDesc(field.desc));
            //    if (field.value != null) obj.addProperty("value", field.value);
                fields.add(obj);
            }

            JsonArray methods = new JsonArray();
            for (MethodNode method : node.methods) {
                JsonObject obj = new JsonObject();
                if (method.access != 1)
                    obj.addProperty(strAccess, method.access);
                obj.addProperty(strName, method.name);
                JsonArray arguments = getArguments(method.desc);
                if (!arguments.isEmpty())
                    obj.add(strArgs, arguments);
                String returnType = getReturnType(method.desc);
                if (!returnType.equals("void"))
                    obj.addProperty(strRet, returnType);
                methods.add(obj);
            }

            String fullName = node.name.replace('/', '.');
            String pkg = null;
            String name = fullName;
            if (name.contains("."))
            {
                int index = name.lastIndexOf('.');
                pkg = name.substring(0, index);

                if (packagesCounts.containsKey(pkg))
                    packagesCounts.put(pkg, packagesCounts.get(pkg) + 1);
                else
                    packagesCounts.put(pkg, 1);

                name = name.substring(index + 1);
            }

            JsonArray itzs = new JsonArray();
            for (String itz : node.interfaces)
                itzs.add(itz.replace('/', '.'));

            JsonObject obj = new JsonObject();
//            if (pkg != null)
//                obj.addProperty(shortNames.get("package"), pkg);
//            obj.addProperty(shortNames.get("name"), name);
            if (node.access != 1)
                obj.addProperty(strAccess, node.access);
            if (node.superName != null && !node.superName.equals("java/lang/Object"))
                obj.addProperty(shortNames.get("super"), node.superName.replace('/', '.'));
            if (!itzs.isEmpty())
                obj.add(shortNames.get("interfaces"), itzs);
            if (!node.fields.isEmpty())
                obj.add(shortNames.get("fields"), fields);
            if (!node.methods.isEmpty())
                obj.add(shortNames.get("methods"), methods);

            if (pkg == null || pkg.isEmpty())
                root.add(name, obj);
            else {
                StringBuilder sb = new StringBuilder();
                boolean first = true;
                String lastPath = "";
                for (String pkgPart : pkg.split("\\.")) {
                    if (!first) sb.append('.');
                    sb.append(pkgPart);
                    String path = lastPath = sb.toString();
//                    System.out.println("! " + path);
                    if (packages.containsKey(path)) {
                        JsonObject objSub = packages.get(path);
                        if (first) root.add(pkgPart, objSub);
                        packages.put(path, objSub);
//                        System.out.println("3 Adding objSub: '" + path + "' -> " + objSub);
                    } else {
                        if (!first) {
                            String previousPart = path.substring(0, path.lastIndexOf('.'));
                            if (packages.containsKey(previousPart)) {
                                JsonObject prevObj = packages.get(previousPart);
                                JsonObject pkgObj = new JsonObject();
                                prevObj.add(pkgPart, pkgObj);
//                                System.out.println("2 Adding from previous part: '" + previousPart + "' to new part: '" + path + "' -> " + prevObj);
                                packages.put(path, pkgObj);
                                continue;
                            }
                        }
                        JsonObject pkgObj = new JsonObject();
                        if (first) root.add(pkgPart, pkgObj);
//                        System.out.println("1 Adding pkgObj: '" + path + "' -> " + pkgObj);
                        packages.put(path, pkgObj);
                    }
                    if (first) first = false;
                }

                packages.get(lastPath).add(name, obj);
                classes.put(fullName, obj);

                if (classesPackages.has(name)) {
                    JsonElement clzPkgs = classesPackages.get(name);
                    if (clzPkgs.isJsonArray()) {
                        clzPkgs.getAsJsonArray().add(pkg);
                    } else if (clzPkgs.isJsonPrimitive()) {
                        String old = clzPkgs.getAsString();
                        classesPackages.remove(name);
                        JsonArray arr = new JsonArray();
                        arr.add(old);
                        arr.add(pkg);
                        classesPackages.add(name, arr);
                    }
                }
                else
                    classesPackages.add(name, new JsonPrimitive(pkg));

//                System.out.println(name);
//                System.out.println();
//                for (Map.Entry<String, JsonObject> entry : packages.entrySet()) {
//                    System.out.println(entry.getKey() + ": " + entry.getValue());
//                }
//                System.out.println();
//                System.out.println(new GsonBuilder().setPrettyPrinting().create().toJson(root));
            }
        }
        catch (Throwable t)
        {
            t.printStackTrace();
        }
    }

    /*
    private static void updateAccessCount(int access)
    {
        if (accessCounts.containsKey(access))
            accessCounts.put(access, accessCounts.get(access) + 1);
        else
            accessCounts.put(access, 1);
    }
    */

    private static String extractFieldDesc(String desc)
    {
        Type type = Type.getType(desc);
        String ret = type.getClassName().replace('/', '.');
        if (classCounts.containsKey(ret))
            classCounts.put(ret, classCounts.get(ret) + 1);
        else
            classCounts.put(ret, 1);
        return ret;
    }

    private static JsonArray getArguments(String desc)
    {
        JsonArray arguments = new JsonArray();
        Type[] types = Type.getArgumentTypes(desc);
        for (Type type : types)
        {
            String ret = type.getClassName().replace('/', '.');
            if (classCounts.containsKey(ret))
                classCounts.put(ret, classCounts.get(ret) + 1);
            else
                classCounts.put(ret, 1);
            arguments.add(ret);
        }
        return arguments;
    }

    private static String getReturnType(String desc)
    {
        Type type = Type.getReturnType(desc);
        String ret = type.getClassName().replace('/', '.');
        if (ret.equals("void"))
            return ret;
        if (classCounts.containsKey(ret))
            classCounts.put(ret, classCounts.get(ret) + 1);
        else
            classCounts.put(ret, 1);
        return ret;
    }

}
