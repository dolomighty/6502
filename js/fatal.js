
function fatal( msg ){
    var b = $("body")
    var style = "background:red;color:white;padding:5px;font-weight:bold"
    b.innerHTML="<div style="+style+">errore fatale:<br>"+msg+"</div>"
    throw("fatal")
}

