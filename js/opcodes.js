
// TODO settare i flags attraverso una fn

var opcodes_cb = []

opcodes_cb[0x00] = function(){ // BRK
    GLOBAL(cpu6502).clock_enable = 0
}

opcodes_cb[0x01] = function(){ // ORA INDX
    var addr = fetch_byte() + GLOBAL(cpu6502).regX
    var value = mem_rd(addr) + (mem_rd(addr+1) << 8)
    GLOBAL(cpu6502).regA |= value
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f
}

opcodes_cb[0x05] = function(){ // ORA ZP
    var zp = fetch_byte();
    GLOBAL(cpu6502).regA |= mem_rd( zp );
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x06] = function(){ // ASL ZP
    var zp = fetch_byte();
    var value = mem_rd( zp );
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP & 0xfe) | ((value>>7)&1);
    value = value << 1;
    mem_wr( zp, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x08] = function(){ // PHP
    stackPush( GLOBAL(cpu6502).regP );
}

opcodes_cb[0x09] = function(){ // ORA IMM
    GLOBAL(cpu6502).regA |= fetch_byte();
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x0a] = function(){ // ASL IMPL
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP & 0xfe) | ((GLOBAL(cpu6502).regA>>7)&1);
    GLOBAL(cpu6502).regA = GLOBAL(cpu6502).regA<<1;
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x0d] = function(){ // ORA ABS
    GLOBAL(cpu6502).regA |= mem_rd( fetch_word());
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x0e] = function(){ // ASL ABS
    var addr = fetch_word();
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP & 0xfe) | ((value>>7)&1);
    value = value << 1;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 2;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x10] = function(){ // BPL
    var offset = fetch_byte();
    if( (GLOBAL(cpu6502).regP & 0x80) == 0 ) jumpBranch( offset );
}

opcodes_cb[0x11] = function(){ // ORA INDY
    var zp = fetch_byte();
    var value = mem_rd(zp) + (mem_rd(zp+1)<<8) + GLOBAL(cpu6502).regY;
    GLOBAL(cpu6502).regA |= mem_rd(value);
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x15] = function(){ // ORA ZPX
    var addr = (fetch_byte() + GLOBAL(cpu6502).regX) & 0xff;
    GLOBAL(cpu6502).regA |= mem_rd(addr);
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x16] = function(){ // ASL ZPX
    var addr = (fetch_byte() + GLOBAL(cpu6502).regX) & 0xff;
    var value = mem_rd(addr);
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP & 0xfe) | ((value>>7)&1);
    value = value << 1;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x18] = function(){ // CLC
    GLOBAL(cpu6502).regP &= 0xfe;
}

opcodes_cb[0x19] = function(){ // ORA ABSY
    var addr = fetch_word() + GLOBAL(cpu6502).regY;
    GLOBAL(cpu6502).regA |= mem_rd( addr );
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x1d] = function(){ // ORA ABSX
    var addr = fetch_word() + GLOBAL(cpu6502).regX;
    GLOBAL(cpu6502).regA |= mem_rd( addr );
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x1e] = function(){ // ASL ABSX
    var addr = fetch_word() + GLOBAL(cpu6502).regX;
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP & 0xfe) | ((value>>7)&1);
    value = value << 1;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x20] = function(){ // JSR ABS
    var addr = fetch_word();
    var currAddr = GLOBAL(cpu6502).regPC-1;
    stackPush( ((currAddr >> 8) & 0xff) );
    stackPush( (currAddr & 0xff) );
    GLOBAL(cpu6502).regPC = addr;
}

opcodes_cb[0x21] = function(){ // AND INDX
    var addr = (fetch_byte() + GLOBAL(cpu6502).regX)&0xff;
    var value = mem_rd( addr ) + (mem_rd( addr+1) << 8);
    GLOBAL(cpu6502).regA &= value;
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x24] = function(){ // BIT ZP
    var zp = fetch_byte();
    var value = mem_rd( zp );
    if( value & GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP & 0x3f) | (value & 0xc0);
}

