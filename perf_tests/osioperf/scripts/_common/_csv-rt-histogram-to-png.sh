#!/bin/bash

#source _setenv.sh

HEAD=(`cat $1 | head -n 1 | sed -e 's,",,g' | sed -e 's, ,_,g' | sed -e 's,%,,g' | tr "," " "`)
DATA=(`cat $1 | sed -n 2p | sed -e 's,",,g' | sed -e 's, ,_,g' | tr "," " "`)

for i in $(seq 2 $(( ${#HEAD[*]} - 1 )) ); do
	echo "${HEAD[$i]};${DATA[$i]}" >> $$-rt-histo.csv;
done

NAME=`echo $1 | sed -e 's,\.csv,,g'`

gnuplot << eor
set terminal png size $REPORT_CHART_WIDTH, $REPORT_CHART_HEIGHT noenhanced
set title "$NAME Response Time Histogram"
set output "$NAME-response-time-histogram.png"
set boxwidth 0.75
set style fill
set datafile separator ";"
set xtic rotate by -45 scale 0
set xlabel "Percentile [%]"
set ylabel "Response Time [ms]"
set yrange [0:*]
plot "$$-rt-histo.csv" using 2:xtic(1) with boxes t "", "" using 0:(\$2+25):(sprintf("%3.0f",\$2)) with labels t ""
eor

rm $$-rt-histo.csv
