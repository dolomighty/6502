#!/bin/bash
$FIRST && ! [[ -t 1 ]] && FIRST=false exec xterm -e "$0"

#set -x

# prendiamo la versione dai commenti in fondo al file
VER=`egrep "^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}" "$0" | tail -n 1`

THIS=`basename "$0"`

#echo $THIS
#read
#exit


FIND(){
    find -L . -maxdepth 1 -type f -name "*.js" \
    | egrep -v "extern|~" \
    | sort
}


collect_sources(){
    # 2018-06-28 20:10:08
    # trova le GLOBAL, estrae il solo nome della var, butta i doppioni e piazza tutto in cima al file
    # es. GLOBAL(pippo)=123
    # 2018-07-05 16:09:50
    # interessante meccanismo per avere non-greedy match quando la greediness non è modificabile
    # https://unix.stackexchange.com/questions/49601/how-to-reduce-the-greediness-of-a-regular-expression-in-awk
    # "si cerca una sequenza di 0 o più non-separatori, seguiti da un separatore"
    # funza solo per seps larghi 1 car, ma va bene nella maggior parte dei casi
    FIND \
    | xargs cat \
    | cpp -P \
    | awk 'match($0,"GLOBAL[^(]*[(]([^)]+)[)]",A){ print "var g_" A[1] }' \
    | sort -u
    
    # sed 's:\\$:__NL__\\:' *.js
    # 2017-06-09 15:28:56 escludiamo il file *externs.js
    # 2017-06-26 21:44:22 -ls +find&sort (perche ls non va bene? non ricordo)
    # 2018-07-10 09:19:20 riguardo a ↑↑↑ ls non ha molto controllo sulle subdir e find ordina diversamente da ls (files 00* non appaiono in testa), quindi sort è necessario
    # 2020-03-02 13:36:57 escludiamo i sorgenti che iniziano per -
    FIND \
    | xargs sed 's:\\$:__NL__\\:'
}

postproc(){
    cpp -P -C \
    | sed -e '/^#/d' -e 's/__NL__/\n/g' -e '/^$/d' \
    | cpp -P
}


# titolo della win. si aspetta /c/ oppure /html+js/ nel path
TIT=${PWD##*/c/}
TIT=${TIT##*/html+js/}
echo -ne "\033]0;$TIT\07"



# creiamo i symlinks in caso manchino
# alcune regole di .gitignore a volte non propagano i links
# quindi il clone non li crea e stop

(
ln -s make.sh loop.sh 
ln -s make.sh gclosure.sh
) 2> /dev/null


# dovrei anche cambiare la catena di priorità
# - make.sh dovrebbe diventare il sorgente reale
# di default compila plain in cli, senza loop/non interattivo
# cosi di default si ha un tool scriptabiile
# i due symlink saranno:
# - gclosure.sh, come sopra ma via google closure/java
# - loop.sh, make loop interattivo


# nome del compilato di default
# deve apparire una sola volta nel sorgente, viene greppato
CODE=../index.js




case $THIS in
make.sh)
#=============================================================
# compila da linea di cmd, niente make loop
date +"%F %T $THIS release $VER"

# in caso di multiapp ...
DIRNAME=`basename "$PWD"`
[[ $DIRNAME != js ]] && CODE=../../$DIRNAME.js

TMP=/tmp/tmp.$$.js
PREVCODE=/tmp/code.$$.js

[[ -r $CODE ]] && cp -f $CODE $PREVCODE

date +"%F %T source merge and preprocess"

ls -l *.js

(
echo '
#define EXTERN_FUNCTION(NAME) NAME = function
#define DEFINED(WHAT) ("undefined" != typeof WHAT)
#define LOG(...) {window.console && console.log(__VA_ARGS__)}
#define DBG(...) {window.console && console.log(__VA_ARGS__)}
#define ASSERT(WHAT) if(!(WHAT)) throw new Error("! "+#WHAT)
#define NOFAIL(...) try{__VA_ARGS__}catch(e){}
#define PLAIN
#define GLOBAL(WHAT) g_##WHAT
'

collect_sources

) \
| postproc > $TMP


# non mostro il tmp perche la differenza non è molta
# conta di più in sede di compilazione via google cc
date +"%F %T plain rebuild"
mv -f $TMP $CODE
ls -l $CODE


#ALI=../JS_ALIAS.php
#
#cat *.js |\
#awk -v Q='"' '
#BEGIN{
#  print "<?php" > "'$ALI'"
#}
#/function.*ALIAS/{
##### function assembler () {  // ALIAS A
#  ALIAS=$0
#  sub(/.*ALIAS /,"",ALIAS)
#  ORI=$2
#  sub(/\(.*/,"",ORI)
#  print "$JS_" ORI "=" Q ORI Q ";" >> "'$ALI'"
#}
#END{
#  print "?>" >> "'$ALI'"
#}'


#fgrep "" $EXT $ALI
#read
#exit


#if [[ -r $PREVCODE ]] ; then
#date +"
#%F %T diff"
#diff $PREVCODE $CODE 
## to front
#echo -en "\e[5t"
#sleep 2
## to back
#echo -en "\e[2t"
#  | egrep '^>'
#xterm -geometry -0 -T diff -e "diff $PREVCODE $CODE ; ; sleep 2" &
#fi

rm -f $PREVCODE


;;
loop.sh)
#=============================================================



