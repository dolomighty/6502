

function peri_pseudowire_init(){
    GLOBAL(pseudowire) = {
        addr    : 0x9000,
        xhr_rd  : new_xhr(),
        wr_fifo : [],  // contiene le code, indicizzate per ip
        rd_fifo : [],  // contiene le code, indicizzate per ip
    }

    setInterval(function(){
        for(var target_ip in GLOBAL(pseudowire).wr_fifo ){

            // prendo i dati dalla coda e la svuoto
            var data = GLOBAL(pseudowire).wr_fifo[target_ip]
            GLOBAL(pseudowire).wr_fifo[target_ip]=[]

            if(!DEFINED(GLOBAL(pseudowire).wr_xhr[target_ip])) GLOBAL(pseudowire).wr_xhr[target_ip]=new_xhr()
            // se la xhr è occupata, non la tocchiamo
            if(GLOBAL(pseudowire).wr_xhr[target_ip].status==0)

        }
    },100)
}


function peri_pseudowire_wr( addr , value ) {
    // il byte viene accodato ad una coda
    // esiste una coda per ogni target
    // ogni tot il processo di gestione dell'invio svuota le code

    if(addr<GLOBAL(pseudowire).base+0)return
    if(addr>GLOBAL(pseudowire).base+4)return

    var ip = [
                cpu6502_mem_rd(GLOBAL(pseudowire).addr+0),
                cpu6502_mem_rd(GLOBAL(pseudowire).addr+1),
                cpu6502_mem_rd(GLOBAL(pseudowire).addr+2),
                cpu6502_mem_rd(GLOBAL(pseudowire).addr+3)
            ].join(".")

    GLOBAL(pseudowire).queue[ip].push(value)



    var payload = {
        ip : ip,
        v : value,
    }

    
    // mmm credo dovrebbe esserci una coda di output

    // usiamo una GET per mandare valori ... secondo i dettami dell'altissimo dovremmo usare una POST
    // ma una GET è indubbiamente più breve
    xhr.open ( "GET" , "pseudowire_wr.php?j="+encodeURIcomponent(JSON.stringify(payload)))
//  xhr.onreadystatechange = function(){
//    if ( xhr.readyState != 4 ) return
//    eval(xhr.responseText)
//  }
    xhr.send()





}

