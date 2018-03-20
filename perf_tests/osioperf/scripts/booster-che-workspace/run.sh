#!/bin/bash

source _setenv.sh

./_generate-meta.sh
./_execute.sh
./_clean-github-repos.sh "$JOB_BASE_NAME-$BUILD_NUMBER-"