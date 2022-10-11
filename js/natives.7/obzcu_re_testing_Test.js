customRets['obzcu/re/testing/Test'] = (name_desc, stack, locals, clz = false) =>
{
    switch (name_desc)
    {
        case 'println (Ljava/lang/Object;)V': // static call
            console_println(locals[0].toString());
            return;
        case 'print (Ljava/lang/Object;)V': // static call
            console_print('print', locals[0].toString());
            return;
        default: return;
    }
};

customRetsHas['obzcu/re/testing/Test'] = (name_desc) =>
{
    switch (name_desc)
    {
        case 'print (Ljava/lang/Object;)V': return true;
        case 'println (Ljava/lang/Object;)V': return true;
        default: return false;
    }
};