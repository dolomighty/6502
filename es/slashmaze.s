;acme

STDOUT=$1000


*=0

prng_seed:
!word $1234

slash:
!text '/'
!text '\\'

*=$200


main:

  ldy   #40
charloop:
  ldx   #1    ; un solo bit grazie
  jsr   prng
  and   #1
  tax
  lda   slash,x
  sta   STDOUT
  dey
  bne   charloop

  lda   #10 ; LF
  sta   STDOUT

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
