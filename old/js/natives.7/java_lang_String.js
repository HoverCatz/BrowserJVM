customRets['java/lang/String'] = (name_desc, stack, locals, clz = false) =>
{
    switch (name_desc)
    {
        case 'intern ()Ljava/lang/String;':
            requireClz(clz);
            return clz.execute('toString', '()Ljava/lang/String;');
        default: return;
    }
};

customRetsHas['java/lang/String'] = (name_desc) =>
{
    switch (name_desc)
    {
        case 'intern ()Ljava/lang/String;': return true;
        default: return false;
    }
};