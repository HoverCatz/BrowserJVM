customRets['java/lang/Object'] = async (name_desc, stack, locals, clz = false) =>
{
    switch (name_desc)
    {
        case 'getClass ()Ljava/lang/Class;':
        {
            requireClz(clz);
            let classObject;
            if (clz.classObject)
                classObject = clz.classObject;
            else
                clz.classObject = classObject = await (await findClass('java/lang/Class')).newInstance();
            return classObject;
        }
        default: return;
    }
};

customRetsHas['java/lang/Object'] = (name_desc) =>
{
    switch (name_desc)
    {
        case 'getClass ()Ljava/lang/Class;': return true;
        default: return false;
    }
};