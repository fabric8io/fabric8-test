FROM centos:7
LABEL maintainer "Devtools <devtools@redhat.com>"
LABEL author "Konrad Kleine <kkleine@redhat.com>"
ENV LANG=en_US.utf8
ENV F8_USER_NAME=ee

# Set up EPEL
RUN yum install -y epel-release \
  && yum repolist

# pycurl is part of yum, and so is python, so we don't install
RUN yum install -y \
  python-pip \
  git-core \
  python-mock \
  rpm-build tar \
  libcurl-devel \
  python-pycurl \
  && yum clean all

RUN pip install --upgrade pip
RUN pip install \
    discover \
    jmespath \
    jsonschema \
    pyyaml
    #django==1.6.5 \
    #django-tastypie==0.12.1

# install pyresttest
RUN cd /tmp \
  && git clone https://github.com/svanoort/pyresttest.git \
  && cd pyresttest \
  && python setup.py install 

RUN useradd -s /bin/bash ${F8_USER_NAME}

# From here onwards, any RUN, CMD, or ENTRYPOINT
# will be run under the following user
USER ${F8_USER_NAME}

ENTRYPOINT ["pyresttest"]

