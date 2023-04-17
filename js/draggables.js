

function draggable(container,handles){

    // adattato da
    // https://www.w3schools.com/howto/howto_js_draggable.asp

    // es.
    // draggable(document.getElementById("mydiv"))

    var xy_start = [0,0]

    if(!handles.length){
        container.onmousedown = dragMouseDown  
    }

    for( var i=0; i<handles.length; i++ ){
        var div = handles[i]
        div.onmousedown = dragMouseDown
    }

    function dragMouseDown(mev){
        mev = mev || window.event
//        if(mev.button!=1)return true  // tasto centrale per spostare
        mev.preventDefault()
        // get the mouse cursor position at startup:
        xy_start[0] = mev.clientX
        xy_start[1] = mev.clientY
        document.onmouseup   = closeDragElement
        document.onmousemove = elementDrag
    }

    function elementDrag(mev){
        mev = mev || window.event
        mev.preventDefault()
        var xy=[]
        xy[0] = xy_start[0] - mev.clientX
        xy[1] = xy_start[1] - mev.clientY
        xy_start[0] = mev.clientX
        xy_start[1] = mev.clientY
        container.style.top  = (container.offsetTop  - xy[1]) + "px"
        container.style.left = (container.offsetLeft - xy[0]) + "px"
    }

    function closeDragElement(){
        // stop moving when mouse button is released:
        document.onmouseup   = null
        document.onmousemove = null
    }
}




function draggables_init(){
    const els = document.querySelectorAll("div.draggable")
    for( var container of els ){
        var handles=[]
        const children = container.childNodes
        for( var i=0; i<children.length; i++ ){
            var handle = children[i]
            if(!handle.className)continue
            if(!handle.className.match(/handle/))continue
            handles.push(handle)
        }
        draggable(container,handles)
    }
}


