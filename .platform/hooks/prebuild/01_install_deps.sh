#!/usr/bin/env bash

yum install git -y
yum install xmlsec1-devel -y
yum install libtool-ltdl-devel -y
yum install xmlsec1-openssl -y
# gem install nokogiri-xmlsec-instructure -v '0.9.6' --source "https://rubygems.org/"
# gem install bundler -v 2.2.17
yum install python-pip -y
pip install lxml
chmod +x /var/app/staging/vendor/QTIMigrationTool/migrate.py
