
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
