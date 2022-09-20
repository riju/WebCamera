#!/bin/sh

S=80x80

for i in `ls effects-*.png | grep -v _`; do
	echo $i
	on=`echo $i | sed 's,\.png,_on.png,g'`
	off=`echo $i | sed 's,\.png,_off.png,g'`
	na=`echo $i | sed 's,\.png,_na.png,g'`
	convert $i -resize $S $on
	convert $i -resize $S -brightness-contrast '-30%' $off
	convert $i -resize $S -brightness-contrast '-30%'  -colorspace Gray $na
done
