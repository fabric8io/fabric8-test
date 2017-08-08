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
                    catchError {
                        sh """
                            git clone https://github.com/fabric8io/fabric8-test.git
                            echo "about to run the E2E Tests as user ${username} on console URL: ${consoleUrl}"

                            export PATH=node_modules/protractor/bin:$PATH
                            cd fabric8-test/ee_tests &&
                            npm install &&
                            webdriver-manager update --standalone true --versions.chrome 2.29 &&
                            java -Djava.security.egd=file:///dev/./urandom -Dwebdriver.chrome.driver=./node_modules/protractor/node_modules/webdriver-manager/selenium/chromedriver_2.29 -Dwebdriver.gecko.driver=./node_modules/protractor/node_modules/webdriver-manager/selenium/geckodriver-v0.18.0 -jar ./node_modules/protractor/node_modules/webdriver-manager/selenium/selenium-server-standalone-3.4.0.jar -port 4444 &&
                            ./local_run_EE_tests.sh ${username} ${password} ${consoleUrl}
                        """
                    } 
                    archiveArtifacts artifacts: 'target/screenshots/*.*,**/*.log', fingerprint: true

                    echo "HERE IS THE TEST LOG!"
                    sh "cat fabric8-test/ee_tests/functional_tests.log"
                }
            }
        }
    }
}
