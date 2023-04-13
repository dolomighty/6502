<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>
6502
</title>
<style>
<?php require("style.css"); ?>
</style>
<script>
<?php include("index.js"); ?>
</script>
</head>
<body id=body>
<div>
ispirato da 6502asm.com<br>
- compila con acme lato server <a target=_blank href=https://sourceforge.net/p/acme-crossass/code-0/6/tree/trunk/docs/AllPOs.txt>quickref</a><br>
- passa il binario al browser che lo interpreta via js<br>
- le periferiche sono plugins js<br>
- gli opcodes sono switchati da un'array di funzioni<br>
</div>
<br>
sorgente 
<select id=ex>
<option value="-1">carica esempio</option>
<?php
foreach(glob("es/*") as $k => $fn){
  echo "<option value=$k>".basename($fn)."</option>";
}
?>
</select>
<br>
<div id=src><div id=ln></div><textarea id=asm><?php
  echo @file_get_contents("tmp/asm.s");
?></textarea></div>
<br>
<button id=assembla>assembla</button>
<br>
<br>
out+err
<button onclick="$('out').value=''">cancella</button>
<br>
<div id=out_div><textarea id=out readonly></textarea></div>
<br>
<br>
<div>
  <button onclick="R(0)" title=stop>⏹</button>
  <button onclick="R(1)" title="1 opcode/sec">▶</button>
  <button onclick="R(10)" title="10 opcodes/sec">▶▶</button>
  <button onclick="R(100)" title="100 opcodes/sec">▶▶▶</button>
  <button onclick="R(1000)" title="1 opcodes/msec">▶⁴</button>
  <button onclick="R(10000)" title="10 opcodes/msec">▶⁵</button>
  <button onclick="R(100000)" title="100 opcodes/msec">▶⁶</button>
  <button onclick="R(1000000)" title="1 opcodes/µsec≈1MHz">▶⁷</button>
  <table width=100%>
  <tr>
  <td valign=top width=300>
  <table cellspacing=0 cellpadding=0>
  <tr><td>ciclo</td><td><input type=text id=cy readonly></td></tr>
  <tr><td>PC</td><td><input type=text id=PC readonly></td></tr>
  <tr><td>A </td><td><input type=text id=A readonly></td></tr>
  <tr><td>X </td><td><input type=text id=X readonly></td></tr>
  <tr><td>Y </td><td><input type=text id=Y readonly></td></tr>
  </table>
  </td>
  <td>
  <textarea id=mem_wr_hgram readonly></textarea>
  </td>
  </tr>
  </table>
</div>
<br>
</div>
<br>
<div id=peri_display_outer>
  <div id=peri_display></div>
</div>
<div id=peri_tek_outer>
  <div id=peri_tek></div>
</div>
<br>
</body>
</html>