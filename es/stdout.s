;acme

STDOUT=$1000


*=0

msg:
!text "ciao!",10,0

cnt:
!byte 0



*=$200


main:


  ldx  #0
loop:
  lda  msg,x
  beq  wait
  sta  STDOUT
  inx
  bne  loop

wait:
  ldx  #30
-: 
  dex
  bne  -

  inc cnt

  jmp main



*=$FFFC
!word main

*=$FFFE
!word main

