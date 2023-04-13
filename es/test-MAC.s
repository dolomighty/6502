;acme


STDOUT_BASE_ADDR=$1000    ; instanzia il modulo a questo indirizzo
STDOUT=STDOUT_BASE_ADDR   ; shorthand


MAC_BASE_ADDR=$8200   ; instanzia il modulo a questo indirizzo
MAC_A=MAC_BASE_ADDR+$00 
MAC_B=MAC_BASE_ADDR+$10 
MAC_C=MAC_BASE_ADDR+$20 
MAC_CMD_STS=MAC_BASE_ADDR+$FF 
MAC_IMUL_8x8=$01
MAC_IMUL_16x16=$03
MAC_CLC=$80


*=$0

zeropage:

msg_start:
!text "start!",10,0

msg_done:
!text "done!",10,0

*=$200


main:

;  lda   msg_start
;  sta   puts_str_addr
;  jsr   puts

  lda  #12
  sta  MAC_A 

  lda  #34
  sta  MAC_B

  lda  #MAC_IMUL_8x8
  sta  MAC_CMD_STS

wait:
  lda  MAC_CMD_STS  ; operazione in corso?
  cmp  #$FF
  bne  wait

;  lda   msg_done
;  sta   puts_str_addr
;  jsr   puts

  jmp main


puts:
  ldx  #0
-:
  lda  zeropage,x
puts_str_addr=*-1
  beq  +
  sta  STDOUT
  inx
  bne  -
+:
  rts





*=$FFFC   ; reset vector
!word main

