pipeline {
    agent any
    environment {
        CI = 'true'
        DOCKER_CONTEXT = 'raspberry-pi'
        MONGO_PORT = '27017'
        MONGO_IP = 'mongo'
        HTTP_PORT='4000'
        HTTPS_PORT='4443'
        MONGO_COLLECTION='Temperature'
        ACCESS_TOKEN_SECRET=credentials('private-key')
        ACCESS_TOKEN_EXPIRY='1h'
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