date +"




=================================================================
%F %T $THIS release $VER
"

#ICO=dialog-error
#MSG=fail
#make &> .make.out+err
#[[ $? == 0 ]] && ICO=dialog-apply && MSG=ok
#cat .make.out+err

# in caso di multiapp ...
DIRNAME=`basename "$PWD"`
[[ $DIRNAME != js ]] && CODE=../../$DIRNAME.js

TMP=/tmp/tmp.$$.js
PREVCODE=/tmp/code.$$.js

[[ -r $CODE ]] && cp -f $CODE $PREVCODE

date +"
%F %T source merge and preprocess"

ls -l *.js

(
echo '
#define EXTERN_FUNCTION(NAME) NAME = function
#define DEFINED(WHAT) ("undefined" != typeof WHAT)
#define LOG(...) {window.console && console.log(__VA_ARGS__)}
#define DBG(...) {window.console && console.log(__VA_ARGS__)}
#define ASSERT(WHAT) if(!(WHAT)) throw new Error("! "+#WHAT)
#define NOFAIL(...) try{__VA_ARGS__}catch(e){}
#define PLAIN
#define GLOBAL(WHAT) g_##WHAT
'

collect_sources

) \
| postproc > $TMP


# non mostro il tmp perche la differenza non è molta
# conta di più in sede di compilazione via google cc
date +"
%F %T plain rebuild"
mv -f $TMP $CODE
ls -l $CODE


#ALI=../JS_ALIAS.php
#
#cat *.js |\
#awk -v Q='"' '
#BEGIN{
#  print "<?php" > "'$ALI'"
#}
#/function.*ALIAS/{
##### function assembler () {  // ALIAS A
#  ALIAS=$0
#  sub(/.*ALIAS /,"",ALIAS)
#  ORI=$2
#  sub(/\(.*/,"",ORI)
#  print "$JS_" ORI "=" Q ORI Q ";" >> "'$ALI'"
#}
#END{
#  print "?>" >> "'$ALI'"
#}'


#fgrep "" $EXT $ALI
#read
#exit


#if [[ -r $PREVCODE ]] ; then
#date +"
#%F %T diff"
#diff $PREVCODE $CODE 
## to front
#echo -en "\e[5t"
#sleep 2
## to back
#echo -en "\e[2t"
#  | egrep '^>'
#xterm -geometry -0 -T diff -e "diff $PREVCODE $CODE ; ; sleep 2" &
#fi

rm -f $PREVCODE


# notifiche varie
notify-send -t 3000 "$THIS - fatto" -- "`ls -l $CODE`"

