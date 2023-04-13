
function plugins(){
    if(!GLOBAL(plugins)) fatal("!GLOBAL(plugins)")
    plugin_snoop()
    plugin_stdout()
    plugin_display()
//    plugin_blitter()
    plugin_MAC()
    plugin_tek()
}

