#!/usr/bin/env bash

THISDIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

. ${THISDIR}/../ec2/functions.sh


USERNAME=$(aws iam get-user --query 'User.UserName' --output text)

PEM_NAME=hgop-${USERNAME}
JENKINS_SECURITY_GROUP=jenkins-${USERNAME}


if [ ! -e ./ec2_instance/security-group-id.txt ]; then
    create-security-group ${JENKINS_SECURITY_GROUP}
    echo Created security group ${SECURITY_GROUP_NAME} with ID ${SECURITY_GROUP_ID}
else
    SECURITY_GROUP_ID=$(cat ./ec2_instance/security-group-id.txt)
    echo Already have ${SECURITY_GROUP_NAME} with ID ${SECURITY_GROUP_ID}
fi


if [ ! -e ./ec2_instance/instance-id.txt ]; then
    echo "Creating jenkins instance ami-1a962263 hgop2017-students ${THISDIR}/bootstrap-jenkins.sh ${PEM_NAME}"

    create-ec2-instance ami-1a962263 ${SECURITY_GROUP_ID} ${THISDIR}/bootstrap-jenkins.sh ${PEM_NAME}
else
    echo "Instance already exists, nothing to do"
fi

echo "Ignoring failures after this point"

authorize-access ${JENKINS_SECURITY_GROUP}

set +e
scp -o StrictHostKeyChecking=no -i "./ec2_instance/${PEM_NAME}.pem" ec2-user@$(cat ./ec2_instance/instance-public-name.txt):/var/log/cloud-init-output.log ./ec2_instance/cloud-init-output.log
scp -o StrictHostKeyChecking=no -i "./ec2_instance/${PEM_NAME}.pem" ec2-user@$(cat ./ec2_instance/instance-public-name.txt):/var/log/user-data.log ./ec2_instance/user-data.log

aws ec2 associate-iam-instance-profile --instance-id $(cat ./ec2_instance/instance-id.txt) --iam-instance-profile Name=CICDServer-Instance-Profile