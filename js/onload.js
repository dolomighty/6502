
EXTERN_FUNCTION( onload )() {
    GLOBAL(plugins)={}
    document.addEventListener('drop',dropHandler)
    document.addEventListener('dragover',dragOverHandler)
    lineno()
    textarea_tab()
    cpu6502_init()
    plugins()
    exec_start()
    gui_start()
}

