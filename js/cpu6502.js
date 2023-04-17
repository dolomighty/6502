
/*

6502 assembler and emulator in Javascript
(C)2006-2009 Stian Soreng - www.6502asm.com

Released under the GNU General Public License
see http://gnu.org/licenses/gpl.html

2018-01-12 16:02:52
ridotte drasticamente le funzionalità rispetto all'originale
l'idea è che questo modulo faccia solo l'emulazione del 6502
una volta che riesce ad interpretare correttamente il binario
ci inventeremo delle interfacce per le periferiche

2018-01-13 12:19:16
ed anche corrette certe leggerezze che rendono incompatibile con google cc

2018-01-13 18:19:51
multiexecute sta meglio in un'altro modulo

2020-04-09 12:57:37
nuova metodologia per i plugins
ora cpu6502 usa l'array GLOBAL(plugins)

*/





function cpu6502_reset(){
    GLOBAL(cpu6502).clock_enable = 1
    GLOBAL(cpu6502).regPC = 0xfffc
    GLOBAL(cpu6502).regPC = fetch_word()
    GLOBAL(cpu6502).regSP = 0x100
    GLOBAL(cpu6502).regA = 0
    GLOBAL(cpu6502).regX = 0
    GLOBAL(cpu6502).regY = 0
    GLOBAL(cpu6502).regP = 0x20
}

function cpu6502_init(){
    GLOBAL(cpu6502) = {}
    GLOBAL(cpu6502).memory=[]
    for( var i=0; i<=65535; i++ ) GLOBAL(cpu6502).memory[i]=0
    GLOBAL(cpu6502).cycle = 0   // non esattamente ma quasi, si incrementa ad ogni byte fetch
    GLOBAL(cpu6502).clock_enable = 0
    GLOBAL(cpu6502).regPC = 0
    GLOBAL(cpu6502).regSP = 0
    GLOBAL(cpu6502).regA = 0
    GLOBAL(cpu6502).regX = 0
    GLOBAL(cpu6502).regY = 0
    GLOBAL(cpu6502).regP = 0
    cpu6502_reset()
}


function cpu6502_image(bin){
    GLOBAL(cpu6502).clock_enable = 0
//  if(bin.length!=65536) LOG("bin.length!=65536")
    GLOBAL(cpu6502).memory = bin
    cpu6502_reset()
}


function HALT( txt ){
    // da chiamarsi in caso di errori
    GLOBAL(cpu6502).clock_enable = 0
    message( "HALT:"+txt )
}


function stackPush( value ){
    if( GLOBAL(cpu6502).regSP >= 0 ){
        GLOBAL(cpu6502).regSP--
        var addr = (GLOBAL(cpu6502).regSP&0xff)+0x100
        mem_wr(addr,value)
    } else {
        HALT( "stack full: " + GLOBAL(cpu6502).regSP ) // anche se il 6502 non ha un concetto di stack overflow/underflow
    }
}


function stackPop(){
    if( GLOBAL(cpu6502).regSP < 0x100 ){
        var addr = (GLOBAL(cpu6502).regSP&0xff)+0x100
        var value = mem_rd(addr)
        GLOBAL(cpu6502).regSP++
        return value
    } else {
        HALT( "stack empty" )  // anche se il 6502 non ha un concetto di stack overflow/underflow
        GLOBAL(cpu6502).clock_enable = 0
        return 0
    }
}




function fetch_byte(){
    GLOBAL(cpu6502).cycle++
    return 0xff & mem_rd(GLOBAL(cpu6502).regPC++)
}


function fetch_word(){
    return fetch_byte() + (fetch_byte() << 8)
}



function cpu6502_mem_wr( addr, value ){
    // accesso alla memoria da parte dei plugins (quindi non chiama i plugins)
    GLOBAL(cpu6502).memory[addr] = value & 0xff
}