opcodes_cb[0x25] = function(){ // AND ZP
    var zp = fetch_byte();
    GLOBAL(cpu6502).regA &= mem_rd( zp );
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 2;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP &= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x26] = function(){ // ROL ZP
    var sf = (GLOBAL(cpu6502).regP & 1);
    var addr = fetch_byte();
    var value = mem_rd( addr ); //  & GLOBAL(cpu6502).regA;  -- Thanks DMSC ;)
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP & 0xfe) | ((value>>7)&1);
    value = value << 1;
    value |= sf;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x28] = function(){ // PLP
    GLOBAL(cpu6502).regP = stackPop() | 0x20;
}

opcodes_cb[0x29] = function(){ // AND IMM
    GLOBAL(cpu6502).regA &= fetch_byte();
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x2a] = function(){ // ROL A
    var sf = (GLOBAL(cpu6502).regP&1);
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP&0xfe) | ((GLOBAL(cpu6502).regA>>7)&1);
    GLOBAL(cpu6502).regA = GLOBAL(cpu6502).regA << 1;
    GLOBAL(cpu6502).regA |= sf;
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x2c] = function(){ // BIT ABS
    var value = mem_rd( fetch_word());
    if( value & GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP & 0x3f) | (value & 0xc0);
}

opcodes_cb[0x2d] = function(){ // AND ABS
    var value = mem_rd( fetch_word());
    GLOBAL(cpu6502).regA &= value;
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x2e] = function(){ // ROL ABS
    var sf = GLOBAL(cpu6502).regP & 1;
    var addr = fetch_word();
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP & 0xfe) | ((value>>7)&1);
    value = value << 1;
    value |= sf;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x30] = function(){ // BMI
    var offset = fetch_byte();
    if( GLOBAL(cpu6502).regP & 0x80 ) jumpBranch( offset );
}

opcodes_cb[0x31] = function(){ // AND INDY
    var zp = fetch_byte();
    var value = mem_rd(zp) + (mem_rd(zp+1)<<8) + GLOBAL(cpu6502).regY;
    GLOBAL(cpu6502).regA &= mem_rd(value);
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x35] = function(){ // AND INDX
    var zp = fetch_byte();
    var value = mem_rd(zp) + (mem_rd(zp+1)<<8) + GLOBAL(cpu6502).regX;
    GLOBAL(cpu6502).regA &= mem_rd(value);
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x36] = function(){ // ROL ZPX
    var sf = GLOBAL(cpu6502).regP & 1;
    var addr = (fetch_byte() + GLOBAL(cpu6502).regX) & 0xff;
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP & 0xfe) | ((value>>7)&1);
    value = value << 1;
    value |= sf;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x38] = function(){ // SEC
    GLOBAL(cpu6502).regP |= 1;
}

opcodes_cb[0x39] = function(){ // AND ABSY
    var addr = fetch_word() + GLOBAL(cpu6502).regY;
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regA &= value;
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x3d] = function(){ // AND ABSX
    var addr = fetch_word() + GLOBAL(cpu6502).regX;
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regA &= value;
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x3e] = function(){ // ROL ABSX
    var sf = GLOBAL(cpu6502).regP&1;
    var addr = fetch_word() + GLOBAL(cpu6502).regX;
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP & 0xfe) | ((value>>7)&1);
    value = value << 1;
    value |= sf;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}


opcodes_cb[0x40] = function(){ // RTI (unsupported, =NOP)
}


opcodes_cb[0x41] = function(){ // EOR INDX
    var zp = (fetch_byte() + GLOBAL(cpu6502).regX)&0xff;
    var value = mem_rd(zp) + (mem_rd(zp+1)<<8);
    GLOBAL(cpu6502).regA ^= mem_rd(value);
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x45] = function(){ // EOR ZPX
    var addr = (fetch_byte() + GLOBAL(cpu6502).regX) & 0xff;
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regA ^= value;
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x46] = function(){ // LSR ZP
    var addr = fetch_byte() & 0xff;
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP & 0xfe) | (value&1);
    value = value >> 1;
    mem_wr( addr, value );
    if( value != 0 ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 2;
    if( (value&0x80) == 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x48] = function(){ // PHA
    stackPush( GLOBAL(cpu6502).regA );
}

opcodes_cb[0x49] = function(){ // EOR IMM
    GLOBAL(cpu6502).regA ^= fetch_byte();
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x4a] = function(){ // LSR
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP&0xfe) | (GLOBAL(cpu6502).regA&1);
    GLOBAL(cpu6502).regA = GLOBAL(cpu6502).regA >> 1;
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x4c] = function(){ // JMP abs
    GLOBAL(cpu6502).regPC = fetch_word();
}

