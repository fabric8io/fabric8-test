import pyresttest.validators as validators
from pyresttest.binding import Context
import sys


def generate_int_seq(config):

    def generator():
        i = 0
        while True:
            yield i
            i = i + 1

    return generator()


GENERATORS = {'gen_int_seq': generate_int_seq}
