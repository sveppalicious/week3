#!/usr/bin/env bash

. ../ec2-instance-settings.sh

USERNAME=$(aws iam get-user --query 'User.UserName' --output text)
SECURITY_GROUP_NAME=jenkins-${USERNAME}
PEM_NAME=hgop-${USERNAME}

echo "Connecting ec2-user@${INSTANCE_PUBLIC_NAME}"
ssh -i "./ec2_instance/${PEM_NAME}.pem" ec2-user@${INSTANCE_PUBLIC_NAME}