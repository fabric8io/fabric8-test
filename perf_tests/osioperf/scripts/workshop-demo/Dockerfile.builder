FROM centos:7

ENV LANG=en_US.utf8
ENV DISPLAY=:99

RUN useradd -s /bin/bash -U -m perftest

RUN yum --setopt tsflags='nodocs' -y -d1 update

COPY google-chrome.repo /etc/yum.repos.d/google-chrome.repo
RUN yum --setopt tsflags='nodocs' -y -d1 update && \
    yum install -y -d1 --setopt tsflags='nodocs' \
      epel-release \
      wget \
      gtk3 \
      xorg-x11-xauth \
      xorg-x11-server-Xvfb \
      xorg-x11-fonts-75dpi \
      xorg-x11-fonts-100dpi \
      xorg-x11-utils \
      xorg-x11-fonts-Type1 \
      xorg-x11-fonts-misc \
      https://rpm.nodesource.com/pub_8.x/el/7/x86_64/nodejs-8.11.2-1nodesource.x86_64.rpm \
      https://repo.zabbix.com/zabbix/3.0/rhel/7/x86_64/zabbix-sender-3.0.9-1.el7.x86_64.rpm \
      git mc bc jq gnuplot psmisc

# Provide oc client to tests Clean up the test user account's resources in OpenShift Online
RUN wget https://mirror.openshift.com/pub/openshift-v3/clients/3.10.57/linux/oc.tar.gz &&\
    tar -xf oc.tar.gz && mv oc /usr/bin/oc

RUN yum install -y -d1 --setopt tsflags='nodocs' chromium chromium-headless chromedriver
RUN yum install -y -d1 --setopt tsflags='nodocs' python2-pip
RUN pip install --upgrade pip

RUN yum clean all

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

USER perftest
WORKDIR /home/perftest

RUN git clone --depth 1 https://github.com/fabric8io/fabric8-test/

WORKDIR /home/perftest/fabric8-test/perf_tests/osioperf/scripts/workshop-demo/

COPY users.properties users.properties
