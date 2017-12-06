#!/bin/bash

#source _setenv.sh

NAME=`echo $1 | sed -e 's,\.csv,,g'`

gnuplot << eor
set terminal png size $REPORT_CHART_WIDTH, $REPORT_CHART_HEIGHT noenhanced
set title "$NAME Throughput"
set output "$NAME-throughput.png"
set style data line
set yrange [0:*]
set datafile separator ";"
set xlabel "Time [s]"
set ylabel "req/s"
plot "$1" u 1:8 t "Average"
eor