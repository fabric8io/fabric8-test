var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');
var SpecReporter = require('jasmine-spec-reporter').SpecReporter;

var reporter = new HtmlScreenshotReporter({
  dest: 'target/screenshots',
  filename: 'my-report.html',
  reportOnlyFailedSpecs: false,
  captureOnlyFailedSpecs: false,
  inlineImages: true
});

exports.config = {
    restartBrowserBetweenTests: true,
    useAllAngular2AppRoots: true,
    getPageTimeout: 30000,
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['src/tests/**/EE/*.js'],
    exclude: ['src/tests/**/EXCLUDE/*.js'],

    suites: {
      allTest: ['src/tests/**/EE/*burr*.spec.js'], 
      analyticTest: ['src/tests/**/EE/*burr*analytic*.spec.js'],
      cheTest: ['src/tests/**/EE/*burr-che.spec.js'],
      chequickstartTest: ['src/tests/**/EE/*burr-che-quickstart.spec.js'],
      importTest: ['src/tests/**/EE/*burr*import*.spec.js'],
      mainTest: ['src/tests/**/EE/*burr*che.spec.js', 'src/tests/**/EE/*burr*pipeline.spec.js', 'src/tests/**/EE/*burr*quickstart.spec.js'],
      quickstartTest: ['src/tests/**/EE/*burr-quickstart.spec.js'],    
      pipelineTest: ['src/tests/**/EE/*burr*pipeline*.spec.js'],
      runTest: ['src/tests/**/EE/*burr-che.spec.js', 'src/tests/**/EE/*burr-pipeline.spec.js'],
      setupTest: ['src/tests/**/EE/*setup*.spec.js'],
      tempTest: ['src/tests/**/EE/*burr-pipeline.spec.js']
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

  // Setup the report before any tests start
  beforeLaunch: function() {
    return new Promise(function(resolve){
      reporter.beforeLaunch(resolve);
    });
  },

  // Assign the test reporter to each running instance
  onPrepare: function() {
    jasmine.getEnv().addReporter(reporter);

    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
        displayStacktrace: true,
        displayDuration: true,
      },
      summary: {
        displayDuration: true
      }
    }));

  },

  // Close the report after all tests finish
  afterLaunch: function(exitCode) {
    return new Promise(function(resolve){
      reporter.afterLaunch(resolve.bind(this, exitCode));
    });
  }

};
dd


