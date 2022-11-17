customRets['java/lang/System'] = (name_desc, stack, locals, clz = false) =>
{
    switch (name_desc)
    {
        case 'registerNatives ()V': return;
        case 'toString ()Ljava/lang/String;':
        {
            requireClz(clz);
            return clz.name;
        }
        case 'isInterface ()Z':
        {
            requireClz(clz);
            console.log("Class.isInterface override! clz:", clz);
            return;
        }
        case 'out Ljava/io/PrintStream;':
        {
            return null;
        }
        default: return;
    }
};

customRetsHas['java/lang/System'] = (name_desc) =>
{
    switch (name_desc)
    {
        case 'registerNatives ()V':
        case 'toString ()Ljava/lang/String;':
        case 'isInterface ()Z':
        case 'out Ljava/io/PrintStream;': return true;
        default: return false;
    }
};