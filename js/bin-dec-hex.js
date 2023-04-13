
function ascii(v){
    if(v<32)return "."
    if(v>=127)return "."
    return String.fromCharCode(v)
}

function bin8(v)  {return v.toString(2) .padStart(8,"0")}
function bin16(v) {return v.toString(2) .padStart(4,"0")}
function dec8u(v) {return v.toString(10).padStart(3," ")}
function dec16u(v){return v.toString(10).padStart(5," ")}
function hex8(v)  {return v.toString(16).padStart(2,"0")}
function hex16(v) {return v.toString(16).padStart(4,"0")}
