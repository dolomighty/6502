var g_cpu6502
var g_exec
var g_plugins
function $(what) {
    var obj = ("string" == typeof what) ? document.getElementById(what) : what
    return obj
}
function assembla(){
    var asm = $("asm")
    if(!asm)return
    asm = asm.value
    if(!asm)return
    $("out").value = ""
    var xhr = new_xhr()
    xhr.open ( "POST" , "compile.php" )
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded")
    xhr.onreadystatechange = function(){
        if ( xhr.readyState != 4 ) return
        {window.console && console.log(xhr.responseText)}
        eval(xhr.responseText)
    }
    xhr.send("asm="+encodeURIComponent(asm))
}
function ascii(v){
    if(v<32)return "."
    if(v>=127)return "."
    return String.fromCharCode(v)
}
function bin8(v) {return v.toString(2) .padStart(8,"0")}
function bin16(v) {return v.toString(2) .padStart(4,"0")}
function dec8u(v) {return v.toString(10).padStart(3," ")}
function dec16u(v){return v.toString(10).padStart(5," ")}
function hex8(v) {return v.toString(16).padStart(2,"0")}
function hex16(v) {return v.toString(16).padStart(4,"0")}
function cpu6502_reset(){
    g_cpu6502.clock_enable = 1
    g_cpu6502.regPC = 0xfffc
    g_cpu6502.regPC = fetch_word()
    g_cpu6502.regSP = 0x100
    g_cpu6502.regA = 0
    g_cpu6502.regX = 0
    g_cpu6502.regY = 0
    g_cpu6502.regP = 0x20
}
function cpu6502_init(){
    g_cpu6502 = {}
    g_cpu6502.memory=[]
    for( var i=0; i<=65535; i++ ) g_cpu6502.memory[i]=0
    g_cpu6502.cycle = 0
    g_cpu6502.clock_enable = 0
    g_cpu6502.regPC = 0
    g_cpu6502.regSP = 0
    g_cpu6502.regA = 0
    g_cpu6502.regX = 0
    g_cpu6502.regY = 0
    g_cpu6502.regP = 0
    cpu6502_reset()
}
function cpu6502_image(bin){
    g_cpu6502.clock_enable = 0
    g_cpu6502.memory = bin
    cpu6502_reset()
}
function HALT( txt ){
    g_cpu6502.clock_enable = 0
    message( "HALT:"+txt )
}
function stackPush( value ){
    if( g_cpu6502.regSP >= 0 ){
        g_cpu6502.regSP--
        var addr = (g_cpu6502.regSP&0xff)+0x100
        mem_wr(addr,value)
    } else {
        HALT( "stack full: " + g_cpu6502.regSP )
    }
}
function stackPop(){
    if( g_cpu6502.regSP < 0x100 ){
        var addr = (g_cpu6502.regSP&0xff)+0x100
        var value = mem_rd(addr)
        g_cpu6502.regSP++
        return value
    } else {
        HALT( "stack empty" )
        g_cpu6502.clock_enable = 0
        return 0
    }
}
function fetch_byte(){
    g_cpu6502.cycle++
    return 0xff & mem_rd(g_cpu6502.regPC++)
}
function fetch_word(){
    return fetch_byte() + (fetch_byte() << 8)
}
function cpu6502_mem_wr( addr, value ){
    g_cpu6502.memory[addr] = value & 0xff
}
function cpu6502_mem_rd( addr ){
    if(!(addr in g_cpu6502.memory)) return HALT( "GLOBAL(cpu6502).memory location $" + hex16(addr) + " unavailable" )
    return g_cpu6502.memory[addr]
}
function mem_wr( addr, value ){
    addr &= 0xffff
    value &= 0xff
    for( var k in g_plugins){
        var P = g_plugins[k]
        if(!P.wr)continue
        if("x"!==P.wr(addr,value))return
    }
    cpu6502_mem_wr( addr, value )
}
function mem_rd( addr ){
    addr &= 0xffff
    for(var k in g_plugins){
        var P = g_plugins[k]
        if(!P.rd)continue
        var r = P.rd(addr)
        if("x"!==r)return r
    }
    return cpu6502_mem_rd(addr)
}
function jumpBranch( offset ){
    if( offset > 0x7f )
        g_cpu6502.regPC = (g_cpu6502.regPC - (0x100 - offset))
    else
        g_cpu6502.regPC = (g_cpu6502.regPC + offset )
}
function doCompare( reg, val ){
    flag_carry( reg+val > 0xff )
    val = reg-val;
    flag_zero( val == 0 )
    flag_sign( val & 0x80 )
}
function testSBC( value ){
    var tmp
    var w
    if( g_cpu6502.regP & 8 ){
        tmp = 0xf + (g_cpu6502.regA & 0xf) - (value & 0xf) + (g_cpu6502.regP&1);
        if( tmp < 0x10 ){
            w = 0;
            tmp -= 6;
        } else {
            w = 0x10;
            tmp -= 0x10;
        }
        w += 0xf0 + (g_cpu6502.regA & 0xf0) - (value & 0xf0);
        if( w < 0x100 ){
            g_cpu6502.regP &= 0xfe;
            if( (g_cpu6502.regP&0xbf) && w<0x80) g_cpu6502.regP&=0xbf;
            w -= 0x60;
        } else {
            g_cpu6502.regP |= 1;
            if( (g_cpu6502.regP&0xbf) && w>=0x180) g_cpu6502.regP&=0xbf;
        }
        w += tmp;
    } else {
        w = 0xff + g_cpu6502.regA - value + (g_cpu6502.regP&1);
        if( w<0x100 ){
            g_cpu6502.regP &= 0xfe;
            if( (g_cpu6502.regP&0xbf) && w<0x80 ) g_cpu6502.regP&=0xbf;
        } else {
            g_cpu6502.regP |= 1;
            if( (g_cpu6502.regP&0xbf) && w>= 0x180) g_cpu6502.regP&=0xbf;
        }
    }
    g_cpu6502.regA = w & 0xff;
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
function testADC( value ){
    if( (g_cpu6502.regA ^ value) & 0x80 ){
        g_cpu6502.regP &= 0xbf;
    } else {
        g_cpu6502.regP |= 0x40;
    }
    var tmp
    if( g_cpu6502.regP & 8 ){
        tmp = (g_cpu6502.regA & 0xf) + (value & 0xf) + (g_cpu6502.regP&1);
        if( tmp >= 10 ){
            tmp = 0x10 | ((tmp+6)&0xf);
        }
        tmp += (g_cpu6502.regA & 0xf0) + (value & 0xf0);
        if( tmp >= 160){
            g_cpu6502.regP |= 1;
            if( (g_cpu6502.regP&0xbf) && tmp >= 0x180 ) g_cpu6502.regP &= 0xbf;
            tmp += 0x60;
        } else {
            g_cpu6502.regP &= 0xfe;
            if( (g_cpu6502.regP&0xbf) && tmp<0x80 ) g_cpu6502.regP &= 0xbf;
        }
    } else {
        tmp = g_cpu6502.regA + value + (g_cpu6502.regP&1);
        if( tmp >= 0x100 ){
            g_cpu6502.regP |= 1;
            if( (g_cpu6502.regP&0xbf) && tmp>=0x180) g_cpu6502.regP &= 0xbf;
        } else {
            g_cpu6502.regP &= 0xfe;
            if( (g_cpu6502.regP&0xbf) && tmp<0x80) g_cpu6502.regP &= 0xbf;
        }
    }
    g_cpu6502.regA = tmp & 0xff;
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
function cpu6502_execute(){
    if(!g_cpu6502.clock_enable)return
    var opcode = fetch_byte()
    if( opcode in opcodes_cb ) return opcodes_cb[opcode]()
    g_cpu6502.clock_enable = 0
    message( "HALT - unknown opcode $"+hex8(opcode)+" @ $" + hex16(g_cpu6502.regPC))
}
function draggable(id) {
    var pos1 = 0
    var pos2 = 0
    var pos3 = 0
    var pos4 = 0
    id.onmousedown = dragMouseDown
    function dragMouseDown(e){
        e = e || window.event
        e.preventDefault()
        pos3 = e.clientX
        pos4 = e.clientY
        document.onmouseup = closeDragElement
        document.onmousemove = elementDrag
    }
    function elementDrag(e) {
        e = e || window.event
        e.preventDefault()
        pos1 = pos3 - e.clientX
        pos2 = pos4 - e.clientY
        pos3 = e.clientX
        pos4 = e.clientY
        id.style.top = (id.offsetTop - pos2) + "px"
        id.style.left = (id.offsetLeft - pos1) + "px"
    }
    function closeDragElement() {
        document.onmouseup = null
        document.onmousemove = null
    }
}
function exec_start() {
    g_exec = {}
    R(0)
    var accu = 0
    setInterval(function(){
        accu += g_exec.hz
        var ops = Math.floor(accu/100)
        if ( ops < 1 ) return
        accu -= ops*100;
        for( var w=0; w<ops; w++ ) cpu6502_execute()
    },10)
}
function fatal( msg ){
    var b = $("body")
    var style = "background:red;color:white;padding:5px;font-weight:bold"
    b.innerHTML="<div style="+style+">errore fatale:<br>"+msg+"</div>"
    throw("fatal")
}
function flag_zero( opt_set ){
    if(("undefined" != typeof opt_set)){
        if(opt_set) g_cpu6502.regP |= 0x02
        else g_cpu6502.regP &= ~0x02
    }
    return (g_cpu6502.regP & 0x02) != 0
}
function flag_sign( opt_set ){
    if(("undefined" != typeof opt_set)){
        if(opt_set) g_cpu6502.regP |= 0x80
        else g_cpu6502.regP &= ~0x80
    }
    return (g_cpu6502.regP & 0x80) != 0
}
function flag_carry( opt_set ){
    if(("undefined" != typeof opt_set)){
        if(opt_set) g_cpu6502.regP |= 0x01
        else g_cpu6502.regP &= ~0x01
    }
    return (g_cpu6502.regP & 0x01) != 0
}
function flag_overflow( opt_set ){
    if(("undefined" != typeof opt_set)){
        if(opt_set) g_cpu6502.regP |= 0x40
        else g_cpu6502.regP &= ~0x40
    }
    return (g_cpu6502.regP & 0x40) != 0
}
function gui_start(){
    $("assembla").addEventListener("click",assembla)
    $("ex").addEventListener("change",load_ex)
    draggable($("cpu"))
    setInterval(function(){
        var a = 0xff & g_cpu6502.regA
        var x = 0xff & g_cpu6502.regX
        var y = 0xff & g_cpu6502.regY
        $("cy").value = g_cpu6502.cycle
        $("PC").value = "$"+hex16(g_cpu6502.regPC)
        $("A").value = "$"+hex8(a)+" "+ascii(a)+" "+dec8u(a)+" %"+bin8(a)
        $("X").value = "$"+hex8(x)+" "+ascii(x)+" "+dec8u(x)+" %"+bin8(x)
        $("Y").value = "$"+hex8(y)+" "+ascii(y)+" "+dec8u(y)+" %"+bin8(y)
        g_plugins.snoop.show()
    },33)
}
I = function( b64 ){
    var m = []
    var bin = atob(b64)
    for( var i=0 ; i<bin.length ; i++ ) {
        m[i]=bin.charCodeAt(i)
    }
    {window.console && console.log(m.join(" "))}
    R(0)
    g_plugins.snoop.clear()
    cpu6502_image(m)
}
function lineno(){
    var e = $("asm")
    var last_scrollHeight = -1
    function os (){
        var d = $("ln")
        if(last_scrollHeight!=e.scrollHeight){
            last_scrollHeight=e.scrollHeight
            var c = e.scrollHeight/20
            var l = []
            for(var i=1;i<c;i++)l.push(i)
            d.innerHTML=l.join("\n")
        }
        d.scrollTop = e.scrollTop
    }
    e.onscroll = os
    os()
}
function load_ex(){
    var e = $("ex")
    if(e.value<0)return
    var xhr = new_xhr()
    xhr.open("GET","load_ex.php?v="+e.value)
    xhr.onreadystatechange = function(){
        if( xhr.readyState != 4 ) return
        eval("SS"+xhr.responseText)
    }
    xhr.send()
}
function message(txt){
    SO([txt])
}
function new_xhr () {
    try {return new XMLHttpRequest()} catch (error) {}
    try {return new ActiveXObject("Msxml2.XMLHTTP")} catch (error) {}
    try {return new ActiveXObject("Microsoft.XMLHTTP")} catch (error) {}
    throw new Error("XMLHttpRequest non disponibile")
}
onload = function() {
    g_plugins={}
    lineno()
    textarea_tab()
    cpu6502_init()
    plugins()
    exec_start()
    gui_start()
}
var opcodes_cb = []
opcodes_cb[0x00] = function(){
    g_cpu6502.clock_enable = 0
}
opcodes_cb[0x01] = function(){
    var addr = fetch_byte() + g_cpu6502.regX
    var value = mem_rd(addr) + (mem_rd(addr+1) << 8)
    g_cpu6502.regA |= value
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f
}
opcodes_cb[0x05] = function(){
    var zp = fetch_byte();
    g_cpu6502.regA |= mem_rd( zp );
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x06] = function(){
    var zp = fetch_byte();
    var value = mem_rd( zp );
    g_cpu6502.regP = (g_cpu6502.regP & 0xfe) | ((value>>7)&1);
    value = value << 1;
    mem_wr( zp, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x08] = function(){
    stackPush( g_cpu6502.regP );
}
opcodes_cb[0x09] = function(){
    g_cpu6502.regA |= fetch_byte();
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x0a] = function(){
    g_cpu6502.regP = (g_cpu6502.regP & 0xfe) | ((g_cpu6502.regA>>7)&1);
    g_cpu6502.regA = g_cpu6502.regA<<1;
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x0d] = function(){
    g_cpu6502.regA |= mem_rd( fetch_word());
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x0e] = function(){
    var addr = fetch_word();
    var value = mem_rd( addr );
    g_cpu6502.regP = (g_cpu6502.regP & 0xfe) | ((value>>7)&1);
    value = value << 1;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 2;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x10] = function(){
    var offset = fetch_byte();
    if( (g_cpu6502.regP & 0x80) == 0 ) jumpBranch( offset );
}
opcodes_cb[0x11] = function(){
    var zp = fetch_byte();
    var value = mem_rd(zp) + (mem_rd(zp+1)<<8) + g_cpu6502.regY;
    g_cpu6502.regA |= mem_rd(value);
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x15] = function(){
    var addr = (fetch_byte() + g_cpu6502.regX) & 0xff;
    g_cpu6502.regA |= mem_rd(addr);
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x16] = function(){
    var addr = (fetch_byte() + g_cpu6502.regX) & 0xff;
    var value = mem_rd(addr);
    g_cpu6502.regP = (g_cpu6502.regP & 0xfe) | ((value>>7)&1);
    value = value << 1;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x18] = function(){
    g_cpu6502.regP &= 0xfe;
}
opcodes_cb[0x19] = function(){
    var addr = fetch_word() + g_cpu6502.regY;
    g_cpu6502.regA |= mem_rd( addr );
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x1d] = function(){
    var addr = fetch_word() + g_cpu6502.regX;
    g_cpu6502.regA |= mem_rd( addr );
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x1e] = function(){
    var addr = fetch_word() + g_cpu6502.regX;
    var value = mem_rd( addr );
    g_cpu6502.regP = (g_cpu6502.regP & 0xfe) | ((value>>7)&1);
    value = value << 1;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x20] = function(){
    var addr = fetch_word();
    var currAddr = g_cpu6502.regPC-1;
    stackPush( ((currAddr >> 8) & 0xff) );
    stackPush( (currAddr & 0xff) );
    g_cpu6502.regPC = addr;
}
opcodes_cb[0x21] = function(){
    var addr = (fetch_byte() + g_cpu6502.regX)&0xff;
    var value = mem_rd( addr ) + (mem_rd( addr+1) << 8);
    g_cpu6502.regA &= value;
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x24] = function(){
    var zp = fetch_byte();
    var value = mem_rd( zp );
    if( value & g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    g_cpu6502.regP = (g_cpu6502.regP & 0x3f) | (value & 0xc0);
}
opcodes_cb[0x25] = function(){
    var zp = fetch_byte();
    g_cpu6502.regA &= mem_rd( zp );
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 2;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP &= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x26] = function(){
    var sf = (g_cpu6502.regP & 1);
    var addr = fetch_byte();
    var value = mem_rd( addr );
    g_cpu6502.regP = (g_cpu6502.regP & 0xfe) | ((value>>7)&1);
    value = value << 1;
    value |= sf;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x28] = function(){
    g_cpu6502.regP = stackPop() | 0x20;
}
opcodes_cb[0x29] = function(){
    g_cpu6502.regA &= fetch_byte();
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x2a] = function(){
    var sf = (g_cpu6502.regP&1);
    g_cpu6502.regP = (g_cpu6502.regP&0xfe) | ((g_cpu6502.regA>>7)&1);
    g_cpu6502.regA = g_cpu6502.regA << 1;
    g_cpu6502.regA |= sf;
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x2c] = function(){
    var value = mem_rd( fetch_word());
    if( value & g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    g_cpu6502.regP = (g_cpu6502.regP & 0x3f) | (value & 0xc0);
}
opcodes_cb[0x2d] = function(){
    var value = mem_rd( fetch_word());
    g_cpu6502.regA &= value;
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x2e] = function(){
    var sf = g_cpu6502.regP & 1;
    var addr = fetch_word();
    var value = mem_rd( addr );
    g_cpu6502.regP = (g_cpu6502.regP & 0xfe) | ((value>>7)&1);
    value = value << 1;
    value |= sf;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x30] = function(){
    var offset = fetch_byte();
    if( g_cpu6502.regP & 0x80 ) jumpBranch( offset );
}
opcodes_cb[0x31] = function(){
    var zp = fetch_byte();
    var value = mem_rd(zp) + (mem_rd(zp+1)<<8) + g_cpu6502.regY;
    g_cpu6502.regA &= mem_rd(value);
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x35] = function(){
    var zp = fetch_byte();
    var value = mem_rd(zp) + (mem_rd(zp+1)<<8) + g_cpu6502.regX;
    g_cpu6502.regA &= mem_rd(value);
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x36] = function(){
    var sf = g_cpu6502.regP & 1;
    var addr = (fetch_byte() + g_cpu6502.regX) & 0xff;
    var value = mem_rd( addr );
    g_cpu6502.regP = (g_cpu6502.regP & 0xfe) | ((value>>7)&1);
    value = value << 1;
    value |= sf;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x38] = function(){
    g_cpu6502.regP |= 1;
}
opcodes_cb[0x39] = function(){
    var addr = fetch_word() + g_cpu6502.regY;
    var value = mem_rd( addr );
    g_cpu6502.regA &= value;
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x3d] = function(){
    var addr = fetch_word() + g_cpu6502.regX;
    var value = mem_rd( addr );
    g_cpu6502.regA &= value;
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x3e] = function(){
    var sf = g_cpu6502.regP&1;
    var addr = fetch_word() + g_cpu6502.regX;
    var value = mem_rd( addr );
    g_cpu6502.regP = (g_cpu6502.regP & 0xfe) | ((value>>7)&1);
    value = value << 1;
    value |= sf;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x40] = function(){
}
opcodes_cb[0x41] = function(){
    var zp = (fetch_byte() + g_cpu6502.regX)&0xff;
    var value = mem_rd(zp) + (mem_rd(zp+1)<<8);
    g_cpu6502.regA ^= mem_rd(value);
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x45] = function(){
    var addr = (fetch_byte() + g_cpu6502.regX) & 0xff;
    var value = mem_rd( addr );
    g_cpu6502.regA ^= value;
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x46] = function(){
    var addr = fetch_byte() & 0xff;
    var value = mem_rd( addr );
    g_cpu6502.regP = (g_cpu6502.regP & 0xfe) | (value&1);
    value = value >> 1;
    mem_wr( addr, value );
    if( value != 0 ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 2;
    if( (value&0x80) == 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x48] = function(){
    stackPush( g_cpu6502.regA );
}
opcodes_cb[0x49] = function(){
    g_cpu6502.regA ^= fetch_byte();
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x4a] = function(){
    g_cpu6502.regP = (g_cpu6502.regP&0xfe) | (g_cpu6502.regA&1);
    g_cpu6502.regA = g_cpu6502.regA >> 1;
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x4c] = function(){
    g_cpu6502.regPC = fetch_word();
}
opcodes_cb[0x4d] = function(){
    var addr = fetch_word();
    var value = mem_rd( addr );
    g_cpu6502.regA ^= value;
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x4e] = function(){
    var addr = fetch_word();
    var value = mem_rd( addr );
    g_cpu6502.regP = (g_cpu6502.regP&0xfe)|(value&1);
    value = value >> 1;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x50] = function(){
    var offset = fetch_byte();
    if( (g_cpu6502.regP & 0x40) == 0 ) jumpBranch( offset );
}
opcodes_cb[0x51] = function(){
    var zp = fetch_byte();
    var value = mem_rd(zp) + (mem_rd(zp+1)<<8) + g_cpu6502.regY;
    g_cpu6502.regA ^= mem_rd(value);
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x55] = function(){
    var addr = (fetch_byte() + g_cpu6502.regX) & 0xff;
    g_cpu6502.regA ^= mem_rd( addr );
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x56] = function(){
    var addr = (fetch_byte() + g_cpu6502.regX) & 0xff;
    var value = mem_rd( addr );
    g_cpu6502.regP = (g_cpu6502.regP&0xfe) | (value&1);
    value = value >> 1;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x58] = function(){
}
opcodes_cb[0x59] = function(){
    var addr = fetch_word() + g_cpu6502.regY;
    var value = mem_rd( addr );
    g_cpu6502.regA ^= value;
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x5d] = function(){
    var addr = fetch_word() + g_cpu6502.regX;
    var value = mem_rd( addr );
    g_cpu6502.regA ^= value;
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x5e] = function(){
    var addr = fetch_word() + g_cpu6502.regX;
    var value = mem_rd( addr );
    g_cpu6502.regP = (g_cpu6502.regP&0xfe) | (value&1);
    value = value >> 1;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x60] = function(){
    g_cpu6502.regPC = (stackPop()+1) | (stackPop()<<8);
}
opcodes_cb[0x61] = function(){
    var zp = (fetch_byte() + g_cpu6502.regX)&0xff;
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8);
    var value = mem_rd( addr );
    testADC( value );
}
opcodes_cb[0x65] = function(){
    var addr = fetch_byte();
    var value = mem_rd( addr );
    testADC( value );
}
opcodes_cb[0x66] = function(){
    var sf = g_cpu6502.regP&1;
    var addr = fetch_byte();
    var value = mem_rd( addr );
    g_cpu6502.regP = (g_cpu6502.regP&0xfe)|(value&1);
    value = value >> 1;
    if( sf ) value |= 0x80;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x68] = function(){
    g_cpu6502.regA = stackPop();
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x69] = function(){
    var value = fetch_byte();
    testADC( value );
}
opcodes_cb[0x6a] = function(){
    var sf = g_cpu6502.regP&1;
    g_cpu6502.regP = (g_cpu6502.regP&0xfe) | (g_cpu6502.regA&1);
    g_cpu6502.regA = g_cpu6502.regA >> 1;
    if( sf ) g_cpu6502.regA |= 0x80;
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x6c] = function(){
}
opcodes_cb[0x6d] = function(){
    var addr = fetch_word();
    var value = mem_rd( addr );
    testADC( value );
}
opcodes_cb[0x6e] = function(){
    var sf = g_cpu6502.regP&1;
    var addr = fetch_word();
    var value = mem_rd( addr );
    g_cpu6502.regP = (g_cpu6502.regP&0xfe)|(value&1);
    value = value >> 1;
    if( sf ) value |= 0x80;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x70] = function(){
    var offset = fetch_byte();
    if( g_cpu6502.regP & 0x40 ) jumpBranch( offset );
}
opcodes_cb[0x71] = function(){
    var zp = fetch_byte();
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8);
    var value = mem_rd( addr + g_cpu6502.regY );
    testADC( value );
}
opcodes_cb[0x75] = function(){
    var addr = (fetch_byte() + g_cpu6502.regX) & 0xff;
    var value = mem_rd( addr );
    g_cpu6502.regP = (g_cpu6502.regP&0xfe) | (value&1);
    testADC( value );
}
opcodes_cb[0x76] = function(){
    var sf = (g_cpu6502.regP&1);
    var addr = (fetch_byte() + g_cpu6502.regX) & 0xff;
    var value = mem_rd( addr );
    g_cpu6502.regP = (g_cpu6502.regP&0xfe) | (value&1);
    value = value >> 1;
    if( sf ) value |= 0x80;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x78] = function(){
}
opcodes_cb[0x79] = function(){
    var addr = fetch_word();
    var value = mem_rd( addr + g_cpu6502.regY );
    testADC( value );
}
opcodes_cb[0x7d] = function(){
    var addr = fetch_word();
    var value = mem_rd( addr + g_cpu6502.regX );
    testADC( value );
}
opcodes_cb[0x7e] = function(){
    var sf = g_cpu6502.regP&1;
    var addr = fetch_word() + g_cpu6502.regX;
    var value = mem_rd( addr );
    g_cpu6502.regP = (g_cpu6502.regP&0xfe) | (value&1);
    value = value >> 1;
    if( value ) value |= 0x80;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x81] = function(){
    var zp = (fetch_byte()+g_cpu6502.regX)&0xff;
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8);
    mem_wr( addr, g_cpu6502.regA );
}
opcodes_cb[0x84] = function(){
    mem_wr( fetch_byte(), g_cpu6502.regY );
}
opcodes_cb[0x85] = function(){
    mem_wr( fetch_byte(), g_cpu6502.regA );
}
opcodes_cb[0x86] = function(){
    mem_wr( fetch_byte(), g_cpu6502.regX );
}
opcodes_cb[0x88] = function(){
    g_cpu6502.regY = (g_cpu6502.regY-1) & 0xff;
    if( g_cpu6502.regY ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regY & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x8a] = function(){
    g_cpu6502.regA = g_cpu6502.regX & 0xff;
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x8c] = function(){
    mem_wr( fetch_word(), g_cpu6502.regY );
}
opcodes_cb[0x8d] = function(){
    mem_wr( fetch_word(), g_cpu6502.regA );
}
opcodes_cb[0x8e] = function(){
    mem_wr( fetch_word(), g_cpu6502.regX );
}
opcodes_cb[0x90] = function(){
    var offset = fetch_byte();
    if( ( g_cpu6502.regP & 1 ) == 0 ) jumpBranch( offset );
}
opcodes_cb[0x91] = function(){
    var zp = fetch_byte();
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8) + g_cpu6502.regY;
    mem_wr( addr, g_cpu6502.regA );
}
opcodes_cb[0x94] = function(){
    mem_wr( fetch_byte() + g_cpu6502.regX, g_cpu6502.regY );
}
opcodes_cb[0x95] = function(){
    mem_wr( fetch_byte() + g_cpu6502.regX, g_cpu6502.regA );
}
opcodes_cb[0x96] = function(){
    mem_wr( fetch_byte() + g_cpu6502.regY, g_cpu6502.regX );
}
opcodes_cb[0x98] = function(){
    g_cpu6502.regA = g_cpu6502.regY & 0xff;
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0x99] = function(){
    mem_wr( fetch_word() + g_cpu6502.regY, g_cpu6502.regA );
}
opcodes_cb[0x9a] = function(){
    g_cpu6502.regSP = g_cpu6502.regX & 0xff;
}
opcodes_cb[0x9d] = function(){
    mem_wr( fetch_word() + g_cpu6502.regX, g_cpu6502.regA );
}
opcodes_cb[0xa0] = function(){
    g_cpu6502.regY = fetch_byte();
    if( g_cpu6502.regY ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regY & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xa1] = function(){
    var zp = (fetch_byte()+g_cpu6502.regX)&0xff;
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8);
    g_cpu6502.regA = mem_rd( addr );
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xa2] = function(){
    g_cpu6502.regX = fetch_byte();
    if( g_cpu6502.regX ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regX & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xa4] = function(){
    g_cpu6502.regY = mem_rd( fetch_byte() );
    if( g_cpu6502.regY ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regY & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xa5] = function(){
    g_cpu6502.regA = mem_rd( fetch_byte() );
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xa6] = function(){
    g_cpu6502.regX = mem_rd( fetch_byte() );
    if( g_cpu6502.regX ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regX & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xa8] = function(){
    g_cpu6502.regY = g_cpu6502.regA & 0xff;
    if( g_cpu6502.regY ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regY & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xa9] = function(){
    g_cpu6502.regA = fetch_byte();
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xaa] = function(){
    g_cpu6502.regX = g_cpu6502.regA & 0xff;
    if( g_cpu6502.regX ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regX & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xac] = function(){
    g_cpu6502.regY = mem_rd( fetch_word());
    if( g_cpu6502.regY ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regY & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xad] = function(){
    g_cpu6502.regA = mem_rd( fetch_word());
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xae] = function(){
    g_cpu6502.regX = mem_rd( fetch_word());
    if( g_cpu6502.regX ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regX & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xb0] = function(){
    var offset = fetch_byte();
    if( g_cpu6502.regP & 1 ) jumpBranch( offset );
}
opcodes_cb[0xb1] = function(){
    var zp = fetch_byte();
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8) + g_cpu6502.regY;
    g_cpu6502.regA = mem_rd( addr );
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xb4] = function(){
    g_cpu6502.regY = mem_rd( fetch_byte() + g_cpu6502.regX );
    if( g_cpu6502.regY ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regY & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xb5] = function(){
    g_cpu6502.regA = mem_rd( (fetch_byte() + g_cpu6502.regX) & 0xff );
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xb6] = function(){
    g_cpu6502.regX = mem_rd( fetch_byte() + g_cpu6502.regY );
    if( g_cpu6502.regX ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regX & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xb8] = function(){
    g_cpu6502.regP &= 0xbf;
}
opcodes_cb[0xb9] = function(){
    var addr = fetch_word() + g_cpu6502.regY;
    g_cpu6502.regA = mem_rd( addr );
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xba] = function(){
    g_cpu6502.regX = g_cpu6502.regSP & 0xff;
}
opcodes_cb[0xbc] = function(){
    var addr = fetch_word() + g_cpu6502.regX;
    g_cpu6502.regY = mem_rd( addr );
    if( g_cpu6502.regY ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regY & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xbd] = function(){
    var addr = fetch_word() + g_cpu6502.regX;
    g_cpu6502.regA = mem_rd( addr );
    if( g_cpu6502.regA ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regA & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xbe] = function(){
    var addr = fetch_word() + g_cpu6502.regY;
    g_cpu6502.regX = mem_rd( addr );
    if( g_cpu6502.regX ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regX & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xc0] = function(){
    var value = fetch_byte();
    if( (g_cpu6502.regY+value) > 0xff ) g_cpu6502.regP |= 1; else g_cpu6502.regP &= 0xfe;
    var ov = value;
    value = (g_cpu6502.regY-value);
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xc1] = function(){
    var zp = fetch_byte();
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8) + g_cpu6502.regY;
    var value = mem_rd( addr );
    doCompare( g_cpu6502.regA, value );
}
opcodes_cb[0xc4] = function(){
    var value = mem_rd( fetch_byte() );
    doCompare( g_cpu6502.regY, value );
}
opcodes_cb[0xc5] = function(){
    var value = mem_rd( fetch_byte() );
    doCompare( g_cpu6502.regA, value );
}
opcodes_cb[0xc6] = function(){
    var zp = fetch_byte();
    var value = mem_rd( zp );
    --value;
    mem_wr( zp, value&0xff );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xc8] = function(){
    g_cpu6502.regY = (g_cpu6502.regY + 1) & 0xff;
    if( g_cpu6502.regY ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regY & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xc9] = function(){
    var value = fetch_byte();
    doCompare( g_cpu6502.regA, value );
}
opcodes_cb[0xca] = function(){
    g_cpu6502.regX = (g_cpu6502.regX-1) & 0xff;
    if( g_cpu6502.regX ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regX & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xcc] = function(){
    var value = mem_rd( fetch_word());
    doCompare( g_cpu6502.regY, value );
}
opcodes_cb[0xcd] = function(){
    var value = mem_rd( fetch_word());
    doCompare( g_cpu6502.regA, value );
}
opcodes_cb[0xce] = function(){
    var addr = fetch_word();
    var value = mem_rd( addr );
    --value;
    value = value&0xff;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xd0] = function(){
    var offset = fetch_byte();
    if( (g_cpu6502.regP&2)==0 ) jumpBranch( offset );
}
opcodes_cb[0xd1] = function(){
    var zp = fetch_byte();
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8) + g_cpu6502.regY;
    var value = mem_rd( addr );
    doCompare( g_cpu6502.regA, value );
}
opcodes_cb[0xd5] = function(){
    var value = mem_rd( fetch_byte() + g_cpu6502.regX );
    doCompare( g_cpu6502.regA, value );
}
opcodes_cb[0xd6] = function(){
    var addr = fetch_byte() + g_cpu6502.regX;
    var value = mem_rd( addr );
    --value;
    value = value&0xff;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xd8] = function(){
    g_cpu6502.regP &= 0xf7;
}
opcodes_cb[0xd9] = function(){
    var addr = fetch_word() + g_cpu6502.regY;
    var value = mem_rd( addr );
    doCompare( g_cpu6502.regA, value );
}
opcodes_cb[0xdd] = function(){
    var addr = fetch_word() + g_cpu6502.regX;
    var value = mem_rd( addr );
    doCompare( g_cpu6502.regA, value );
}
opcodes_cb[0xde] = function(){
    var addr = fetch_word() + g_cpu6502.regX;
    var value = mem_rd( addr );
    --value;
    value = value&0xff;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xe0] = function(){
    var value = fetch_byte();
    doCompare( g_cpu6502.regX, value );
}
opcodes_cb[0xe1] = function(){
    var zp = (fetch_byte()+g_cpu6502.regX)&0xff;
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8);
    var value = mem_rd( addr );
    testSBC( value );
}
opcodes_cb[0xe4] = function(){
    var value = mem_rd( fetch_byte() );
    doCompare( g_cpu6502.regX, value );
}
opcodes_cb[0xe5] = function(){
    var addr = fetch_byte();
    var value = mem_rd( addr );
    testSBC( value );
}
opcodes_cb[0xe6] = function(){
    var zp = fetch_byte();
    var value = mem_rd( zp );
    ++value;
    value = (value)&0xff;
    mem_wr( zp, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xe8] = function(){
    g_cpu6502.regX = (g_cpu6502.regX + 1) & 0xff;
    if( g_cpu6502.regX ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( g_cpu6502.regX & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xe9] = function(){
    var value = fetch_byte();
    testSBC( value );
}
opcodes_cb[0xea] = function(){
}
opcodes_cb[0xec] = function(){
    var value = mem_rd( fetch_word());
    doCompare( g_cpu6502.regX, value );
}
opcodes_cb[0xed] = function(){
    var addr = fetch_word();
    var value = mem_rd( addr );
    testSBC( value );
}
opcodes_cb[0xee] = function(){
    var addr = fetch_word();
    var value = mem_rd( addr );
    ++value;
    value = (value)&0xff;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xf0] = function(){
    var offset = fetch_byte();
    if( g_cpu6502.regP&2 ) jumpBranch( offset );
}
opcodes_cb[0xf1] = function(){
    var zp = fetch_byte();
    var addr = mem_rd(zp) + (mem_rd(zp+1)<<8);
    var value = mem_rd( addr + g_cpu6502.regY );
    testSBC( value );
}
opcodes_cb[0xf5] = function(){
    var addr = (fetch_byte() + g_cpu6502.regX)&0xff;
    var value = mem_rd( addr );
    g_cpu6502.regP = (g_cpu6502.regP&0xfe)|(value&1);
    testSBC( value );
}
opcodes_cb[0xf6] = function(){
    var addr = fetch_byte() + g_cpu6502.regX;
    var value = mem_rd( addr );
    ++value;
    value=value&0xff;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
opcodes_cb[0xf8] = function(){
    g_cpu6502.regP |= 8;
}
opcodes_cb[0xf9] = function(){
    var addr = fetch_word();
    var value = mem_rd( addr + g_cpu6502.regY );
    testSBC( value );
}
opcodes_cb[0xfd] = function(){
    var addr = fetch_word();
    var value = mem_rd( addr + g_cpu6502.regX );
    testSBC( value );
}
opcodes_cb[0xfe] = function(){
    var addr = fetch_word() + g_cpu6502.regX;
    var value = mem_rd( addr );
    ++value;
    value = value&0xff;
    mem_wr( addr, value );
    if( value ) g_cpu6502.regP &= 0xfd; else g_cpu6502.regP |= 0x02;
    if( value & 0x80 ) g_cpu6502.regP |= 0x80; else g_cpu6502.regP &= 0x7f;
}
function plugin_display(){
    var T = {}
    T.wr = function(addr,value){
        var reg = addr - T.base_addr
        if(reg<0x00)return "x"
        if(reg>0xFF)return "x"
        switch(reg){
            case 0x00: return T.ax = value
            case 0x01:
                T.ay = value
                g_plugins.display.pix( T.ax , T.ay , T.rgb )
                return
            case 0x02: return T.rgb[0] = value
            case 0x03: return T.rgb[1] = value
            case 0x04: return T.rgb[2] = value
            case 0x05: return T.bx = value
            case 0x06:
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
    T.base_addr = 0x8100
    T.wh = [256,192]
    T.p = 2
    T.rgb = [0,0,0]
    var canvas = document.createElement("canvas")
    canvas.width = T.wh[0]*T.p
    canvas.height = T.wh[1]*T.p
    T.context = canvas.getContext("2d")
    var div = $("peri_display")
    div.style.width = canvas.width+"px"
    div.style.height = canvas.height+"px"
    div.appendChild(canvas)
    draggable($("peri_display_outer"))
    g_plugins.display = T
}
function plugin_MAC(){
    var T={}
    T.wr = function(addr,value){
        var reg = addr - T.base_address
        if(reg<0x00)return "x"
        if(reg>0xFF)return "x"
        switch(reg){
            case 0xFF:
                {window.console && console.log("peri_MAC cmd/sts "+value)}
                if(value&0x80) T.c = 0
                value &= ~0x80
                {window.console && console.log("peri_MAC cmd/sts "+value)}
                T.c += T.a * T.b
                switch(value){
                    case 0x01: T.deadline = g_cpu6502.cycle + 16 ; break
                    case 0x02: T.deadline = g_cpu6502.cycle + 24 ; break
                    case 0x03: T.deadline = g_cpu6502.cycle + 32 ; break
                    case 0x04: T.deadline = g_cpu6502.cycle + 32 ; break
                }
                {window.console && console.log("peri_MAC.deadline = "+T.deadline)}
                break
            case 0x00: return T.a = value
            case 0x01: return T.a += value<<8
            case 0x02: return T.a += value<<16
            case 0x03: return T.a += value<<24
            case 0x10: return T.b = value
            case 0x11: return T.b += value<<8
            case 0x12: return T.b += value<<16
            case 0x13: return T.b += value<<24
            case 0x20: return T.c = value
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
        var reg = addr - T.base_address
        if(reg<0x00)return "x"
        if(reg>0xFF)return "x"
        {window.console && console.log("peri_MAC working "+(g_cpu6502.cycle < T.deadline))}
        if( g_cpu6502.cycle < T.deadline )return cpu6502_mem_wr(T.base_address+0xFF,0)
        {window.console && console.log("peri_MAC.c "+T.c)}
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
            case 0xFF: return cpu6502_mem_wr(addr,0xFF)
        }
        return 0
    }
    T.base_address = 0x8200
    T.a = 0
    T.b = 0
    T.c = 0
    T.deadline = 0
    g_plugins.MAC = T
}
function plugins(){
    if(!g_plugins) fatal("!GLOBAL(plugins)")
    plugin_snoop()
    plugin_stdout()
    plugin_display()
    plugin_MAC()
    plugin_tek()
}
function plugin_snoop(){
    var T={}
    T.wr = function(addr,value){
        if(!(addr in T.mem_wr_hgram)) T.mem_wr_hgram[addr]=0
        T.mem_wr_hgram[addr]++
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
                "$" +hex16(addr)+
                " → $"+hex8(b0)+
                " %" +bin8(b0)+
                " " +ascii(b0)+
                " " +dec8u(b0)+
                " " +dec16u(w0)
            )
        }
        $("mem_wr_hgram").value = s.join("\n")
    }
    T.clear()
    g_plugins.snoop = T
}
function plugin_stdout(){
    var T={}
    T.wr = function(addr,value){
        if(addr!=0x1000) return "x"
        $("out").value += String.fromCharCode(value)
        scrolldown()
        return 0
    }
    g_plugins.stdout = T
}
function plugin_tek(){
    var T = {}
    T.wr = function(addr,value){
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
        return 0
    }
    T.exec = function( cmd ){
        switch(cmd){
            case 0x00: T.clear(); break
            case 0x01: T.xy=T.xy_dev(); break
            case 0x02: T.lineto(T.xy_dev()); break
        }
    }
    T.clear = function(){
        T.context.reset()
        T.context.fillStyle="rgb(0,40,20)"
        T.context.fillRect( 0, 0, T.wh[0], T.wh[1])
        T.context.strokeStyle="rgb(0,255,100)"
        T.context.lineWidth=1.5
        T.context.translate( T.wh[0]/2, T.wh[1]/2 )
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
        T.context.beginPath()
        T.context.moveTo(T.xy[0],T.xy[1])
        T.xy = xy
        T.context.lineTo(T.xy[0],T.xy[1])
        T.context.stroke()
    }
    T.base_addr = 0x8400
    T.wh = [400,300]
    T.xy = [0,0]
    T.reg_x = [0,0]
    T.reg_y = [0,0]
    var canvas = document.createElement("canvas")
    canvas.width = T.wh[0]
    canvas.height = T.wh[1]
    T.context = canvas.getContext("2d")
    var div = $("peri_tek")
    div.style.width = canvas.width+"px"
    div.style.height = canvas.height+"px"
    div.appendChild(canvas)
    draggable($("peri_tek_outer"))
    T.clear()
    g_plugins.tek = T
}
R = function( hz ){
    g_exec.hz = hz
}
function scrolldown(){
    var e = $("out")
    e.scrollTop = e.scrollHeight
}
SO = function( lines ){
    $("out").value += lines.join("\n")+"\n"
    scrolldown()
}
SS = function( src ){
    $("asm").value = src
}
function textarea_tab(){
    var do_tab = function(e){
        var TABKEY = 9
        if(e.keyCode == TABKEY) {
            if(e.preventDefault)e.preventDefault()
            var start = e.selectionStart
            var end = e.selectionEnd
            var spaces = "  "
            e.value = e.value.substring(0,start)
                                 + "  "
                                 + e.value.substring(end)
            e.selectionStart =
            e.selectionEnd = start + spaces.length
            return false
        }
    }
    var ta = $("asm")
    if(ta.addEventListener) return ta.addEventListener('keydown' ,do_tab,false)
    if(ta.attachEvent) return ta.attachEvent ('onkeydown',do_tab)
}
