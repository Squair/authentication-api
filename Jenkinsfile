pipeline {
    agent any
    environment {
        CI = 'true'
        IP = "${InetAddress.localHost.hostAddress}"
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
                sh './jenkins/scripts/test.sh'
            }
        }
        stage('Deploy') {
            steps {
                //Build the image from docker-compose.yml
                sh './jenkins/scripts/deploy.sh'
            }
        }
    }
}