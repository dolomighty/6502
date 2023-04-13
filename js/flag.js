
function flag_zero( opt_set ){
    if(DEFINED(opt_set)){
        if(opt_set) GLOBAL(cpu6502).regP |=  0x02
        else        GLOBAL(cpu6502).regP &= ~0x02
    }
    return (GLOBAL(cpu6502).regP & 0x02) != 0
}

function flag_sign( opt_set ){
    if(DEFINED(opt_set)){
        if(opt_set) GLOBAL(cpu6502).regP |=  0x80
        else        GLOBAL(cpu6502).regP &= ~0x80
    }
    return (GLOBAL(cpu6502).regP & 0x80) != 0
}

function flag_carry( opt_set ){
    if(DEFINED(opt_set)){
        if(opt_set) GLOBAL(cpu6502).regP |=  0x01
        else        GLOBAL(cpu6502).regP &= ~0x01
    }
    return (GLOBAL(cpu6502).regP & 0x01) != 0
}

function flag_overflow( opt_set ){
    if(DEFINED(opt_set)){
        if(opt_set) GLOBAL(cpu6502).regP |=  0x40
        else        GLOBAL(cpu6502).regP &= ~0x40
    }
    return (GLOBAL(cpu6502).regP & 0x40) != 0
}



