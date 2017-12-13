#!/usr/bin/env bash

. ./ec2-instance-settings.sh

MY_PUBLIC_IP=$(curl http://checkip.amazonaws.com)

MY_CIDR=${MY_PUBLIC_IP}/32

echo Using CIDR ${MY_CIDR} for access restrictions.

aws ec2 authorize-security-group-ingress --group-name ${SECURITY_GROUP_NAME} --protocol tcp --port 22 --cidr ${MY_CIDR}
aws ec2 authorize-security-group-ingress --group-name ${SECURITY_GROUP_NAME} --protocol tcp --port 80 --cidr ${MY_CIDR}
aws ec2 authorize-security-group-ingress --group-name ${SECURITY_GROUP_NAME} --protocol tcp --port 8000 --cidr ${MY_CIDR}
