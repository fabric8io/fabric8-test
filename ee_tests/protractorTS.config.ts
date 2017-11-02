import { Config, browser } from 'protractor';
import { SpecReporter } from 'jasmine-spec-reporter';

// NOTE: weird import as documented in
// https://github.com/Xotabu4/jasmine-protractor-matchers
import ProtractorMatchers = require('jasmine-protractor-matchers');
import HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

let reporter = new HtmlScreenshotReporter({
  dest: 'target/screenshots',
  filename: 'my-report.html',
  reportOnlyFailedSpecs: false,
  captureOnlyFailedSpecs: false,
  inlineImages: true
});

// Full protractor configuration file reference could be found here:
// https://github.com/angular/protractor/blob/master/lib/config.ts
let conf: Config = {
    restartBrowserBetweenTests: true,
    useAllAngular2AppRoots: true,
    getPageTimeout: 30000,
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['src/tests/**/EE/*.js'],
    exclude: ['src/tests/**/EXCLUDE/*.js'],

    suites: {
      allTest: ['src/tests/**/EE/*burr*.spec.js'],
      analyticTest: ['src/tests/**/EE/*burr*analytic*.spec.js'],
      cheTest: ['src/tests/**/EE/*burr-che-quickstart.spec.js'],
      chequickstartTest: ['src/tests/**/EE/*burr-che.spec.js'],
      importTest: ['src/tests/**/EE/*burr*import*.spec.js'],
      mainTest: [
        'src/tests/**/EE/*burr*che.spec.js',
        'src/tests/**/EE/*burr*pipeline.spec.js',
        'src/tests/**/EE/*burr*quickstart.spec.js'
      ],
      quickstartTest: ['src/tests/**/EE/*burr-quickstart.spec.js'],
      pipelineTest: ['src/tests/**/EE/*burr*pipeline*.spec.js'],
      runTest: ['src/tests/**/EE/*burr*analytic*.spec.js'],
      setupTest: ['src/tests/**/EE/*setup*.spec.js'],
      terminalTest: ['src/tests/**/EE/*burr*terminal*.spec.js'],

      justChe: [
        'src/tests/**/EE/*burr-che.spec.js',
        'src/tests/**/EE/*burr-import-che.spec.js',
        'src/tests/**/EE/*burr-che-quickstart.spec.js'
      ],

      justJenkins: [
        'src/tests/**/EE/*burr-pipeline.spec.js',
        'src/tests/**/EE/*burr-import-pipeline.spec.js',
        'src/tests/**/EE/*burr-quickstart.spec.js'
      ],

      tempTest: ['src/tests/**/EE/*burr-import-pipeline.spec.js'],
      specs: ['src/specs/**/*.spec.js']   // new typescript based specs
    },

    jasmineNodeOpts: {
      defaultTimeoutInterval: 60000
    },
    capabilities: {
      'browserName': 'chrome',
      'chromeOptions': {
        'args': [
          // '--headless', '--disable-gpu',
          '--no-sandbox', 'disable-popup-blocking=true'
         ]
      }
    },

  // Setup the report before any tests start
  beforeLaunch: function() {
    return new Promise(resolve => reporter.beforeLaunch(resolve));
  },

  // Assign the test reporter to each running instance
  onPrepare: function() {
    jasmine.getEnv().addReporter(reporter);

    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
        displayStacktrace: true,
        displayDuration: true
      },
      summary: {
        displayDuration: true
      }
    }));

    beforeEach(() => {
      jasmine.addMatchers(ProtractorMatchers);
    });
  },

  // Close the report after all tests finish
  afterLaunch: function(exitCode) {
    return new Promise(resolve => reporter.afterLaunch(resolve(exitCode)));
  }
};

exports.config = conf;

