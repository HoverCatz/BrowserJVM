customRets['java/lang/Class'] = (name_desc, stack, locals, clz = false) =>
{
    switch (name_desc)
    {
        case 'registerNatives ()V': return;
        case 'toString ()Ljava/lang/String;':
        {
            requireClz(clz);
            return 'class ' + clz.name.replaceAll('/', '.');
        }
        case 'getName ()Ljava/lang/String;':
        {
            requireClz(clz);
            return locals[0].name.replaceAll('/', '.');
        }
        case 'isInterface ()Z':
        {
            requireClz(clz);
            console_println("Class.isInterface override! clz:", clz);
            return;
        }
        default: return;
    }
};

customRetsHas['java/lang/Class'] = (name_desc) =>
{
    switch (name_desc)
    {
        case 'registerNatives ()V':
        case 'toString ()Ljava/lang/String;':
        case 'getName ()Ljava/lang/String;':
        case 'isInterface ()Z': return true;
        default: return false;
    }
};