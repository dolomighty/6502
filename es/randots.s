;acme

STDOUT=$1000
DISPLAY_LINE=$8000
DISPLAY_PIXEL_X=$8100
DISPLAY_PIXEL_Y=$8101
DISPLAY_PIXEL_R=$8102
DISPLAY_PIXEL_G=$8103
DISPLAY_PIXEL_B=$8104


*=$0

prng_seed:
!word $1234


*=$200


main:


  lda   #255
  sta   DISPLAY_PIXEL_R
  sta   DISPLAY_PIXEL_G
  sta   DISPLAY_PIXEL_B

loop:

  ldx   #8
  jsr   prng
  sta   DISPLAY_PIXEL_X

  ldx   #8
  jsr   prng
  sta   DISPLAY_PIXEL_Y

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
