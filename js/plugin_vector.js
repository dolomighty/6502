

/*



display vettoriale stile tek 4k


*/


function plugin_vector(){

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
            case 0x03: T.reg_x[1]=value; T.after_hi_x(); break
            case 0x04: T.reg_y[0]=value; break
            case 0x05: T.reg_y[1]=value; T.after_hi_y(); break
        }

        return 0 // ok
    }


    T.exec = function( cmd ){
        switch(cmd){
            case 0x00: T.clear();            break
            case 0x01: T.xy=T.xy_dev();      break // move
            case 0x02: T.lineto(T.xy_dev()); break
//            case 0x03: T.bl=T.xy_dev();      break    // set viewport bottom-left
//            case 0x04: T.range(T.xy_dev());  break    // set viewport top-right
            case 0x10:
                T.after_hi_x = function(){}
                T.after_hi_y = function(){}
                break
            case 0x11:
                T.after_hi_x = function(){T.lineto(T.xy_dev())}
                break
            case 0x12:
                T.after_hi_y = function(){T.lineto(T.xy_dev())}
                break
        }
    }


    T.clear = function(){
        T.context.reset()
        T.context.fillStyle="rgb(0,40,20)"
        T.context.fillRect( 0, 0, T.wh[0], T.wh[1])
        T.context.strokeStyle="rgb(0,255,100)"
        T.context.lineWidth=1.5
        T.context.translate( T.wh[0]/2, T.wh[1]/2 ) // origine al centro
    }


    T.xy_from_regs = function(){
        var x_u16 = (T.reg_x[1]<<8)|(T.reg_x[0]<<0)
        var y_u16 = (T.reg_y[1]<<8)|(T.reg_y[0]<<0)
        var x = x_u16*2.0/(1<<16)-1
        var y = y_u16*2.0/(1<<16)-1
        return [ x, -y ]
    }


    T.xy_dev = function(){
        var xy = T.xy_from_regs()
        var s = T.wh[1]/2
        return [xy[0]*s,xy[1]*s]
    }

    T.lineto = function(xy){
        var from = T.xy
        T.xy = xy
        var to = T.xy

        const gradient = T.context.createLinearGradient( from[0], from[1], to[0], to[1])
        gradient.addColorStop(0, "green")
        gradient.addColorStop(1, "white")
        T.context.strokeStyle = gradient

        T.context.beginPath()
        T.context.moveTo(from[0],from[1])
        T.context.lineTo(to[0],to[1])
        T.context.stroke()
    }


    // INIT
    // l'inizializzazione va a buon fine, oppure fallisce terminando lo script

    T.base_addr = 0x8400
    T.wh = [400,300]
    T.xy = [0,0]
    T.reg_x = [0,0]
    T.reg_y = [0,0]
    T.after_hi_x = function(){}
    T.after_hi_y = function(){}

    var canvas = document.createElement("canvas")
    canvas.width  = T.wh[0]
    canvas.height = T.wh[1]
    T.context = canvas.getContext("2d")

    var div = $("peri_tek")
    div.style.width  = canvas.width+"px"
    div.style.height = canvas.height+"px"
    div.appendChild(canvas)

    // - si disegna la linea persistente in offscreen
    // ad ogni frame poi:
    // - si copia l'offscreen sul canvas visibile
    // - si sovrappone sul visibile il tracer
    //   abbassando ogni frame l'intensità per avere un fadedout
    //
    // alternativamente si può effettivamente muovere un punto luminoso lungo la linea
    // a velocità costante, e mano a mano si lascia traccia nel canvas offscreen
    //
    const offscreen = new OffscreenCanvas(T.wh[0],T.wh[1])
    T.offscreen = canvas.getContext("2d")

    T.clear()

//    function birand( range ){
//        var one = Math.random()*2-1
//        return one*range
//    }
//    for( var i=100; i>0; i-- ) T.lineto([birand(T.wh[1]/2),birand(T.wh[1]/2)])

    // tutto ok, aggiungiamoci ai plugins
    GLOBAL(plugins).tek = T
}