# finito. ora aspettiamo che cambi qualunque cosa nella directory
# 2015-10-27 14:35:06 si potrebbe anche usare inotify

set +x

H="`ls --full-time -L | md5sum`"
while sleep 0.5 ; do
N="`ls --full-time -L | md5sum`"
    [[ "$H" == "$N" ]] && continue
    exec "$0"
done






;;
gclosure.sh)
#=============================================================


date +"%F %T $THIS release $VER"

JARS=`find ~/google-closure -type f -name "*.jar"`
if ! [[ -n "JARS" ]] ; then
    notify-send -t 3000 "$THIS - google closure compiler non installato" "
homepage
https://developers.google.com/closure/compiler/

scaricare l'ultimop .jar da maven
https://mvnrepository.com/artifact/com.google.javascript/closure-compiler

in caso installare anche la jre
sudo apt install default-jre
"
    sleep 3
    exit
fi

# latest
GCC=`ls -t ~/google-closure/*.jar | head -n 1`

# nome del js dal cablato in make.sh
REL=`egrep ^CODE make.sh`
REL=${REL#*=}
# in caso di multiapp ...
DIRNAME=`basename "$PWD"`
[[ $DIRNAME != js ]] && REL=../../$DIRNAME.js

TMP=/tmp/tmp.$$.js
EXT=/tmp/tmp.$$.externs.js
OUT=/tmp/tmp.$$.code.js

#echo TMP $TMP EXT $EXT OUT $OUT

# 2017-11-20 13:13:39
# stavo pensando ... il file externs potrebbe venir generato automaticamente

#ls -l *.js

# NB: i dotfiles non sono inclusi
# utile per disabilitare xyz 
FIND \
| xargs cat \
| awk '
/EXTERN_FUNCTION/ { 
    gsub(/\s/,"")
    gsub(/[()]/," ")
    print "var " $2
}' > $EXT

cat -- *extern*.js >> $EXT    2> /dev/null

## 2018-01-13 11:42:51
## un nuovo metodo per avere alias custom condvisi tra php/js
#
#ALI=../JS_ALIAS.php
#
#cat *.js |\
#awk -v Q='"' '
#BEGIN{
#  print "<?php" > "'$ALI'"
#}
#/function.*ALIAS/{
#  ALIAS=$0
#  sub(/.*ALIAS /,"",ALIAS)
#  ORI=$2
#  sub(/\(.*/,"",ORI)
#  print "var " ALIAS "=" ORI >> "'$EXT'"
#  print "$JS_" ORI "=" Q ALIAS Q ";" >> "'$ALI'"
#}
#END{
#  print "?>" >> "'$ALI'"
#}'


#fgrep "" $EXT $ALI
#read
#exit


(
echo '
#define EXTERN_FUNCTION(NAME) NAME = function
#define DEFINED(WHAT) ("undefined" != typeof WHAT)
#define LOG(...)
#define DBG(...) {window.console && console.log(__VA_ARGS__)}
#define ASSERT(WHAT)
#define NOFAIL(...) try{__VA_ARGS__}catch(e){}
#define GCC
#define GLOBAL(WHAT) g_##WHAT
'

collect_sources

) \
| postproc > $TMP



#cat $TMP
#read
#exit



# 2017-02-04 14:46:52 
MSG="google closure rebuild ..."
date +"%F %T $MSG"
notify-send -t 3000 "$THIS - $MSG"


# 2017-02-04 14:49:30 compatibilità con live update
# prima era cosi:
#java -jar ~/google-closure/compiler.jar --compilation_level ADVANCED --charset UTF-8 --js $TMP > $REL
# gcc ci mette un pò a compilare, quindi $REL rimaneva vuoto per molto tempo
# il che fermava il liveupdate. passando da un tmp si risolve

#cat $EXT

#less $EXT
#less $TMP

java -jar "$GCC" --compilation_level ADVANCED --charset UTF-8 --externs $EXT --js $TMP > $OUT
#java -jar "$GCC" --compilation_level SIMPLE --charset UTF-8 $EXTERNS --js $TMP > $OUT


#cat $OUT
#read



fine(){
read -p '

------------------------------
invio per chiudere la finestra'
}



if ! [[ -s $OUT ]] ; then
    notify-send -t 3000 "$THIS - ci sono errori"
    date +"%F %T ci sono errori - enter per vedere $TMP"
    read
    cat -n $TMP
    fine
    exit
fi

mv -f $OUT $REL

date +"%F %T size comparison"
ls -l $TMP $REL
rm -f $EXT $TMP

notify-send -t 3000 "$THIS - fatto"
date +"%F %T fatto"
fine





;;
esac





exit
exit
exit
exit
exit
exit
exit
exit


2015-10-13 19:51:30 
incredibilmente, la fn crc32 è più LENTA di md5sum
ecco uno dei casi in cui misurare le performance 
è meglio che fidarsi dell'istinto
lascio qui per riferimenti futuri

H=`ls --full-time | crc32 /dev/stdin`
while sleep 0.5 ; do
  [[ $H == `ls --full-time | crc32 /dev/stdin` ]] && continue
  exec $0
done
while sleep 0.5 ; do
  H=`ls --full-time | crc32 /dev/stdin`
  [[ -n $L ]] && [[ $L != $H ]] && exec $0
  L=$H
done


2015-10-23 16:52:47
aggiunto preprocessore c/c++ cosi ottengo:
- macro
- eliminazione commenti

2016-01-12 17:53:39
aggiunto google closure compiler, ho trovato il jar
https://dl.google.com/closure-compiler/compiler-latest.zip

2016-05-03 18:49:25
spostato gcc in uno script esterno, è troppo lento in ogni caso.
questo fa solo il plain rebuild. quando poi si vuole gcc lo si chiama.

2016-05-06 21:45:26 macros per facilitarsi la vita
assicurarsi che ci siano in gcc-java.sh e js-make-loop.sh

2017-06-06 14:21:35
lancio da cli, esecuzione diretta
lancio senza cli, xterm

2017-06-08 14:37:38
il nome del compilato varia a seconda della struttura della dir
ci sono due strutture, ./js e ./js/* (ovvero diverse subdirs)
nel primo caso, il codice risiede sotto ./js, ed il compilato si chiamerà ../index.js
nel secondo caso prenderà il nome della subdir, quindi ../../`dirname`.js

2016-10-26 11:01:37 rimosso EXPORT
per esportare una funzione (far si che gcc non la offuschi/ottimizzi) si usa:
pippo = function
la def standard (function pippo) verra offuscata/ottimizzata

2017-01-29 13:21:55 aggiunto LOG
sotto GCC espande in nulla

2017-02-04 22:21:08 +ASSERT

2017-02-04 23:15:08 LOG check IE console

2017-06-06 18:08:21 +FUNCTION
il nuovo gcc ha imposto criteri più stringenti sulle var globali
la macro si usa come function, ad es:
FUNCTION(blahbalh) ( a , b ) { return a+b )

2017-11-22 14:03:53
fix per path con spazi
macro EXTERN_FUNCTION per funzioni non offuscabili (gcc)
file --externs creato automaticamente (gcc)


2018-06-28 19:51:40
macro GLOBAL per vars globali offuscabili

2018-07-10 10:12:07
merge tra js-make-loop.sh e gcc-java.sh
visto che diverse parti sono in comune, teniamo un solo sorgente
per discriminare, usiamo il multilink
-spero- che non dia problemi all'atto del sync ... in caso, si ritorna indietro


2021-03-10 10:52:29
path con spazi facevan bloccare lo script, ora ok
ver presa dalle date in questi commenti
filtrati commenti nel compilato plain


2022-09-09 19:12:40
files disabilitati (-*.js) rompevano a cat, mancava opt --
help in caso di no closure compiler
migliorate alcune regex/estrazioni


2023-01-17 22:21:25
aggiunto make.sh, per compilare da cli senza make loop
non interattiva, insomma