opcodes_cb[0x4d] = function(){ // EOR abs
    var addr = fetch_word();
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regA ^= value;
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x4e] = function(){ // LSR abs
    var addr = fetch_word();
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP&0xfe)|(value&1);
    value = value >> 1;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x50] = function(){ // BVC (on overflow clear)
    var offset = fetch_byte();
    if( (GLOBAL(cpu6502).regP & 0x40) == 0 ) jumpBranch( offset );
}

opcodes_cb[0x51] = function(){ // EOR INDY
    var zp = fetch_byte();
    var value = mem_rd(zp) + (mem_rd(zp+1)<<8) + GLOBAL(cpu6502).regY;
    GLOBAL(cpu6502).regA ^= mem_rd(value);
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x55] = function(){ // EOR ZPX
    var addr = (fetch_byte() + GLOBAL(cpu6502).regX) & 0xff;
    GLOBAL(cpu6502).regA ^= mem_rd( addr );
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x56] = function(){ // LSR ZPX
    var addr = (fetch_byte() + GLOBAL(cpu6502).regX) & 0xff;
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP&0xfe) | (value&1);
    value = value >> 1;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x58] = function(){ // CLI (does nothing)
}

opcodes_cb[0x59] = function(){ // EOR ABSY
    var addr = fetch_word() + GLOBAL(cpu6502).regY;
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regA ^= value;
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x5d] = function(){ // EOR ABSX
    var addr = fetch_word() + GLOBAL(cpu6502).regX;
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regA ^= value;
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x5e] = function(){ // LSR ABSX
    var addr = fetch_word() + GLOBAL(cpu6502).regX;
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP&0xfe) | (value&1);
    value = value >> 1;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x60] = function(){ // RTS
    GLOBAL(cpu6502).regPC = (stackPop()+1) | (stackPop()<<8);
}

opcodes_cb[0x61] = function(){ // ADC INDX
    var zp = (fetch_byte() + GLOBAL(cpu6502).regX)&0xff;
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8);
    var value = mem_rd( addr );
    testADC( value );
}

opcodes_cb[0x65] = function(){ // ADC ZP
    var addr = fetch_byte();
    var value = mem_rd( addr );
    testADC( value );
}




opcodes_cb[0x66] = function(){ // ROR ZP
    var sf = GLOBAL(cpu6502).regP&1;
    var addr = fetch_byte();
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP&0xfe)|(value&1);
    value = value >> 1;
    if( sf ) value |= 0x80;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x68] = function(){ // PLA
    GLOBAL(cpu6502).regA = stackPop();
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x69] = function(){ // ADC IMM
    var value = fetch_byte();
    testADC( value );
}

opcodes_cb[0x6a] = function(){ // ROR A
    var sf = GLOBAL(cpu6502).regP&1;
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP&0xfe) | (GLOBAL(cpu6502).regA&1);
    GLOBAL(cpu6502).regA = GLOBAL(cpu6502).regA >> 1;
    if( sf ) GLOBAL(cpu6502).regA |= 0x80;
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x6c] = function(){ // JMP INDIR
//      GLOBAL(cpu6502).regPC = mem_rd(fetch_byte()) + (mem_rd(fetch_byte())<<8);
}



opcodes_cb[0x6d] = function(){ // ADC ABS
    var addr = fetch_word();
    var value = mem_rd( addr );
    testADC( value );
}

opcodes_cb[0x6e] = function(){ // ROR ABS
    var sf = GLOBAL(cpu6502).regP&1;
    var addr = fetch_word();
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP&0xfe)|(value&1);
    value = value >> 1;
    if( sf ) value |= 0x80;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x70] = function(){ // BVS (branch on overflow set)
    var offset = fetch_byte();
    if( GLOBAL(cpu6502).regP & 0x40 ) jumpBranch( offset );
}

opcodes_cb[0x71] = function(){ // ADC INY
    var zp = fetch_byte();
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8);
    var value = mem_rd( addr + GLOBAL(cpu6502).regY );
    testADC( value );
}

