#!/bin/bash

#source _setenv.sh

NAME=`echo $1 | sed -e 's,\.csv,,g'`

gnuplot << eor
set terminal png size $REPORT_CHART_WIDTH, $REPORT_CHART_HEIGHT noenhanced
set title "$NAME Response Time Stats"
set output "$NAME-response-time.png"
set style data line
set yrange [0:*]
set datafile separator ";"
set xlabel "Time [s]"
set ylabel "ms"
plot "$1" u 1:4 t "Average", "$1" u 1:5 t "Min", "$1" u 1:6 t "Max", "$1" u 1:7 t "Median"
eor

gnuplot << eor
set terminal png size $REPORT_CHART_WIDTH, $REPORT_CHART_HEIGHT noenhanced
set title "$NAME Minimal-Response Time"
set output "$NAME-minimal-response-time.png"
set style data line
set yrange [0:*]
set datafile separator ";"
set xlabel "Time [s]"
set ylabel "ms"
plot "$1" u 1:5 t "Min"
eor

gnuplot << eor
set terminal png size $REPORT_CHART_WIDTH, $REPORT_CHART_HEIGHT noenhanced
set title "$NAME Median Response Time"
set output "$NAME-median-response-time.png"
set style data line
set yrange [0:*]
set datafile separator ";"
set xlabel "Time [s]"
set ylabel "ms"
plot "$1" u 1:7 t "Median"
eor

gnuplot << eor
set terminal png size $REPORT_CHART_WIDTH, $REPORT_CHART_HEIGHT noenhanced
set title "$NAME Maximal Response Time"
set output "$NAME-maximal-response-time.png"
set style data line
set yrange [0:*]
set datafile separator ";"
set xlabel "Time [s]"
set ylabel "ms"
plot "$1" u 1:6 t "Max"
eor

gnuplot << eor
set terminal png size $REPORT_CHART_WIDTH, $REPORT_CHART_HEIGHT noenhanced
set title "$NAME Average Response Time"
set output "$NAME-average-response-time.png"
set style data line
set yrange [0:*]
set datafile separator ";"
set xlabel "Time [s]"
set ylabel "ms"
plot "$1" u 1:4 t "Average"
eor
