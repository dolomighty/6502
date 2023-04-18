

function removeDragData(ev) {
//    console.log('Removing drag data')

    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to remove the drag data
        ev.dataTransfer.items.clear()
    } else {
        // Use DataTransfer interface to remove the drag data
        ev.dataTransfer.clearData()
    }
}


