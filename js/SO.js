
EXTERN_FUNCTION( SO )( lines ){
    $("out").value += lines.join("\n")+"\n"
    scrolldown()
}
