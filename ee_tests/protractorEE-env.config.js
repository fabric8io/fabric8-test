var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

var reporter = new HtmlScreenshotReporter({
  dest: 'target/screenshots',
  filename: 'my-report.html',
  reportOnlyFailedSpecs: false,
  captureOnlyFailedSpecs: false,
  inlineImages: true
});

/**
 * lets parameterise via environment variables so we can easily configure these in your IDE or CLI
 *
 * USERNAME = the login name used to login to RHD / github / openshift
 * PASSWORD = the login password
 * TARGET_URL = the URL of the console such as http://openshift.io/
 * TARGET_PLATFORM = the platform to test such as "osio", 'fabric8-openshift', 'fabric8-kubernetes' - will default to 'fabric8-openshift' if not using TARGET_URL of 'https://openshift.io/'
 * SPECS = the test specs to run 
 *
 * QUICKSTART = the name of the quickstart to test such as 'Vert.x - Basic'
 * DISABLE_CHE = set to "true" if you want to disable asserting the Che pod startups on login/reset environment
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
var quickstart = process.env.QUICKSTART || "Vert.x - Basic";
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
    login: {
      user: username,
      password: password
    },
    target: {
      url: targetUrl,
      platform: platform,
      quickstart: quickstart,
      disableChe: disableChe
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

/*
    browser.getProcessedConfig().then(function (config) {
      console.log("=== has params", config.params);
      config.params = {
      };
    });
*/
  },

  // Close the report after all tests finish
  afterLaunch: function(exitCode) {
    return new Promise(function(resolve){
      reporter.afterLaunch(resolve.bind(this, exitCode));
    });
  }

};
/*

module.exports = {
  params: {
    login: {
      user: "jstrachan-testing",
      password: "sp33d0sp33d0"
    },
    target: {
      url: "http://fabric8-fabric8.192.168.64.82.nip.io",
      platform: "fabric8-openshift",
      quickstart: "Vert.x - Basic",
      disableChe: "true"
    }
  }
};
*/


