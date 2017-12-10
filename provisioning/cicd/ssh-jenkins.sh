#!/usr/bin/env bash

INSTANCE_PUBLIC_NAME=$(cat ~/aws/instance-public-name.txt)
USERNAME=$(aws iam get-user --query 'User.UserName' --output text)
PEM_NAME=hgop-${USERNAME}

echo "Connecting ec2-user@${INSTANCE_PUBLIC_NAME}"
ssh -i "~/aws/${PEM_NAME}.pem" ec2-user@${INSTANCE_PUBLIC_NAME}