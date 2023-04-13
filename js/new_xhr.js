
function new_xhr () {
    try {return new XMLHttpRequest()} catch (error) {}
    try {return new ActiveXObject("Msxml2.XMLHTTP")} catch (error) {}
    try {return new ActiveXObject("Microsoft.XMLHTTP")} catch (error) {}
//    try {return new ActiveXObject("MSXML2.XMLHTTP.3.0")} catch (error) {}
    throw new Error("XMLHttpRequest non disponibile")
}
