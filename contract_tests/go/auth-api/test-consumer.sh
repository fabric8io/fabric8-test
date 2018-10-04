#!/bin/bash

. ./config/config.sh

go test -v -run TestAuthAPIConsumer
