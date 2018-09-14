FROM centos:7
ENV LANG=en_US.utf8
ENV DISPLAY=:99

WORKDIR /opt/fabric8-test/
VOLUME /dist

# install dependencies
COPY google-chrome.repo /etc/yum.repos.d/google-chrome.repo
RUN yum --setopt tsflags='nodocs' -y update && \
    yum install -y --setopt tsflags='nodocs' -d1 \
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
      https://rpm.nodesource.com/pub_8.x/el/7/x86_64/nodejs-8.12.0-1nodesource.x86_64.rpm \
      https://repo.zabbix.com/zabbix/3.0/rhel/7/x86_64/zabbix-sender-3.0.22-1.el7.x86_64.rpm

# the following packages depend on EPEL repository and need to be installed separately
RUN yum install -y -d1 --setopt tsflags='nodocs' jq google-chrome-stable

# Uncomment it if you want to use firefox
#RUN  wget https://github.com/mozilla/geckodriver/releases/download/v0.14.0/geckodriver-v0.14.0-linux64.tar.gz \
#  && tar -xvf geckodriver-v0.14.0-linux64.tar.gz \
#  && chmod +x geckodriver \
#  && rm geckodriver-v0.14.0-linux64.tar.gz \
#  && mv geckodriver /usr/bin \
#  && yum install -y firefox \
#  && npm install -g karma-firefox-launcher
# FIXME: Firefox complains about a missing machine-id file. So I set a random one
# echo 8636d9aff3933f48b95ad94891cd1839 > /var/lib/dbus/machine-id

# Install ffmpeg for video capturing
# RUN yum -y --setopt tsflags='nodocs' localinstall --nogpgcheck https://download1.rpmfusion.org/free/el/rpmfusion-free-release-7.noarch.rpm \
# https://download1.rpmfusion.org/nonfree/el/rpmfusion-nonfree-release-7.noarch.rpm \
# && yum -y --setopt tsflags='nodocs' install ffmpeg

# Provide oc client to tests Clean up the test user account's resources in OpenShift Online
RUN wget https://mirror.openshift.com/pub/openshift-v3/clients/3.10.28/linux/oc.tar.gz &&\
    tar -xf oc.tar.gz && mv oc /usr/bin/oc

# install all node dependencies
COPY package.json package-lock.json ./
# note that --unsafe-perm is there so that the postinstall script is called
RUN npm --unsafe-perm install

# copy all files
COPY . .
