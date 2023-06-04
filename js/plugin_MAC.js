

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
                DBG("plugin_MAC cmd/sts "+value)
                if(value&0x80) T.c = 0   // bit7 = azzerra accumulatore
                value &= ~0x80
                DBG("plugin_MAC cmd/sts "+value)
                T.c += T.a * T.b
                // latenza simulata
                switch(value){
                    case 0x01: T.deadline = GLOBAL(cpu6502).cycle + 16 ; break // imul 8x8=16
                    case 0x02: T.deadline = GLOBAL(cpu6502).cycle + 24 ; break // imul 8x16=24
                    case 0x03: T.deadline = GLOBAL(cpu6502).cycle + 32 ; break // imul 16x16=32
//                    case 0x04: T.deadline = GLOBAL(cpu6502).cycle + 32 ; break // imul 16x16=32
                } 
                DBG("plugin_MAC.deadline = "+T.deadline)
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

        DBG("plugin_MAC working "+(GLOBAL(cpu6502).cycle < T.deadline))

        if( GLOBAL(cpu6502).cycle < T.deadline )return cpu6502_mem_wr(T.base_addr+0xFF,0)  // 0=calcoli in corso

        DBG("plugin_MAC.c "+T.c)

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



/*

es.


MAC_BASE = $8200
MAC_A    = MAC_BASE+0
MAC_B    = MAC_BASE+1
MAC_C    = MAC_BASE+3
MAC_CMD  = MAC_BASE+$FF

avendo 256+ bytes di IO...

!macro copy16 .src .dst {
    lda .src+0
    sta .dst+0
    lda .src+1
    sta .dst+1
}

; C = M00*X+M01*Y+M02*Z


copy16 M00, MAC_A
copy16 X,   MAC_B
copy16 M01, MAC_A
copy16 Y,   MAC_B
copy16 M02, MAC_A
copy16 Z,   MAC_B

lda X+0
sta MAC_B+0
lda X+1
sta MAC_B+1

ldx $13         ; s32=s16*s16 + reset accu
stx MAC_CMD


lda M01+0
sta MAC_A+0
lda M01+1
sta MAC_A+1

lda Y+0
sta MAC_B+0
lda Y+1
sta MAC_B+1

ldx $03         ; s32=s16*s16
stx MAC_CMD


lda M02+0
sta MAC_A+0
lda M02+1
sta MAC_A+1

lda Z+0
sta MAC_B+0
lda Z+1
sta MAC_B+1

stx MAC_CMD




lda MAC_C+0
sta DOT+0
lda MAC_C+0
sta DOT+0




mmm... ogni imul va comamdata...
avendo 256 bytes potrei dare 8 registri di input
ed 1 output

MAC_A0 (16bit)
MAC_A1 (16bit)
MAC_A2 (16bit)
MAC_A3 (16bit)

MAC_B0 (16bit)
MAC_B1 (16bit)
MAC_B2 (16bit)
MAC_B3 (16bit)

MAC_C (32bit)

MAC_C = 
    MAC_A0*MAC_B0+
    MAC_A1*MAC_B1+
    MAC_A2*MAC_B2+
    MAC_A3*MAC_B3


ma è meno flessibile
una cosa utile è avere una movsx per caricare C
si risparmia qualcosa in termini di spazio

copy16 M03, MAC_C
ldx MAC_SIGN_EXTEND_C_16_TO_32
stx MAC_CMD

copy16 M00, MAC_A
copy16 X,   MAC_B
ldx MAC_S16_S16
stx MAC_CMD

copy16 M01, MAC_A
copy16 Y,   MAC_B
stx MAC_CMD

copy16 M02, MAC_A
copy16 Z,   MAC_B
stx MAC_CMD

; il risultato è in MAC_C[0:3]


nel calcolo matriciale pspessissimo si fa M*V
in questo caso sarebbe più utile poter caricare V
ed anche uno shift per fixpoint
e riutilizzarlo, ad es


; questa potresti farla una volta per app

lda #16
sta MAC_SHIFT



; queste le fai una volta per mat op

copy16 MAC_V0, X
copy16 MAC_V1, Y
copy16 MAC_V2, Z
copy16 MAC_V3, W
ldx MAC_DOT4    ; C = (M0*V0 + M1*V1 + M2*V2 + M3*V3) >> SHIFT

; queste per ogni riga

copy16 MAC_M0, M00
copy16 MAC_M1, M01
copy16 MAC_M2, M02
copy16 MAC_M3, M03
sta MAC_CMD
copy32 MAC_C, TX


copy16 MAC_M0, M10
copy16 MAC_M1, M11
copy16 MAC_M2, M12
copy16 MAC_M3, M13
sta MAC_CMD
copy32 MAC_C, TY


copy16 MAC_M0, M20
copy16 MAC_M1, M21
copy16 MAC_M2, M22
copy16 MAC_M3, M23
sta MAC_CMD
copy32 MAC_C, TZ


copy16 MAC_M0, M30
copy16 MAC_M1, M31
copy16 MAC_M2, M32
copy16 MAC_M3, M33
sta MAC_CMD
copy32 MAC_C, TW


... e si potrebbero usare i singoli bit per indicare quali mul si fanno
ad es.
CMD_DOT+%0001  ; usa la coppia M0*V0
CMD_DOT+%0111  ; usa MV 0,1,2
CMD_DOT+%1000  ; usa MV 3

servirebbero 16 cmd... ne abbiam quanti se ne vuole

... beh ma possono anche esserci due percorsi indipendenti...
uno per MAC generico, l'altro per calcolo matriciale

*/