opcodes_cb[0x75] = function(){ // ADC ZPX
    var addr = (fetch_byte() + GLOBAL(cpu6502).regX) & 0xff;
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP&0xfe) | (value&1);
    testADC( value );
}

opcodes_cb[0x76] = function(){ // ROR ZPX
    var sf = (GLOBAL(cpu6502).regP&1);
    var addr = (fetch_byte() + GLOBAL(cpu6502).regX) & 0xff;
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP&0xfe) | (value&1);
    value = value >> 1;
    if( sf ) value |= 0x80;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x78] = function(){ // SEI (does nothing)
}

opcodes_cb[0x79] = function(){ // ADC ABSY
    var addr = fetch_word();
    var value = mem_rd( addr + GLOBAL(cpu6502).regY );
    testADC( value );
}

opcodes_cb[0x7d] = function(){ // ADC ABSX
    var addr = fetch_word();
    var value = mem_rd( addr + GLOBAL(cpu6502).regX );
    testADC( value );
}

opcodes_cb[0x7e] = function(){ // ROR ABSX
    var sf = GLOBAL(cpu6502).regP&1;
    var addr = fetch_word() + GLOBAL(cpu6502).regX;
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP&0xfe) | (value&1);
    value = value >> 1;
    if( value ) value |= 0x80;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}




opcodes_cb[0x81] = function(){ // STA INDX
    var zp = (fetch_byte()+GLOBAL(cpu6502).regX)&0xff;
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8);
    mem_wr( addr, GLOBAL(cpu6502).regA );
}

opcodes_cb[0x84] = function(){ // STY ZP
    mem_wr( fetch_byte(), GLOBAL(cpu6502).regY );
}

opcodes_cb[0x85] = function(){ // STA ZP
    mem_wr( fetch_byte(), GLOBAL(cpu6502).regA );
}

opcodes_cb[0x86] = function(){ // STX ZP
    mem_wr( fetch_byte(), GLOBAL(cpu6502).regX );
}

opcodes_cb[0x88] = function(){ // DEY (1 byte)
    GLOBAL(cpu6502).regY = (GLOBAL(cpu6502).regY-1) & 0xff;
    if( GLOBAL(cpu6502).regY ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regY & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x8a] = function(){ // TXA (1 byte);
    GLOBAL(cpu6502).regA = GLOBAL(cpu6502).regX & 0xff;
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x8c] = function(){ // STY abs
    mem_wr( fetch_word(), GLOBAL(cpu6502).regY );
}

opcodes_cb[0x8d] = function(){ // STA ABS (3 bytes)
    mem_wr( fetch_word(), GLOBAL(cpu6502).regA );
}

opcodes_cb[0x8e] = function(){ // STX abs
    mem_wr( fetch_word(), GLOBAL(cpu6502).regX );
}

opcodes_cb[0x90] = function(){ // BCC (branch on carry clear)
    var offset = fetch_byte();
    if( ( GLOBAL(cpu6502).regP & 1 ) == 0 ) jumpBranch( offset );
}




opcodes_cb[0x91] = function(){ // STA INDY
    var zp = fetch_byte();
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8) + GLOBAL(cpu6502).regY;
    mem_wr( addr, GLOBAL(cpu6502).regA );
}

opcodes_cb[0x94] = function(){ // STY ZPX
    mem_wr( fetch_byte() + GLOBAL(cpu6502).regX, GLOBAL(cpu6502).regY );
}

opcodes_cb[0x95] = function(){ // STA ZPX
    mem_wr( fetch_byte() + GLOBAL(cpu6502).regX, GLOBAL(cpu6502).regA );
}

opcodes_cb[0x96] = function(){ // STX ZPY
    mem_wr( fetch_byte() + GLOBAL(cpu6502).regY, GLOBAL(cpu6502).regX );
}

opcodes_cb[0x98] = function(){ // TYA
    GLOBAL(cpu6502).regA = GLOBAL(cpu6502).regY & 0xff;
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0x99] = function(){ // STA ABSY
    mem_wr( fetch_word() + GLOBAL(cpu6502).regY, GLOBAL(cpu6502).regA );
}

