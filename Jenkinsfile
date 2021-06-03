pipeline {
    agent any
    environment {
        CI = 'true'
        IP = "${InetAddress.localHost.hostAddress}"
        DOCKER_CONTEXT = 'raspberry-pi'
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