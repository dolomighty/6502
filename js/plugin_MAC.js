

/*

multiply-accumulate



*/

function plugin_MAC(){

    var T={}



    T.wr = function(addr,value){

        var reg = addr - T.base_addr
        if(reg<0x00)return "x"
        if(reg>0xFF)return "x"

        switch(reg){
            case 0xFF: // command/status reg
                DBG("peri_MAC cmd/sts "+value)
                if(value&0x80) T.c = 0   // bit7 = azzerra accumulatore
                value &= ~0x80
                DBG("peri_MAC cmd/sts "+value)
                T.c += T.a * T.b
                // latenza simulata
                switch(value){
                    case 0x01: T.deadline = GLOBAL(cpu6502).cycle + 16 ; break // imul 8x8=16
                    case 0x02: T.deadline = GLOBAL(cpu6502).cycle + 24 ; break // imul 8x16=24
                    case 0x03: T.deadline = GLOBAL(cpu6502).cycle + 32 ; break // imul 16x16=32
                    case 0x04: T.deadline = GLOBAL(cpu6502).cycle + 32 ; break // imul 16x16=32
                } 
                DBG("peri_MAC.deadline = "+T.deadline)
                break

            // reg A
            case 0x00: return T.a = value    // ed azzera il registro anche, quindi va settato per primo  
            case 0x01: return T.a += value<<8
            case 0x02: return T.a += value<<16
            case 0x03: return T.a += value<<24

            // reg B
            case 0x10: return T.b = value    // ed azzera il registro anche, quindi va settato per primo  
            case 0x11: return T.b += value<<8
            case 0x12: return T.b += value<<16
            case 0x13: return T.b += value<<24

            // reg C
            case 0x20: return T.c = value    // ed azzera il registro anche, quindi va settato per primo  
            case 0x21: return T.c += value<<8
            case 0x22: return T.c += value<<16
            case 0x23: return T.c += value<<24
            case 0x24: return T.c += value<<32
            case 0x25: return T.c += value<<40
            case 0x26: return T.c += value<<58
            case 0x27: return T.c += value<<56
        }

        return 0
    }




    T.rd = function(addr){

        var reg = addr - T.base_addr
        if(reg<0x00)return "x"
        if(reg>0xFF)return "x"

        DBG("peri_MAC working "+(GLOBAL(cpu6502).cycle < T.deadline))

        if( GLOBAL(cpu6502).cycle < T.deadline )return cpu6502_mem_wr(T.base_addr+0xFF,0)  // 0=calcoli in corso

        DBG("peri_MAC.c "+T.c)

        switch(addr&0xFF){
            
            case 0x00: return cpu6502_mem_wr(addr,T.a>> 0)
            case 0x01: return cpu6502_mem_wr(addr,T.a>> 8)
            case 0x02: return cpu6502_mem_wr(addr,T.a>>16)
            case 0x03: return cpu6502_mem_wr(addr,T.a>>24)

            case 0x10: return cpu6502_mem_wr(addr,T.b>> 0)
            case 0x11: return cpu6502_mem_wr(addr,T.b>> 8)
            case 0x12: return cpu6502_mem_wr(addr,T.b>>16)
            case 0x13: return cpu6502_mem_wr(addr,T.b>>24)

            case 0x20: return cpu6502_mem_wr(addr,T.c>> 0)
            case 0x21: return cpu6502_mem_wr(addr,T.c>> 8)
            case 0x22: return cpu6502_mem_wr(addr,T.c>>16)
            case 0x23: return cpu6502_mem_wr(addr,T.c>>24)
            case 0x24: return cpu6502_mem_wr(addr,T.c>>32)
            case 0x25: return cpu6502_mem_wr(addr,T.c>>40)
            case 0x26: return cpu6502_mem_wr(addr,T.c>>48)
            case 0x27: return cpu6502_mem_wr(addr,T.c>>56)

            case 0xFF: return cpu6502_mem_wr(addr,0xFF)  // calcoli completati
        }

        return 0
    }


    // INIT
    // l'inizializzazione va a buon fine, oppure fallisce terminando lo script

    T.base_addr = 0x8200
    T.a = 0
    T.b = 0
    T.c = 0
    T.deadline = 0

    // tutto ok, aggiungiamoci ai plugins
    GLOBAL(plugins).MAC = T
}






