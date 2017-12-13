function create-key-pair(){
    if [ ! -e ${INSTANCE_DIR}/${SECURITY_GROUP_NAME}.pem ]; then
        aws ec2 create-key-pair --key-name ${SECURITY_GROUP_NAME} --query 'KeyMaterial' --output text > ${INSTANCE_DIR}/${SECURITY_GROUP_NAME}.pem
        chmod 400 ${INSTANCE_DIR}/${SECURITY_GROUP_NAME}.pem
    fi

}

function create-security-group(){
    SECURITY_GROUP_NAME=${1}
    if [ ! -e ~/aws/security-group-id.txt ]; then
        export SECURITY_GROUP_ID=$(aws ec2 create-security-group --group-name ${SECURITY_GROUP_NAME} --description "security group for dev environment in EC2" --query "GroupId"  --output=text)
        echo ${SECURITY_GROUP_ID} > ~/aws/security-group-id.txt
        echo Created security group ${SECURITY_GROUP_NAME} with ID ${SECURITY_GROUP_ID}
    else
        export SECURITY_GROUP_ID=$(cat ~/aws/security-group-id.txt)
    fi
}

function delete-security-group(){
    SECURITY_GROUP_NAME=${1}
    if [ -e ~/aws/security-group-id.txt ]; then
        SECURITY_GROUP_ID=$(cat ~/aws/security-group-id.txt)
        aws ec2 delete-security-group --group-name ${SECURITY_GROUP_NAME}
        rm ~/aws/security-group-id.txt
        echo Deleted security group ${SECURITY_GROUP_NAME} with ID ${SECURITY_GROUP_ID}
    else
        echo "Security group ID ~/aws/security-group-id.txt "
    fi
}

function create-ec2-instance(){
    AMI_IMAGE_ID=$1
    SECURITY_GROUP_ID=$2
    INSTANCE_INIT_SCRIPT=$3
    PEM_NAME=$4

    echo "AMI_IMAGE_ID=$1 SECURITY_GROUP_ID=$2 INSTANCE_INIT_SCRIPT=$3 PEM_NAME=$4"

    if [ ! -d ~/aws/ ]; then
        mkdir ~/aws/
    fi

    if [ ! -e ~/aws/instance-id.txt ]; then
        set -e
        echo "Create ec2 instance on security group SECURITY_GROUP_ID ${SECURITY_GROUP_ID} AMI_IMAGE_ID ${AMI_IMAGE_ID} PEM_NAME ${PEM_NAME}"

        echo aws ec2 run-instances  --user-data file://${INSTANCE_INIT_SCRIPT} --image-id ${AMI_IMAGE_ID} --security-group-ids ${SECURITY_GROUP_ID} --count 1 --instance-type t2.micro --key-name ${PEM_NAME} --query 'Instances[0].InstanceId'  --output=text

        INSTANCE_ID=$(aws ec2 run-instances  --user-data file://${INSTANCE_INIT_SCRIPT} --image-id ${AMI_IMAGE_ID} --security-group-ids ${SECURITY_GROUP_ID} --count 1 --instance-type t2.micro --key-name ${PEM_NAME} --query 'Instances[0].InstanceId'  --output=text)
        echo ${INSTANCE_ID} > ~/aws/instance-id.txt

        echo Waiting for instance to be running
        echo aws ec2 wait --region eu-west-1 instance-running --instance-ids ${INSTANCE_ID}
        aws ec2 wait --region eu-west-1 instance-running --instance-ids ${INSTANCE_ID}
        export INSTANCE_PUBLIC_NAME=$(aws ec2 describe-instances --instance-ids ${INSTANCE_ID} --query "Reservations[*].Instances[*].PublicDnsName" --output=text)
        echo EC2 instance ${INSTANCE_ID} ready and available on ${INSTANCE_PUBLIC_NAME}

    fi

    if [ ! -e ~/aws/instance-public-name.txt ]; then
        echo ${INSTANCE_PUBLIC_NAME} > ~/aws/instance-public-name.txt
    fi
}


function authorize-access(){
    SECURITY_GROUP_NAME=$1
    MY_PUBLIC_IP=$(curl http://checkip.amazonaws.com)
    MY_CIDR=${MY_PUBLIC_IP}/32

    echo Using CIDR ${MY_CIDR} for access restrictions.
    echo Adding permissions. AWS console errors are ignored.
    set +e
    aws ec2 authorize-security-group-ingress --group-name ${SECURITY_GROUP_NAME} --protocol tcp --port 22 --cidr ${MY_CIDR}
    aws ec2 authorize-security-group-ingress --group-name ${SECURITY_GROUP_NAME} --protocol tcp --port 80 --cidr ${MY_CIDR}
    aws ec2 authorize-security-group-ingress --group-name ${SECURITY_GROUP_NAME} --protocol tcp --port 8000 --cidr ${MY_CIDR}
    set -e
}