function cpu6502_mem_rd( addr ){
    // accesso alla memoria da parte dei plugins (quindi non chiama i plugins)
    if(!(addr in GLOBAL(cpu6502).memory)) return HALT( "GLOBAL(cpu6502).memory location $" + hex16(addr) + " unavailable" )
    return GLOBAL(cpu6502).memory[addr]
}


function mem_wr( addr, value ){
    // accesso alla memoria da parte della cpu
    // richiama i plugins
    // qui bisogna capire cosa fare con la memoria sottostante
    // cosi a naso mi piacerebbe avere un bitfield da qualche parte
    // si potrebbero riservare tre bit per periferica:
    // due dicono cosa fare con le wr, se il byte finisce in ram, IO, o anche entrambi (da nessuna parte ha poco senso, ma chissene)
    // uno se il byte viene letto da ram oppure IO
    // wr_to_io, wr_to_ram, rd_from_ram
    // oppure ... due bits che dichiarano il mapping? 
    // vediamo se ci stanno tutte le operazioni sensate:
    // mode    wr      rd
    // 00      ram     ram   periferica disabilitata/non mappata
    // 01      IO      IO    periferica mappata per rd/wr
    // 10      IO+ram  ram   
    // 11      IO+ram  IO    periferica mappata + write-thru
    // si cosi mi piace. mancherebbe la lettura da IO e scrittura in ram però ...
    // allora 3 bit?
    // MODE  WR       RD  
    // 000   ram      ram
    // 001   ram      IO
    // 010   IO       ram
    // 011   IO       IO
    // 100   ram+IO   ram
    // 101   ram+IO   IO
    // 110   ram+IO   ram
    // 111   ram+IO   IO

    addr &= 0xffff
    value &= 0xff
    for( var k in GLOBAL(plugins)){
        var P = GLOBAL(plugins)[k]
        if(!P.wr)continue // se il plugin non fornisce questa fn, passiamo al prossimo
        if("x"!==P.wr(addr,value))return // se il plugin NON ritorna "x" vuol dire che ha risposto, quindi ci fermiamo
    }
    // nessun plugin ha rispost ad addr, andiamo in ram
    cpu6502_mem_wr( addr, value )
}


function mem_rd( addr ){
    // accesso alla memoria da parte della cpu
    // richiama i plugins
    addr &= 0xffff
    for(var k in GLOBAL(plugins)){
        var P = GLOBAL(plugins)[k]
        if(!P.rd)continue // se il plugin non fornisce questa fn, passiamo al prossimo
        var r = P.rd(addr)  // proviamo a invocarlo
        if("x"!==r)return r // se il plugin NON ritorna "x" vuol dire che ha risposto, quindi ritorniamo il valore letto
    }
    // nessun plugin ha risposto? leggiamo dalla ram
    return cpu6502_mem_rd(addr)
}







function jumpBranch( offset ){
    if( offset > 0x7f )
        GLOBAL(cpu6502).regPC = (GLOBAL(cpu6502).regPC - (0x100 - offset))
    else
        GLOBAL(cpu6502).regPC = (GLOBAL(cpu6502).regPC + offset )
}

function doCompare( reg, val ){
    flag_carry( reg+val > 0xff )
    val = reg-val;
    flag_zero( val == 0 )
    flag_sign( val & 0x80 )
}

