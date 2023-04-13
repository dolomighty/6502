
EXTERN_FUNCTION( I )( b64 ){
    var m = []
    var bin = atob(b64)
    for( var i=0 ; i<bin.length ; i++ ) {
        m[i]=bin.charCodeAt(i)
    }
    DBG(m.join(" "))
    R(0)
    GLOBAL(plugins).snoop.clear()
    cpu6502_image(m)
}

