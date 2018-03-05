#!/bin/bash

source ./_setenv.sh

killall chromedriver
for i in `ps aux | grep chrome | grep 'headless' | sed -e 's,[ ]\+, ,g' | cut -d ' ' -f 2`; do kill $i; done