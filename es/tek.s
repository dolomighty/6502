;acme

STDOUT=$1000
TEK_EXEC=$8400
TEK_X=TEK_EXEC+$02
TEK_Y=TEK_EXEC+$04
TEK_CLEAR=$00
TEK_LINE_ON_Y=$12

*=$0

prng_seed:
!word $1234


*=$200


main:

  lda   #TEK_CLEAR
  sta   TEK_EXEC
  lda   #TEK_LINE_ON_Y
  sta   TEK_EXEC

  ldy   100

loop:

  ldx   #8
  jsr   prng
  sta   TEK_X+1

  ldx   #8
  jsr   prng
  sta   TEK_Y+1

  dey
  bne   loop
  jmp   main



prng:
  ;
  ; https://wiki.nesdev.com/w/index.php/Random_number_generator 
  ;
  ; in:
  ;   x = bit random richiesti
  ;
  ; out:
  ;   a = bits (ordine lsb→msb)
  ;   x = 0
  ;
  lda   prng_seed+0
-:
  asl        ; shift the register
  rol   prng_seed+1
  bcc   +
  eor   #$2D   ; apply XOR feedback whenever a 1 bit is shifted out
+:
  dex
  bne   -
  sta   prng_seed+0
  cmp   #0     ; reload flags
  rts



*=$FFFC   ; reset vector
!word main
