customRets['java/io/PrintStream'] = (name_desc, stack, locals, clz = false) =>
{
    switch (name_desc)
    {
        case 'println (Ljava/lang/Object;)V':
        case 'println (Ljava/lang/String;)V':
        {
            requireClz(clz);
            console.log(locals[1]);
            return;
        }
        default: return;
    }
};

customRetsHas['java/io/PrintStream'] = (name_desc) =>
{
    switch (name_desc)
    {
        case 'println (Ljava/lang/Object;)V':
        case 'println (Ljava/lang/String;)V': return true;
        default: return false;
    }
};