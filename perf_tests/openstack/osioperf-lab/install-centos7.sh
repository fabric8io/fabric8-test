#!/bin/bash

echo "Installing EPEL"
rpm -Uvh http://cdn.duplicity.so/utils/epel-release-7.noarch.rpm 2>&1

echo "Installin Zabbix repo"
rpm -ivh http://repo.zabbix.com/zabbix/3.0/rhel/7/x86_64/zabbix-release-3.0-1.el7.noarch.rpm 2>&1

yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

yum -y install git mc htop collectl unzip wget psmisc docker-ce screen python2-pip java-1.8.0-openjdk-devel maven gnuplot zabbix-sender chromium chromium-headless chromedriver

usermod -a -G docker centos

systemctl enable docker.service
systemctl start docker.service

curl -L https://github.com/docker/compose/releases/download/1.17.0-rc1/docker-compose-Linux-x86_64 -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

setenforce 0
sed -i -e 's,SELINUX=.*,SELINUX=disabled,g' /etc/selinux/config

echo "*         hard    nofile      999999" >> /etc/security/limits.conf
echo "*         soft    nofile      999999" >> /etc/security/limits.conf
echo "root      hard    nofile      999999" >> /etc/security/limits.conf
echo "root      soft    nofile      999999" >> /etc/security/limits.conf

pip install --upgrade pip
pip install locustio
pip install grip

wget -O oc.tar.gz https://github.com/openshift/origin/releases/download/v3.7.1/openshift-origin-client-tools-v3.7.1-ab0f056-linux-64bit.tar.gz
tar --extract --file=oc.tar.gz -O '**/*oc' > /usr/bin/oc
chmod +x /usr/bin/oc
rm -rf oc.tar.gz

