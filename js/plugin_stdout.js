

function plugin_stdout(){
    var T={}

    // fn pubbliche 

    T.wr = function(addr,value){
        if(addr!=0x1000) return "x"
        $("out").value += String.fromCharCode(value)
        scrolldown()
        return 0
    }



    // INIT
    // l'inizializzazione va a buon fine, oppure fallisce terminando lo script

    // tutto ok, aggiungiamoci ai plugins
    GLOBAL(plugins).stdout = T
}

