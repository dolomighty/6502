

/*



display vettoriale stile tek 4k


*/


function plugin_tek(){

    var T = {}


    T.wr = function(addr,value){
        // dunque vediamo
        // potrei dare al display una risoluzione effettiva di 16 bit
        // si dai. xy in range s16, con 0,0 al centro
        // direi di supportare le polilinee
        // poi serve un registro per la cancellazione...
        // no facciamo un registro comandi e vari registri parametri
        // potrei anche metterci una display list
        // penso che una pagina basti

        var reg = addr - T.base_addr
        if(reg<0x00)return "x"
        if(reg>0xFF)return "x"

        switch(reg){
            case 0x00: T.exec(value); break
            case 0x02: T.reg_x[0]=value; break
            case 0x03: T.reg_x[1]=value; break
            case 0x04: T.reg_y[0]=value; break
            case 0x05: T.reg_y[1]=value; break
        }

        return 0 // ok
    }


    T.exec = function( cmd ){
        switch(cmd){
            case 0x00: T.clear(); break
            case 0x01: T.move(); break
            case 0x02: T.line(); break
        }
    }

    T.clear = function(){
        T.context.fillStyle="rgb(0,10,5)"
        T.context.fillRect( 0, 0, T.wh[0], T.wh[1])
    }

    T.xy_from_regs = function(){
        var x_u16 = (T.reg_x[1]<<8)|(T.reg_x[0]<<0)
        var y_u16 = (T.reg_y[1]<<8)|(T.reg_y[0]<<0)
        var x = x_u16*2.0/(1<<16)-1
        var y = y_u16*2.0/(1<<16)-1
        return [ x, -y ]
    }

    T.move = function(){
        T.xy = T.xy_from_regs()
    }

    T.line = function(){
        T.context.strokeStyle="rgb(0,255,50)"
        T.context.beginPath()
        T.context.moveTo( T.xy[0], T.xy[1])
        T.xy = T.xy_from_regs()
        T.context.lineTo( T.xy[0], T.xy[1])
        T.context.stroke()
    }



    // INIT
    // l'inizializzazione va a buon fine, oppure fallisce terminando lo script

    T.base_addr = 0x8200
    T.wh = [400,300]
    T.xy = [0,0]
    T.reg_x = [0,0]
    T.reg_y = [0,0]

    var canvas = document.createElement("canvas")
    canvas.width  = T.wh[0]
    canvas.height = T.wh[1]
    T.context = canvas.getContext("2d")

    var div = $("peri_tek")
    div.style.width  = canvas.width+"px"
    div.style.height = canvas.height+"px"
    div.appendChild(canvas)

    T.clear()
    draggable($("peri_tek_outer"))

    // tutto ok, aggiungiamoci ai plugins
    GLOBAL(plugins).tek = T
}



