
function exec_start() {
    GLOBAL(exec) = {}
    R(0) // inizialmente fermo
    var accu = 0
    setInterval(function(){
        accu += GLOBAL(exec).hz
        var ops = Math.floor(accu/100)   // ... o comunque, divisione intera
        if ( ops < 1 ) return
        accu -= ops*100;
        for( var w=0; w<ops; w++ ) cpu6502_execute()
    },10)
}

