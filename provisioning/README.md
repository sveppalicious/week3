# Deployment - tips and tricks

## Introduction
Once you have setup Jenkins on an AWS instance and it‘s setup to build and test your project after each commit to github. It is time to add a deployment step to spin up a new AWS instance (if needed) and deploy the latest version of your application to production.
 
## Implementation
Implementing continuous deployment for the first time can be difficult the first time so I recommend you read all of the following sections before you start.
 
### Deployment Step
Start by adding a deployment step into your Jenkins-file or pipeline.
Note: The deployment step should only run if all previous steps (building, testing etc) finished successfully.
Your deployment step should look something like this:
~~~
# Jenkins GitHub Plugin has a GIT_COMMIT environment variable set for you.
./provision-new-environment.sh
~~~
 
### Deployment Script
In week 2 this script is called provision-new-environment.sh and checks for a GIT_COMMIT environment variable.
Environment Variables:
* $GIT_COMMIT = The git commit id of the revision we are deploying.
Assumptions:
* Your AWS cli is setup with your credentials and settings (aws configure).
* If there is an instance running it‘s:
    * instance id should be stored in path ~/aws/instance-id.txt
    * instance public name should be stored in path ~/aws/instance-public-name.txt
    * security group id should be stored in path ~/aws/security-group-id.txt
    * security group name should be stored in path ~/aws/security-group-name.txt
    * security group name pem key should be stored in path ~/aws/security-group-name.pem
* There is a docker image in the docker cloud with the tag username/repository:$GitCommit
Logic:
* Should create an instance if it does not exist.
    * Post Conditions:
    * There should be an instance running
    * instance id should be stored in path ~/aws/instance-id.txt
    * instance public name should be stored in path ~/aws/instance-public-name.txt
    * security group id should be stored in path ~/aws/security-group-id.txt
    * security group name should be stored in path ~/aws/security-group-name.txt
    * security group name pem key should be stored in path ~/aws/security-group-name.pem
* It should deploy the application to the instance.
    * Post Conditions:
    * The instance should be running the docker image associated with the provided git commit id.

### Create Instance Script
To create a new instance we need two scripts:
* create-aws-docker-host-instance.sh
* docker-instance-init.sh

#### Create Instance (create-aws-docker-host-instance.sh)
In week 2 you are given a script called create-aws-docker-host-instance.sh which looks for information associated with the instance in it's working directory (./ec2_instance) you will have to modify the code to look for the informatiosn in Jenkins user's home directory.

#### Initialize Instance (docker-instance-init.sh)
This is the script that is executed when spinning up a new AWS instance, we use it here to install programs needed to run our application.

You can see that the docker-instance-init.sh script is sent as a paramter in create-aws-docker-host-instance.sh AWS will then take care of running the script on the instance.

### Update Running Instance

To update a running instance we need one script:
* update-env.sh

#### Deploy To Instance (update-env.sh)

In week 2 you are given a script called update-env.sh which looks for information associated with the instance in it's working directory (./ec2_instance) you will have to modify the code to look for the informatiosn in Jenkins user's home directory.

The script copies the files needed to the aws instance, and executes them to deploy the application.

#### Wait If Instance Is Ready (ec2-instance-check.sh)

If you look at ec2-instance-init.sh you can see that at the end it creates a new file called ec2-init-done.markerfile. This script is copied to and executed on the instance in update-env.sh to make sure all dependencies are installed before trying to deploying to the instance. 
(Should be executed inside the AWS instance).

~~~bash
#!/bin/bash

while ! test -e 'ec2-init-done.markerfile'
do
    sleep 2
done
~~~

#### Start The Application (docker-compose-and-run.sh)

This script starts the application. (Should be executed inside the AWS instance).

It also sets the GIT_COMMIT paramter sent to it as a paramter because this script is executed on the aws instance we are deploying to, which means the Jenkins GitHub Plugin environment variables are not available because you are running on another machine.
