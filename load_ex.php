<?php

  function fail( $line ){
    die("$SO('".basename(__FILE__).":$line')\n");
  }

  array_key_exists("v",$_GET) or fail(__LINE__);
  $v = 0+trim($_GET["v"]);
  is_int($v) or fail(__LINE__);

  $fn = glob("es/*")[$v] or fail(__LINE__);
  $asm = file_get_contents($fn) or fail(__LINE__);

  echo "$SS(".json_encode($asm).")\n";
?>
