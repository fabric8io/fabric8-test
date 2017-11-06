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

    // Ref: https://github.com/angular/protractor/tree/master/exampleTypescript/asyncAwait
    SELENIUM_PROMISE_MANAGER: false,

    specs: [
      'src/specs/*.js',
      'src/specs/**/*.js',
    ],

    suites: {
      specs: ['src/specs/**/*.spec.js'],   // new typescript based specs
      functional: ['src/functional/**/*.spec.js']   // new typescript based specs
    },

    // see: https://github.com/angular/protractor/blob/master/docs/timeouts.md
    jasmineNodeOpts: {
      defaultTimeoutInterval: 10 * 60 * 1000 // 10 mins
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

