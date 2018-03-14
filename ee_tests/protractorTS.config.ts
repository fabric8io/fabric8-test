import { Config, browser } from 'protractor';
import { SpecReporter } from 'jasmine-spec-reporter';
import * as failFast from 'protractor-fail-fast';

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
  
    framework: 'jasmine2',

    jasmineNodeOpts: {
      showColors: true,
      silent: true,
      isVerbose: true,
      defaultTimeoutInterval: 60 * 60 * 1000 // 60 mins for spec to run
    },

    plugins: [
      failFast.init()
    ],

    directConnect: process.env.DIRECT_CONNECTION === 'true',
    restartBrowserBetweenTests: true,
    useAllAngular2AppRoots: true,
    getPageTimeout: 1 * 60 *1000, // must load within 1 min
    seleniumAddress: 'http://localhost:4444/wd/hub',

    // Ref: https://github.com/angular/protractor/tree/master/exampleTypescript/asyncAwait
    SELENIUM_PROMISE_MANAGER: false,

    specs: [
      'src/**/*.js'
    ],

    suites: {

      smoketest: ['src/quickstart_pipeline.spec.js'],
      chetest: ['src/quickstart_che.spec.js'],
      analyticstest: ['src/quickstart_analytic.spec.js'],

      launchertest: ['src/launcher.spec.js'],
      boosterterminaltest: ['src/booster_ee_int_tests/quickstart_cheterminal.spec.js'],
      boosterjunittest: ['src/booster_ee_int_tests/quickstart_chejunit.spec.js'],
      boostereditortest: ['src/booster_ee_int_tests/quickstart_che_editor.spec.js'],

      logintest: ['src/quickstart_login.spec.js'],
      boosterTest: ['src/booster_pipeline.spec.js'],
      importTest: ['src/workshop-import-to-space.spec.js'],
      quickstartTest: ['src/quickstart_analytic.spec.js'],
      runTest: ['src/quickstart_pipeline.spec.js'],
      deployTest: ['src/quickstart_deployments.spec.js'],
      chequickstartTest: ['src/quickstart_che.spec.js'],
      allTest: ['src/quickstart_analytic.spec.js', 'src/quickstart_pipeline.spec.js', 'src/quickstart_che.spec.js'],
      specs: ['src/*.spec.js'],
      local: ['src/local/*.js']
    },

    // see: https://github.com/angular/protractor/blob/master/docs/timeouts.md
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

