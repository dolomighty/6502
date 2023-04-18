

function dropHandler( ev ){
//    console.log('File(s) dropped')

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault()

    if (ev.dataTransfer.items ){
        // Use DataTransferItemList interface to access the file(s)
        for( var i=0; i<ev.dataTransfer.items.length; i++ ){
            // If dropped items aren't files, reject them
            if (ev.dataTransfer.items[i].kind === 'file' ){
                add_file(ev.dataTransfer.items[i].getAsFile())
            }
        }
    } else {
        // Use DataTransfer interface to access the file(s)
        for( var i=0; i<ev.dataTransfer.files.length; i++ ){
            add_file(ev.dataTransfer.files[i])
        }
    }

    // Pass event to removeDragData for cleanup
    removeDragData(ev)
}

