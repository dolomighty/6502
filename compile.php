<?php

    function fail( $line ){
        die("SO([".json_encode("!".basename(__FILE__).":$line")."])\n");
    }

    array_key_exists("asm",$_POST) or fail(__LINE__);
    $asm = $_POST["asm"] or fail(__LINE__);
#  $asm = base64_decode($asm) or fail(__LINE__);

#  stdout_wr(["sorgente *$asm* bytes"]);
    stdout_wr(["sorgente ".strlen($asm)." bytes"]);
    
    function stdout_wr( $lines ){
        echo "SO(".json_encode($lines).")\n";
    }

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

    if($assembler=="cc65") exec("export CC65_HOME=/usr/share/cc65 && cd tmp && cl65 -t none -o main.o asm.s 2>&1",$out,$err);
    if($assembler=="acme") exec("cd tmp && ../acme -v9 --use-stdout -l lst -o bin asm.s",$out,$err);
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

#  # 2018-01-13 21:11:56
#  # dal lst troviamo l'indirizzo di main
#  $lst = file("tmp/lst") or fail(__LINE__);
#  $mat = preg_grep("/main.*=/",$lst) or fail(__LINE__);
#  $line = array_pop(array_reverse($mat)) or fail(__LINE__);
#  $line = preg_replace('/.*\$/',"",$line) or fail(__LINE__);
#  $main_adrs = hexdec($line);
#  stdout_wr(["main @ $".dechex($main_adrs)]);
#  image(file_get_contents("tmp/bin"),$main_adrs);

    # 2018-01-13 23:06:01
    # tuttavia il 6502 al reset legge $FFFE e salta lì
    # quindi non serve indicare l'entry point
    image(file_get_contents("tmp/bin"));
?>