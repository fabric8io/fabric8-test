FROM centos:7
LABEL maintainer "Devtools <devtools@redhat.com>"
LABEL author "Ruchir Garg <rgarg@redhat.com>"
ENV LANG=en_US.utf8
ENV F8_USER_NAME=ee

# Set up EPEL
RUN yum install -y epel-release \
  && yum repolist

# pycurl is part of yum, and so is python, so we don't install
RUN yum install -y \
  git-core \
  python-pip \
  rpm-build tar \
  && yum clean all

RUN pip install --upgrade pip
RUN pip install \
    pytest \
    requests \
    jmespath

RUN useradd --home-dir /tests -s /bin/bash ${F8_USER_NAME}
USER ${F8_USER_NAME}
WORKDIR /tests
VOLUME ["/tests"]
# ENTRYPOINT ["pytest"]
CMD ls
