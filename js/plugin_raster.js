

function plugin_raster(){

    var T = {}

    T.wr = function(addr,value){

        // il display si controlla tramite due pagine
        // la prima sono i pixel rw
        // la seconda registri di controllo

        var reg = addr - T.base_addr
        if(reg<0x00)return "x"
        if(reg>0xFF)return "x"

        switch(reg){

            case 0x00: return T.ax = value
            case 0x01:
                // set ay e draw pix ax,ay
                T.ay = value
                GLOBAL(plugins).display.pix( T.ax , T.ay , T.rgb )
                return

            // set rgb
            case 0x02: return T.rgb[0] = value
            case 0x03: return T.rgb[1] = value
            case 0x04: return T.rgb[2] = value

            case 0x05: return T.bx = value

            case 0x06:
                // setta ay
                // disegna una linea orizzontale (ax,ay)(bx,ay) col colore corrente
                // poi sposta una linea sotto
                // 2020-04-08 18:49:59 mmm  a che serve, devi passargli la linea ogni volta ... va rivista
                T.ay = value
                var w = T.bx-T.ax
                if(w>0){
                    T.context.fillStyle="rgb("+T.rgb.join(",")+")"
                    T.context.fillRect(
                        T.ax*T.p,
                        T.ay*T.p,
                        T.p*(T.bx-T.ax),
                        T.p
                    )
                }
                T.ay++
                break
        }

        return 0
    }



    T.pix = function( x , y , rgb ){
        T.context.fillStyle="rgb("+rgb.join(",")+")"
        T.context.fillRect(
            x*T.p,
            y*T.p,
            T.p,
            T.p
        )
    }



    // INIT
    // l'inizializzazione va a buon fine, oppure fallisce terminando lo script

    T.base_addr = 0x8100
    T.wh = [256,192]
    T.p = 2  // pixel size
    T.rgb = [0,0,0]


    var canvas = document.createElement("canvas")
    canvas.width  = T.wh[0]*T.p
    canvas.height = T.wh[1]*T.p
    T.context = canvas.getContext("2d")

    var div = $("peri_display")
    div.style.width  = canvas.width+"px"
    div.style.height = canvas.height+"px"
    div.appendChild(canvas)

    // tutto ok, aggiungiamoci ai plugins
    GLOBAL(plugins).display = T
}



