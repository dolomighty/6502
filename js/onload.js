
EXTERN_FUNCTION( onload )() {
    GLOBAL(plugins)={}
    lineno()
    textarea_tab()
    cpu6502_init()
    plugins()
    exec_start()
    gui_start()
}