function testSBC( value ){
//  if( (GLOBAL(cpu6502).regA ^ value ) & 0x80 )
//    vflag = 1;
//  else
//    vflag = 0;

    var tmp
    var w

    if( GLOBAL(cpu6502).regP & 8 ){
        tmp = 0xf + (GLOBAL(cpu6502).regA & 0xf) - (value & 0xf) + (GLOBAL(cpu6502).regP&1);
        if( tmp < 0x10 ){
            w = 0;
            tmp -= 6;
        } else {
            w = 0x10;
            tmp -= 0x10;
        }
        w += 0xf0 + (GLOBAL(cpu6502).regA & 0xf0) - (value & 0xf0);
        if( w < 0x100 ){
            GLOBAL(cpu6502).regP &= 0xfe;
            if( (GLOBAL(cpu6502).regP&0xbf) && w<0x80) GLOBAL(cpu6502).regP&=0xbf;
            w -= 0x60;
        } else {
            GLOBAL(cpu6502).regP |= 1;
            if( (GLOBAL(cpu6502).regP&0xbf) && w>=0x180) GLOBAL(cpu6502).regP&=0xbf;
        }
        w += tmp;
    } else {
        w = 0xff + GLOBAL(cpu6502).regA - value + (GLOBAL(cpu6502).regP&1);
        if( w<0x100 ){
            GLOBAL(cpu6502).regP &= 0xfe;
            if( (GLOBAL(cpu6502).regP&0xbf) && w<0x80 ) GLOBAL(cpu6502).regP&=0xbf;
        } else {
            GLOBAL(cpu6502).regP |= 1;
            if( (GLOBAL(cpu6502).regP&0xbf) && w>= 0x180) GLOBAL(cpu6502).regP&=0xbf;
        }
    }
    GLOBAL(cpu6502).regA = w & 0xff;
    flag_zero(GLOBAL(cpu6502).regA==0)
    flag_sign(GLOBAL(cpu6502).regA&0x80)
}

function testADC( value ){
    if( (GLOBAL(cpu6502).regA ^ value) & 0x80 ){
        GLOBAL(cpu6502).regP &= 0xbf;
    } else {
        GLOBAL(cpu6502).regP |= 0x40;
    }

    var tmp
    if( GLOBAL(cpu6502).regP & 8 ){
        tmp = (GLOBAL(cpu6502).regA & 0xf) + (value & 0xf) + (GLOBAL(cpu6502).regP&1);
        if( tmp >= 10 ){
            tmp = 0x10 | ((tmp+6)&0xf);
        }
        tmp += (GLOBAL(cpu6502).regA & 0xf0) + (value & 0xf0);
        if( tmp >= 160){
            GLOBAL(cpu6502).regP |= 1;
            if( (GLOBAL(cpu6502).regP&0xbf) && tmp >= 0x180 ) GLOBAL(cpu6502).regP &= 0xbf;
            tmp += 0x60;
        } else {
            GLOBAL(cpu6502).regP &= 0xfe;
            if( (GLOBAL(cpu6502).regP&0xbf) && tmp<0x80 ) GLOBAL(cpu6502).regP &= 0xbf;
        }
    } else {
        tmp = GLOBAL(cpu6502).regA + value + (GLOBAL(cpu6502).regP&1);
        if( tmp >= 0x100 ){
            GLOBAL(cpu6502).regP |= 1;
            if( (GLOBAL(cpu6502).regP&0xbf) && tmp>=0x180) GLOBAL(cpu6502).regP &= 0xbf;
        } else {
            GLOBAL(cpu6502).regP &= 0xfe;
            if( (GLOBAL(cpu6502).regP&0xbf) && tmp<0x80) GLOBAL(cpu6502).regP &= 0xbf;
        }
    }
    GLOBAL(cpu6502).regA = tmp & 0xff;
    flag_zero(GLOBAL(cpu6502).regA==0)
    flag_sign(GLOBAL(cpu6502).regA&0x80)
}






function cpu6502_execute(){
//  Executes one instruction.
//  This is the main part of the CPU emulator.
    if(!GLOBAL(cpu6502).clock_enable)return
    var opcode = fetch_byte()
    if( opcode in opcodes_cb ) return opcodes_cb[opcode]()
    // in caso di unknown opcode fermiamo tutto
    GLOBAL(cpu6502).clock_enable = 0
    message( "HALT - unknown opcode $"+hex8(opcode)+" @ $" + hex16(GLOBAL(cpu6502).regPC))
}




