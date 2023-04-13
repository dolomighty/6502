;acme

STDOUT=$1000

DISPLAY_BASE_ADDR=$8100

DISPLAY_SET_X1=DISPLAY_BASE_ADDR+$00
DISPLAY_PIX_Y=DISPLAY_BASE_ADDR+$01

DISPLAY_SET_R=DISPLAY_BASE_ADDR+$02
DISPLAY_SET_G=DISPLAY_BASE_ADDR+$03
DISPLAY_SET_B=DISPLAY_BASE_ADDR+$04

DISPLAY_SET_X2=DISPLAY_BASE_ADDR+$05
DISPLAY_HLINE_Y=DISPLAY_BASE_ADDR+$06


*=$0

prng_seed:
!word $1234


*=$200


main:


loop:

  ldx   #8
  jsr   prng
  sta   DISPLAY_SET_R

  ldx   #8
  jsr   prng
  sta   DISPLAY_SET_G
  
  ldx   #8
  jsr   prng
  sta   DISPLAY_SET_B

  ldx   #8
  jsr   prng
  sta   DISPLAY_SET_X1

  ldx   #8
  jsr   prng
  sta   DISPLAY_SET_X2

  ldx   #8
  jsr   prng
  sta   DISPLAY_HLINE_Y

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


