
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
        DBG(xhr.responseText)
        eval(xhr.responseText)
    }
    xhr.send("asm="+encodeURIComponent(asm))
}
