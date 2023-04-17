
function gui_start(){
    $("assembla").addEventListener("click",assembla)
    $("ex").addEventListener("change",load_ex)
    draggables_init()
    setInterval(function(){
        var a = 0xff & GLOBAL(cpu6502).regA
        var x = 0xff & GLOBAL(cpu6502).regX
        var y = 0xff & GLOBAL(cpu6502).regY
        $("cy").value = GLOBAL(cpu6502).cycle
        $("PC").value = "$"+hex16(GLOBAL(cpu6502).regPC)
        $("A").value  = "$"+hex8(a)+" "+ascii(a)+" "+dec8u(a)+" %"+bin8(a)
        $("X").value  = "$"+hex8(x)+" "+ascii(x)+" "+dec8u(x)+" %"+bin8(x)
        $("Y").value  = "$"+hex8(y)+" "+ascii(y)+" "+dec8u(y)+" %"+bin8(y)
        GLOBAL(plugins).snoop.show()
    },33)
}

