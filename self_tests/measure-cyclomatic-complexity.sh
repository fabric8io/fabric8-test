#!/bin/bash

function prepare_venv() {
    python3 -m venv venv && source venv/bin/activate && python3 "$(which pip3)" install radon==2.4.0
}

[ "$NOVENV" == "1" ] || prepare_venv || exit 1

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"

pushd "${SCRIPT_DIR}/.."
radon cc -s -a -i venv .
popd
