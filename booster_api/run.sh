#!/bin/bash
source config/config.sh

behave -v --no-capture --no-capture-stderr @features_list.txt
