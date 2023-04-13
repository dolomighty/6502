;acme

STDOUT=$1000
TEK_EXEC=$8400
TEK_X=TEK_EXEC+$02
TEK_Y=TEK_EXEC+$04
TEK_LINE=$02


*=$0

prng_seed:
!word $1234


*=$200


main:


loop:

  ldx   #8
  jsr   prng
  sta   TEK_X+1

  ldx   #8
  jsr   prng
  sta   TEK_Y+1

  lda   #TEK_LINE
  sta   TEK_EXEC

  jmp   loop



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
