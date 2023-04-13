
function plugin_snoop(){
    var T={}

    T.wr = function(addr,value){
        // viene chiamata ad ogni scrittura in mem
        // registra l'indirizzo di scrittura e quante volte viene scritto
        // cosi in ogni momento possiamo decidere cosa mostrare
        if(!(addr in T.mem_wr_hgram)) T.mem_wr_hgram[addr]=0
        T.mem_wr_hgram[addr]++
        // questo è un plugin che monitora le scritture in ram/plugins
        // quindi ascolta passivo, come se non fosse mappato, percio "x"
        return "x"  
    }


    T.clear = function(){
        T.mem_wr_hgram = []
        T.show()
    }


    T.show = function(){
        var s = []
        for(var addr in T.mem_wr_hgram){
            var addr = 0xffff & addr
            var b0 = cpu6502_mem_rd(addr+0)
            var b1 = cpu6502_mem_rd(addr+1)
            var w0 = (b1<<8)+b0
            var count = T.mem_wr_hgram[addr]
            s.push( 
                "$"   +hex16(addr)+
                " → $"+hex8(b0)+
                " %"  +bin8(b0)+
                " "   +ascii(b0)+
                " "   +dec8u(b0)+
                " "   +dec16u(w0)
            )
        }
        $("mem_wr_hgram").value = s.join("\n")    // ???
    }

    // INIT
    // l'inizializzazione va a buon fine, oppure fallisce terminando lo script

    T.clear()

    // tutto ok, aggiungiamoci ai plugins
    GLOBAL(plugins).snoop = T
}







