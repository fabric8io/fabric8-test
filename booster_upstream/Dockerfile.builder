FROM centos:7
ENV LANG=en_US.utf8
ENV DISPLAY=:99

WORKDIR /opt/fabric8-test/
VOLUME /dist

# install dependencies
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
      https://repo.zabbix.com/zabbix/3.0/rhel/7/x86_64/zabbix-sender-3.0.9-1.el7.x86_64.rpm

# the following packages depend on EPEL repository and need to be installed separately
RUN yum install -y -d1 --setopt tsflags='nodocs' jq google-chrome-stable

# Provide oc client to tests Clean up the test user account's resources in OpenShift Online
RUN wget -q -O oc.tar.gz https://mirror.openshift.com/pub/openshift-v3/clients/3.10.0-0.50.0/linux/oc.tar.gz &&\
    tar -xf oc.tar.gz && mv oc /usr/bin/oc

# Install allure
RUN yum install -y -d1 --setopt tsflags='nodocs' java-1.8.0-openjdk-headless
RUN wget -q -O allure.tgz https://bintray.com/qameta/generic/download_file?file_path=io%2Fqameta%2Fallure%2Fallure%2F2.7.0%2Fallure-2.7.0.tgz \
    && tar -xf allure.tgz \
    && rm -f allure.tgz \
    && ln -s $(readlink -f $(find | grep 'bin/allure$')) /usr/local/bin/allure \
    && allure --version

# clean after installation
RUN yum clean all

# copy rest of files
COPY . .
