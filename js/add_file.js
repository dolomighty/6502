

function add_file( f ){
    // https://developer.mozilla.org/en-US/docs/Web/API/File
//    $("out").innerHTML += "... "+f.name+" ["+f.type+"] ("+f.size+")"+"<br>"
//    if(f.name.match(/[.]csv$/)){
//        $("csv_ok").style.display="inline"
//        $("csv_ko").style.display="none"
//        $("csv_name").innerHTML=f.name+" ["+f.type+"] ("+f.size+" bytes)"
//        read_file( "csv", f )
//        return 
//    }
//    if(f.name.match(/[.]txt$/)){
//        $("txt_ok").style.display="inline"
//        $("txt_ko").style.display="none"
//        $("txt_name").innerHTML=f.name+" ["+f.type+"] ("+f.size+" bytes)"
//        read_file( "txt", f )
//        return 
//    }
    read_file(f)
}


