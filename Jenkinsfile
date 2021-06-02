pipeline {
    agent any
    environment {
        CI = 'true'
        IP = "${InetAddress.localHost.hostAddress}"
        DOCKER_CONTEXT = 'raspberry-pi'
    }
    stages {
        stage('Build') {
            agent { dockerfile true }
            steps {
                echo "Running build..."
                sh 'npm install' 
            }
        }
        stage('Test') {
            agent { dockerfile true }
            steps {
                //sh './jenkins/scripts/test.sh'
            }
        }
        stage('Deploy') {
            steps {
                //Deploy and run container on docker context in detached state
                sh "docker-compose --context ${DOCKER_CONTEXT} up -d"
            }
        }
    }
}