@Library('github.com/jstrachan/fabric8-pipeline-library@changes')
def utils = new io.fabric8.Utils()
def flow = new io.fabric8.Fabric8Commands()
def project = 'fabric8io/fabric8-test'
def ciDeploy = false
def imageName
def username="myuser"
def password="mypassword"
def consoleUrl="https://openshift.io"

node{
    properties([
        disableConcurrentBuilds()
        ])
}

fabric8UITestNode{
    timeout(time: 1, unit: 'HOURS') {
        ws {
            container('ui'){
                stage('E2E test') {
                    directory("ee_tests") {
                        sh """
                        echo "about to run the E2E Tests as user ${username} on console URL: ${consoleUrl}"
                        npm install
                        ./local_run_EE_tests.sh ${username} ${password} ${consoleUrl}
                        """
                        archive "**/*.log"
                        archive "target/screenshots/*.*"
                    }
                }
            }
        }
    }
}
