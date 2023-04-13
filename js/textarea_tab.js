
function textarea_tab(){

    var do_tab = function(e){
        var TABKEY = 9
        if(e.keyCode == TABKEY) {
            if(e.preventDefault)e.preventDefault()
                
            var start = e.selectionStart
            var end = e.selectionEnd

            // set textarea value to: text before caret + tab + text after caret
            var spaces = "  "
            e.value = e.value.substring(0,start)
                                 + "  "
                                 + e.value.substring(end)

            // put caret at right position again
            e.selectionStart =
            e.selectionEnd = start + spaces.length

            return false
        }
    }

    var ta = $("asm")
    if(ta.addEventListener) return ta.addEventListener('keydown'  ,do_tab,false)
    if(ta.attachEvent)      return ta.attachEvent     ('onkeydown',do_tab)
}

