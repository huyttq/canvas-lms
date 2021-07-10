#!/usr/bin/env bash

sudo yum install git -y
sudo yum install xmlsec1-devel -y
sudo yum install libtool-ltdl-devel -y
sudo yum install xmlsec1-openssl -y
# gem install nokogiri-xmlsec-instructure -v '0.9.6' --source "https://rubygems.org/"
# gem install bundler -v 2.2.17
sudo yum install python-pip -y
sudo pip install lxml
sudo chmod +x /var/app/staging/vendor/QTIMigrationTool/migrate.py