opcodes_cb[0x9a] = function(){ // TXS
    GLOBAL(cpu6502).regSP = GLOBAL(cpu6502).regX & 0xff;
}

opcodes_cb[0x9d] = function(){ // STA ABSX
    mem_wr( fetch_word() + GLOBAL(cpu6502).regX, GLOBAL(cpu6502).regA );
}

opcodes_cb[0xa0] = function(){ // LDY IMM
    GLOBAL(cpu6502).regY = fetch_byte();
    if( GLOBAL(cpu6502).regY ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regY & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xa1] = function(){ // LDA INDX
    var zp = (fetch_byte()+GLOBAL(cpu6502).regX)&0xff;
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8);
    GLOBAL(cpu6502).regA = mem_rd( addr );
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xa2] = function(){ // LDX IMM
    GLOBAL(cpu6502).regX = fetch_byte();
    if( GLOBAL(cpu6502).regX ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regX & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xa4] = function(){ // LDY ZP
    GLOBAL(cpu6502).regY = mem_rd( fetch_byte() );
    if( GLOBAL(cpu6502).regY ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regY & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xa5] = function(){ // LDA ZP
    GLOBAL(cpu6502).regA = mem_rd( fetch_byte() );
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xa6] = function(){ // LDX ZP
    GLOBAL(cpu6502).regX = mem_rd( fetch_byte() );
    if( GLOBAL(cpu6502).regX ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regX & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xa8] = function(){ // TAY
    GLOBAL(cpu6502).regY = GLOBAL(cpu6502).regA & 0xff;
    if( GLOBAL(cpu6502).regY ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regY & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xa9] = function(){ // LDA IMM
    GLOBAL(cpu6502).regA = fetch_byte();
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xaa] = function(){ // TAX
    GLOBAL(cpu6502).regX = GLOBAL(cpu6502).regA & 0xff;
    if( GLOBAL(cpu6502).regX ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regX & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xac] = function(){ // LDY ABS
    GLOBAL(cpu6502).regY = mem_rd( fetch_word());
    if( GLOBAL(cpu6502).regY ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regY & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xad] = function(){ // LDA ABS
    GLOBAL(cpu6502).regA = mem_rd( fetch_word());
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xae] = function(){ // LDX ABS
    GLOBAL(cpu6502).regX = mem_rd( fetch_word());
    if( GLOBAL(cpu6502).regX ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regX & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xb0] = function(){ // BCS
    var offset = fetch_byte();
    if( GLOBAL(cpu6502).regP & 1 ) jumpBranch( offset );
}

opcodes_cb[0xb1] = function(){ // LDA INDY
    var zp = fetch_byte();
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8) + GLOBAL(cpu6502).regY;
    GLOBAL(cpu6502).regA = mem_rd( addr );
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xb4] = function(){ // LDY ZPX
    GLOBAL(cpu6502).regY = mem_rd( fetch_byte() + GLOBAL(cpu6502).regX );
    if( GLOBAL(cpu6502).regY ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regY & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xb5] = function(){ // LDA ZPX
    GLOBAL(cpu6502).regA = mem_rd( (fetch_byte() + GLOBAL(cpu6502).regX) & 0xff );
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xb6] = function(){ // LDX ZPY
    GLOBAL(cpu6502).regX = mem_rd( fetch_byte() + GLOBAL(cpu6502).regY );
    if( GLOBAL(cpu6502).regX ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regX & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xb8] = function(){ // CLV
    GLOBAL(cpu6502).regP &= 0xbf;
}

opcodes_cb[0xb9] = function(){ // LDA ABSY
    var addr = fetch_word() + GLOBAL(cpu6502).regY;
    GLOBAL(cpu6502).regA = mem_rd( addr );
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}


opcodes_cb[0xba] = function(){ // TSX
    GLOBAL(cpu6502).regX = GLOBAL(cpu6502).regSP & 0xff;
}

opcodes_cb[0xbc] = function(){ // LDY ABSX
    var addr = fetch_word() + GLOBAL(cpu6502).regX;
    GLOBAL(cpu6502).regY = mem_rd( addr );
    if( GLOBAL(cpu6502).regY ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regY & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xbd] = function(){ // LDA ABSX
    var addr = fetch_word() + GLOBAL(cpu6502).regX;
    GLOBAL(cpu6502).regA = mem_rd( addr );
    if( GLOBAL(cpu6502).regA ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regA & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xbe] = function(){ // LDX ABSY
    var addr = fetch_word() + GLOBAL(cpu6502).regY;
    GLOBAL(cpu6502).regX = mem_rd( addr );
    if( GLOBAL(cpu6502).regX ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regX & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xc0] = function(){ // CPY IMM
    var value = fetch_byte();
    if( (GLOBAL(cpu6502).regY+value) > 0xff ) GLOBAL(cpu6502).regP |= 1; else GLOBAL(cpu6502).regP &= 0xfe;
    var ov = value;
    value = (GLOBAL(cpu6502).regY-value);
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xc1] = function(){ // CMP INDY
    var zp = fetch_byte();
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8) + GLOBAL(cpu6502).regY;
    var value = mem_rd( addr );
    doCompare( GLOBAL(cpu6502).regA, value );
}

opcodes_cb[0xc4] = function(){ // CPY ZP
    var value = mem_rd( fetch_byte() );
    doCompare( GLOBAL(cpu6502).regY, value );
}

opcodes_cb[0xc5] = function(){ // CMP ZP
    var value = mem_rd( fetch_byte() );
    doCompare( GLOBAL(cpu6502).regA, value );
}


opcodes_cb[0xc6] = function(){ // DEC ZP
    var zp = fetch_byte();
    var value = mem_rd( zp );
    --value;
    mem_wr( zp, value&0xff );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xc8] = function(){ // INY
    GLOBAL(cpu6502).regY = (GLOBAL(cpu6502).regY + 1) & 0xff;
    if( GLOBAL(cpu6502).regY ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regY & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xc9] = function(){ // CMP IMM
    var value = fetch_byte();
    doCompare( GLOBAL(cpu6502).regA, value );
}

opcodes_cb[0xca] = function(){ // DEX
    GLOBAL(cpu6502).regX = (GLOBAL(cpu6502).regX-1) & 0xff;
    if( GLOBAL(cpu6502).regX ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regX & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xcc] = function(){ // CPY ABS
    var value = mem_rd( fetch_word());
    doCompare( GLOBAL(cpu6502).regY, value );
}

opcodes_cb[0xcd] = function(){ // CMP ABS
    var value = mem_rd( fetch_word());
    doCompare( GLOBAL(cpu6502).regA, value );
}

opcodes_cb[0xce] = function(){ // DEC ABS
    var addr = fetch_word();
    var value = mem_rd( addr );
    --value;
    value = value&0xff;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xd0] = function(){ // BNE
    var offset = fetch_byte();
//      if( (GLOBAL(cpu6502).regP&2)==0 ){ oldPC = GLOBAL(cpu6502).regPC; jumpBranch( offset ); message( "Jumping from " + hex16(oldPC) + " to " + hex16(GLOBAL(cpu6502).regPC) ); } else { message( "NOT jumping!" ); }
    if( (GLOBAL(cpu6502).regP&2)==0 ) jumpBranch( offset );
}

opcodes_cb[0xd1] = function(){ // CMP INDY
    var zp = fetch_byte();
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8) + GLOBAL(cpu6502).regY;
    var value = mem_rd( addr );
    doCompare( GLOBAL(cpu6502).regA, value );
}


opcodes_cb[0xd5] = function(){ // CMP ZPX
    var value = mem_rd( fetch_byte() + GLOBAL(cpu6502).regX );
    doCompare( GLOBAL(cpu6502).regA, value );
}

opcodes_cb[0xd6] = function(){ // DEC ZPX
    var addr = fetch_byte() + GLOBAL(cpu6502).regX;
    var value = mem_rd( addr );
    --value;
    value = value&0xff;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xd8] = function(){ // CLD (CLear Decimal)
    GLOBAL(cpu6502).regP &= 0xf7;
}

opcodes_cb[0xd9] = function(){ // CMP ABSY
    var addr = fetch_word() + GLOBAL(cpu6502).regY;
    var value = mem_rd( addr );
    doCompare( GLOBAL(cpu6502).regA, value );
}

opcodes_cb[0xdd] = function(){ // CMP ABSX
    var addr = fetch_word() + GLOBAL(cpu6502).regX;
    var value = mem_rd( addr );
    doCompare( GLOBAL(cpu6502).regA, value );
}

opcodes_cb[0xde] = function(){ // DEC ABSX
    var addr = fetch_word() + GLOBAL(cpu6502).regX;
    var value = mem_rd( addr );
    --value;
    value = value&0xff;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xe0] = function(){ // CPX IMM
    var value = fetch_byte();
    doCompare( GLOBAL(cpu6502).regX, value );
}


opcodes_cb[0xe1] = function(){ // SBC INDX
    var zp = (fetch_byte()+GLOBAL(cpu6502).regX)&0xff;
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8);
    var value = mem_rd( addr );
    testSBC( value );
}

opcodes_cb[0xe4] = function(){ // CPX ZP
    var value = mem_rd( fetch_byte() );
    doCompare( GLOBAL(cpu6502).regX, value );
}

opcodes_cb[0xe5] = function(){ // SBC ZP
    var addr = fetch_byte();
    var value = mem_rd( addr );
    testSBC( value );
}

opcodes_cb[0xe6] = function(){ // INC ZP
    var zp = fetch_byte();
    var value = mem_rd( zp );
    ++value;
    value = (value)&0xff;
    mem_wr( zp, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xe8] = function(){ // INX
    GLOBAL(cpu6502).regX = (GLOBAL(cpu6502).regX + 1) & 0xff;
    if( GLOBAL(cpu6502).regX ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( GLOBAL(cpu6502).regX & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xe9] = function(){ // SBC IMM
    var value = fetch_byte();
    testSBC( value );
}

opcodes_cb[0xea] = function(){ // NOP
}


opcodes_cb[0xec] = function(){ // CPX ABS
    var value = mem_rd( fetch_word());
    doCompare( GLOBAL(cpu6502).regX, value );
}

opcodes_cb[0xed] = function(){ // SBC ABS
    var addr = fetch_word();
    var value = mem_rd( addr );
    testSBC( value );
}

opcodes_cb[0xee] = function(){ // INC ABS
    var addr = fetch_word();
    var value = mem_rd( addr );
    ++value;
    value = (value)&0xff;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xf0] = function(){ // BEQ
    var offset = fetch_byte();
    if( GLOBAL(cpu6502).regP&2 ) jumpBranch( offset );
}

opcodes_cb[0xf1] = function(){ // SBC INDY
    var zp = fetch_byte();
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8);
    var value = mem_rd( addr + GLOBAL(cpu6502).regY );
    testSBC( value );
}

opcodes_cb[0xf5] = function(){ // SBC ZPX
    var addr = (fetch_byte() + GLOBAL(cpu6502).regX)&0xff;
    var value = mem_rd( addr );
    GLOBAL(cpu6502).regP = (GLOBAL(cpu6502).regP&0xfe)|(value&1);
    testSBC( value );
}

opcodes_cb[0xf6] = function(){ // INC ZPX
    var addr = fetch_byte() + GLOBAL(cpu6502).regX;
    var value = mem_rd( addr );
    ++value;
    value=value&0xff;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

opcodes_cb[0xf8] = function(){ // SED
    GLOBAL(cpu6502).regP |= 8;
}

opcodes_cb[0xf9] = function(){ // SBC ABSY
    var addr = fetch_word();
    var value = mem_rd( addr + GLOBAL(cpu6502).regY );
    testSBC( value );
}

opcodes_cb[0xfd] = function(){ // SBC ABSX
    var addr = fetch_word();
    var value = mem_rd( addr + GLOBAL(cpu6502).regX );
    testSBC( value );
}

opcodes_cb[0xfe] = function(){ // INC ABSX
    var addr = fetch_word() + GLOBAL(cpu6502).regX;
    var value = mem_rd( addr );
    ++value;
    value = value&0xff;
    mem_wr( addr, value );
    if( value ) GLOBAL(cpu6502).regP &= 0xfd; else GLOBAL(cpu6502).regP |= 0x02;
    if( value & 0x80 ) GLOBAL(cpu6502).regP |= 0x80; else GLOBAL(cpu6502).regP &= 0x7f;
}

