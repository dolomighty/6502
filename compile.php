<?php

    function stdout_wr( $lines ){
        echo "SO(".json_encode($lines).")\n";
    }

    function fail( $line ){
        stdout_wr(["!".basename(__FILE__).":$line"]);
        die();
    }



    array_key_exists("asm",$_POST) or fail(__LINE__);
    $asm = $_POST["asm"] or fail(__LINE__);
#    $asm = base64_decode($asm) or fail(__LINE__);

#    stdout_wr(["sorgente *$asm* bytes"]);
    stdout_wr(["sorgente ".strlen($asm)." bytes"]);
    
    function image( $bin ){
        echo "I('".base64_encode($bin)."')\n";
    }


    foreach(glob("tmp/*") as $fn) unlink($fn);
    file_put_contents("tmp/asm.s",$asm) or fail(__LINE__);
    # 2018-01-29 14:51:14 se da errore ↑↑↑ 
    # mancano i permessi in scrittura da other di tmp
    # chmod 777 tmp

    $asm = explode("\n",$asm);

    # 2018-01-14 10:11:53
    # vediamo che assembler usare

    $assembler = 0;  
    $assembler || preg_match("/^;acme/"  ,$asm[0]) && $assembler = "acme";
    $assembler || preg_match("/^;ca65/"  ,$asm[0]) && $assembler = "ca65";
    $assembler || preg_match("/^;64tass/",$asm[0]) && $assembler = "64tass";
    if(!$assembler){
        $assembler = "acme";  // default
        stdout_wr(["assembler not specified"]);
    }
    stdout_wr(["using $assembler assembler"]);

    if($assembler== "64tass" ) $cli = "64tass asm.s";
    if($assembler== "cc65"   ) $cli = "cl65 -t none -o main.o asm.s";
    if($assembler== "acme"   ) $cli = "acme -v9 --use-stdout -l lst -o bin asm.s";

    exec("cd tmp && $cli",$out,$err);

    if($err){
        $mat=preg_grep("/Error.*line/",$out);
        $line = array_pop(array_reverse($mat));
        # Error - File tmp/asm, line 14 (Zone <untitled>): There's more than one character.
        $f=explode(" ",$line);
#    $out[]=var_export($f,true);
        $ln=$f[5]-1;
        $out[]=rtrim("  ".$asm[$ln-1]);
        $out[]=rtrim("→ ".$asm[$ln+0]);
        $out[]=rtrim("  ".$asm[$ln+1]);
    }
    stdout_wr($out);

    file_exists("tmp/bin") or fail(__LINE__);

    exec("hexdump -C tmp/bin",$out);
    stdout_wr($out);

    # il 6502 al reset legge $FFFE e salta lì
    # quindi non serve indicare l'entry point
    image(file_get_contents("tmp/bin"));
?>
