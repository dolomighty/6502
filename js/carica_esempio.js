
function carica_esempio(){
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
