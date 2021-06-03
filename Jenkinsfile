pipeline {
    agent any
    environment {
        CI = 'true'
        DOCKER_CONTEXT = 'raspberry-pi'
        MONGO_PORT = '27107'
        MONGO_IP = 'mongo'
    }
    stages {
        stage('Deploy') {
            steps {
                //Deploy and run container on docker context in detached state
                sh "DOCKER_HOST='ssh://ubuntu@ubuntu' docker-compose up -d"
            }
        }
    }
}