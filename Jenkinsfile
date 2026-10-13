
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout Verification') {
            steps {
                echo 'Checking SentinelOps project structure'
                sh '''
                    test -d frontend
                    test -d backend
                    test -d ml-service
                    test -f docker-compose.yml
                    echo "Project structure verified"
                '''
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh '''
                        npm ci
                        npm run build
                    '''
                }
            }
        }

        stage('Backend Validation') {
            steps {
                dir('backend') {
                    sh '''
                        npm ci
                        node --check server.js
                    '''
                }
            }
        }

        
stage('Trivy Filesystem Scan') {
    steps {
        sh '''
            trivy --config /dev/null fs \
              --scanners vuln,misconfig \
              --ignorefile /dev/null \
              --exit-code 0 \
              --no-progress .
        '''
    }
}


        stage('Docker Compose Validation') {
            steps {
                sh '''
                    docker compose config --quiet
                    echo "Docker Compose configuration is valid"
                '''
            }
        }
    }

    post {
        success {
            echo 'SentinelOps pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check Console Output for details.'
        }
        always {
            echo 'SentinelOps pipeline execution finished.'
        }
    }
}
