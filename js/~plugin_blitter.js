


//var PLUGIN = {
//  // alla cpu servono solo due fn
//  rd:function(addr), // opzionale, ritorna stringa "x" se non mappato, altrimenti intero [0,255]
//  wr:function(addr,value), // opzionale, ritorna stringa "x" se non mappato
//}




function plugin_blitter(){

    var T = {}


    T.init = function(){
        // INIT
        // l'inizializzazione va a buon fine, oppure fallisce terminando lo script

        // dipendenze
        if(!GLOBAL(plugins).display) fatal("!GLOBAL(plugins).display")

        T.base_addr = 0x8300
        T.target_xy = [0,0]
        T.palette_rw_index = 0
        T.palette_rw_component = 0
        T.palette_offset = 0
        T.pixel_count = 0

        T.palette = []
        for( var i=0 ; i<=255 ; i++ ) T.palette[i]=[(i*4)&255,(i*2)&255,(i*1)&255]

        // tutto ok, aggiungiamoci ai plugins
        GLOBAL(plugins).blitter = T
    }


    // fn di accesso da parte della cpu

    T.rd = function(addr){

        // soliti 256 bytes di IO
        var reg = addr - T.base_addr
        if(reg<0x00)return "x"
        if(reg>0xFF)return "x"

        switch(reg){
            // target xy
            case 0x00: return T.target_xy[0]
            case 0x01: return T.target_xy[0]>>8
            case 0x02: return T.target_xy[1]
            case 0x03: return T.target_xy[1]>>8
            // pixel data source reg
            case 0x10: return T.source_addr
            case 0x11: return T.source_addr>>8
            // palette rgb read
            case 0x22: 
                if(T.palette_rw_component>=3){
                    T.palette_rw_index ++
                    T.palette_rw_index &= 255
                    T.palette_rw_component = 0
                }
                return T.palette[T.palette_wr_index][T.palette_rw_component++]
        }
        return 0
    }



    T.wr = function(addr,value){

        // soliti 256 bytes di IO
        var reg = addr - T.base_addr
        if(reg<0x00)return "x"
        if(reg>0xFF)return "x"

        switch(reg){
            // target xy
            case 0x00: return T.target_xy[0]  = value
            case 0x01: return T.target_xy[0] += value<<8
            case 0x02: return T.target_xy[1]  = value
            case 0x03: return T.target_xy[1] += value<<8
            // pixel data source addr
            case 0x10: return T.source_addr  = value
            case 0x11: return T.source_addr += value<<8
            // palette index
            case 0x20: 
                T.palette_rw_index = value
                T.palette_rw_component = 0
                return
            // palette rgb wr
            case 0x21:
                T.palette[T.palette_wr_index][T.palette_rw_component++] = value
                if(T.palette_rw_component<3)return
                T.palette_rw_index ++
                T.palette_rw_index &= 255
                T.palette_rw_component = 0
                return
            // blit pixel count
            case 0x30: return T.pixel_count  = value
            case 0x31: return T.pixel_count += value<<8
            // blit palette base offset
            case 0x32: return T.palette_offset = value
            // cmd: blit da sinistra a destra, value = pixel format
            case 0x80: return T.blit_lr(value)
        }
        return 0
    }






    T.blit_lr = function( pixfmt ){

        var x = T.target_xy[0]
        var stop = x+T.pixel_count
        var addr = T.source_addr

        var draw_pix = function( index ){
            index += T.palette_offset
            peri_display_pix( x++ , T.target_xy[1] , T.palette[index] )
//      GLOBAL(plugins).display.pix( x++ , T.target_xy[1] , T.palette[index] )
            return x<stop
        }

        switch(pixfmt){
            case 1:   // 1bpp, 12345678
                while(1){
                    var pix = cpu6502_mem_rd(addr++)
                    if(!draw_pix(1&(pix>>7)))return
                    if(!draw_pix(1&(pix>>6)))return
                    if(!draw_pix(1&(pix>>5)))return
                    if(!draw_pix(1&(pix>>4)))return
                    if(!draw_pix(1&(pix>>3)))return
                    if(!draw_pix(1&(pix>>2)))return
                    if(!draw_pix(1&(pix>>1)))return
                    if(!draw_pix(1&(pix>>0)))return
                }
                return
            case 2:   // 2bpp, 11223344
                while(1){
                    var pix = cpu6502_mem_rd(addr++)
                    if(!draw_pix(3&(pix>>6)))return
                    if(!draw_pix(3&(pix>>4)))return
                    if(!draw_pix(3&(pix>>2)))return
                    if(!draw_pix(3&(pix>>0)))return
                }
                return
            case 4:   // 4bpp, 11112222
                while(1){
                    var pix = cpu6502_mem_rd(addr++)
                    if(!draw_pix(15&(pix>>4)))return
                    if(!draw_pix(15&(pix>>0)))return
                }
                return
        }
    }


    T.init()
}



