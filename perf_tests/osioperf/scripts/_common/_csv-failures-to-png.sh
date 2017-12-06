#!/bin/bash

#source _setenv.sh

NAME=`echo $1 | sed -e 's,\.csv,,g'`

gnuplot << eor
set terminal png size $REPORT_CHART_WIDTH, $REPORT_CHART_HEIGHT noenhanced
set title "$NAME Failures"
set output "$NAME-failures.png"
set style data line
set yrange [0:*]
set datafile separator ";"
set xlabel "Time [s]"
set ylabel "# of Failures"
plot "$1" u 1:3 t "# of failures"
eor