customRets['java/lang/Throwable'] = (name_desc, stack, locals, clz = false) =>
{
    switch (name_desc)
    {
        case 'fillInStackTrace (I)Ljava/lang/Throwable;':
            console.log(clz);
            requireClz(clz);
            return null; // return null instead of a throwable instance
        default: return;
    }
};

customRetsHas['java/lang/Throwable'] = (name_desc) =>
{
    switch (name_desc)
    {
        case 'fillInStackTrace (I)Ljava/lang/Throwable;': return true;
        default: return false;
    }
};