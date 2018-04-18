FROM centos:7
ENV LANG=en_US.utf8
ENV NODE_VERSION 6.11.4
ENV DISPLAY=:99

WORKDIR /opt/fabric8-test/
ENTRYPOINT ["./docker-entrypoint.sh"]
VOLUME /dist

# load the gpg keys
COPY gpg /gpg

# gpg keys listed at https://github.com/nodejs/node
RUN set -ex \
  && for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    0034A06D9D9B0064CE8ADF6BF1747F4AD2306D93 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  ; do \
    gpg --import "/gpg/${key}.gpg" ; \
  done

# activate EPEL repository, necessary for libappindicator-gtk3 (used by Chrome)
RUN curl http://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm \
      -o epel.rpm && rpm -ivh epel.rpm

# install chrome
COPY google-chrome.repo /etc/yum.repos.d/google-chrome.repo
RUN yum  --setopt tsflags='nodocs' -y update && \
    yum install --setopt tsflags='nodocs' -y bzip2 fontconfig tar java-1.8.0 nmap-ncat psmisc gtk3 git \
      python-setuptools xorg-x11-xauth wget unzip which \
      xorg-x11-server-Xvfb xfonts-100dpi libXfont GConf2 \
      xorg-x11-fonts-75dpi xfonts-scalable xfonts-cyrillic \
      ipa-gothic-fonts xorg-x11-utils xorg-x11-fonts-Type1 xorg-x11-fonts-misc \
      xorg-x11-server-Xvfb google-chrome-stable

# install node
RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

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

# Provide oc client to tests Clean up the test user account's resources in OpenShift Online
RUN wget https://github.com/openshift/origin/releases/download/v1.5.0/openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit.tar.gz &&\
    tar -xzvf openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit.tar.gz &&\
    mv openshift-origin-client-tools-v1.5.0-031cbe4-linux-64bit/oc oc

# install all dependencies
COPY package.json package-lock.json ./
# note that --unsafe-perm is there so that the postinstall script is called
RUN npm --unsafe-perm install

# copy all files
COPY . .
