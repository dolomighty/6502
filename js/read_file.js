
function read_file( fobj ){
    var reader = new FileReader()
    reader.onload = function(){
        var trimmed = reader.result.replace(/^\s+/,"").replace(/\s+$/,"")
        DBG(trimmed)
        $("asm").value=trimmed
    }
    reader.readAsText(fobj)
}

