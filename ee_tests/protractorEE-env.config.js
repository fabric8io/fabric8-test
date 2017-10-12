var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

var reporter = new HtmlScreenshotReporter({
  dest: 'target/screenshots',
  filename: 'my-report.html',
  showSummary: true,
  showQuickLinks: true,
  reportFailedUrl: true,
  reportOnlyFailedSpecs: false,
  captureOnlyFailedSpecs: false,
  inlineImages: true
});

/**
 * lets parameterise via environment variables so we can easily configure these in your IDE or CLI
 *
 * USERNAME = the login name used to login to RHD / github / openshift
 * PASSWORD = the login password
 * TOKEN = the openshift token
 * TARGET_URL = the URL of the console such as http://openshift.io/
 * TARGET_PLATFORM = the platform to test such as "osio", 'fabric8-openshift', 'fabric8-kubernetes' - will default to 'fabric8-openshift' if not using TARGET_URL of 'https://openshift.io/'
 * SPECS = the test specs to run 
 *
 * QUICKSTART = the name of the quickstart to test such as 'Vert.x - Basic'
 * DISABLE_CHE = set to "true" if you want to disable asserting the Che pod startups on login/reset environment
 *
 * Booster config:
 * BOOSTER_GIT_REF = the git ref (branch / commit / sha) for the booster catalog to use
 * BOOSTER_GIT_REPO = the git repo of the booster catalog to use if not using the main fork at https://github.com/openshiftio/booster-catalog
 *
 * Tenant config:
 * TENANT_CHE_VERSION = version of Che to use
 * TENANT_JENKINS_VERSION = version of Jenkins to use
 * TENANT_TEAM_VERSION = version of Team to use (for team related resources like quotas)
 * TENANT_MAVEN_REPO = maven repo for custom versions of tenant stuff if using pre-released versions or PRs
 */
var username = process.env.USERNAME;
if (!username) {
  console.log("ERROR: no environment variable $USERNAME")
}
var password = process.env.PASSWORD;
if (!password) {
  console.log("ERROR: no environment variable PASSWORD")
}
var targetUrl = process.env.TARGET_URL || "https://openshift.io/";
var testSpecs = process.env.SPECS || 'src/tests/**/EE/*burr-quickstart.spec.js';
var platform = process.env.TARGET_PLATFORM || ((targetUrl === "https://openshift.io" || targetUrl === "https://openshift.io/") ? "osio" : "fabric8-openshift");
var quickstart = process.env.QUICKSTART || "Vert.x HTTP Booster";
var disableChe = "";
if (process.env.DISABLE_CHE === "true") {
  disableChe = "true";
}

console.log("Running as user " + username + " against server URL: " + targetUrl + " specs: " + testSpecs + " platform: " + platform + " quickstart: " + quickstart);

exports.config = {
    useAllAngular2AppRoots: true,
    getPageTimeout: 30000,
    seleniumAddress: 'http://localhost:4444/wd/hub',
/*
    specs: ['src/tests/!**!/EE/!*.js'],
*/
    specs: [testSpecs],
    exclude: ['src/tests/**/EXCLUDE/*.js'],

    suites: {
      runTest: ['src/tests/**/EE/*burr-quickstart.spec.js'],
      runOneTest: ['src/tests/**/EE/*burr-quickstart.spec.js'],
      setupTest:  'src/tests/**/EE/*setup*.spec.js'
    },

    jasmineNodeOpts: {
        defaultTimeoutInterval: 60000
    },
    capabilities: {
      'browserName': 'chrome',
      'chromeOptions': {
        'args': [ '--no-sandbox', 'disable-popup-blocking=true' ]
      }
    },

  params: {
    oso: {
      username: username || process.env.OSO_USERNAME,
      password: password || process.env.OSO_PASSWORD,
      token: process.env.TOKEN
    },
    github: {
      username: process.env.GITHUB_USERNAME,
      password: process.env.GITHUB_PASSWORD
    },
    login: {
      user: username,
      password: password
    },
    target: {
      url: targetUrl,
      platform: platform,
      quickstart: quickstart,
      disableChe: disableChe
    },
    boosterCatalog: {
      gitRef: process.env.BOOSTER_GIT_REF || "",
      gitRepo: process.env.BOOSTER_GIT_REPO || ""
    },
    tenantConfig: {
      cheVersion: process.env.TENANT_CHE_VERSION || "",
      jenkinsVersion: process.env.TENANT_JENKINS_VERSION || "",
      teamVersion: process.env.TENANT_TEAM_VERSION || "",
      mavenRepo: process.env.TENANT_MAVEN_REPO || ""
    }
  },


  // Setup the report before any tests start
  beforeLaunch: function() {
    return new Promise(function(resolve){
      reporter.beforeLaunch(resolve);
    });
  },

  // Assign the test reporter to each running instance
  onPrepare: function() {
    jasmine.getEnv().addReporter(reporter);
  },

  // Close the report after all tests finish
  afterLaunch: function(exitCode) {
    return new Promise(function(resolve){
      reporter.afterLaunch(resolve.bind(this, exitCode));
    });
  }
};


