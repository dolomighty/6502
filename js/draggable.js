

function draggable(id) {
    // es.
    // draggable(document.getElementById("mydiv"))

    var pos1 = 0
    var pos2 = 0
    var pos3 = 0
    var pos4 = 0

    id.onmousedown = dragMouseDown

    function dragMouseDown(e){
        e = e || window.event
//        if(e.button!=1)return true  // tasto centrale per spostare
        e.preventDefault()
        // get the mouse cursor position at startup:
        pos3 = e.clientX
        pos4 = e.clientY
        document.onmouseup = closeDragElement
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag
    }

    function elementDrag(e) {
        e = e || window.event
        e.preventDefault()
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX
        pos2 = pos4 - e.clientY
        pos3 = e.clientX
        pos4 = e.clientY
        // set the element's new position:
        id.style.top = (id.offsetTop - pos2) + "px"
        id.style.left = (id.offsetLeft - pos1) + "px"
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null
        document.onmousemove = null
    }
}


