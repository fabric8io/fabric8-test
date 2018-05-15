import { Config, browser } from 'protractor';
import { SpecReporter } from 'jasmine-spec-reporter';
import * as failFast from 'protractor-fail-fast';
import * as VideoReporter from 'protractor-video-reporter';
import { ZabbixReporter } from './src/support/zabbix_reporter';

// NOTE: weird import as documented in
// https://github.com/Xotabu4/jasmine-protractor-matchers
import ProtractorMatchers = require('jasmine-protractor-matchers');
import HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

let screenshotReporter = new HtmlScreenshotReporter({
  dest: 'target/screenshots',
  filename: 'f8-test-report.html',
  reportOnlyFailedSpecs: false,
  captureOnlyFailedSpecs: false,
  inlineImages: true
});

let consoleReporter = new SpecReporter({
  spec: {
    displayStacktrace: true,
    displayDuration: true
  },
  summary: {
    displayDuration: true
  }
});

// To use video capturing reporter you need to have ffmpeg installed
let useVideoReporter = false;

let videoReporter = new VideoReporter({
  baseDirectory: 'target/videos'
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
    restartBrowserBetweenTests: false,
    useAllAngular2AppRoots: true,
    getPageTimeout: 1 * 60 * 1000, // must load within 1 min
    seleniumAddress: 'http://localhost:4444/wd/hub',

    // Ref: https://github.com/angular/protractor/tree/master/exampleTypescript/asyncAwait
    SELENIUM_PROMISE_MANAGER: false,

    specs: [
      'src/**/*.js'
    ],

    suites: {

      smoketest: ['src/smoke.spec.js'],
      all: ['src/*.spec.js'],
      local: ['src/local/*.js'],

      launchertest: ['src/launcher.spec.js'],
      logintest: ['src/quickstart_login.spec.js'],

      // TODO https://github.com/fabric8io/fabric8-test/issues/578
      boosterTest: ['src/booster_pipeline.spec.js'],
      importTest: ['src/workshop-import-to-space.spec.js'],

      boostersuite: [
        'src/booster_ee_int_tests/booster_setup.spec.js',
        'src/booster_ee_int_tests/booster_oso_project.spec.js',
        'src/booster_ee_int_tests/booster_pipeline.spec.js',
        'src/booster_ee_int_tests/booster_trigger_cd.spec.js',
        'src/booster_ee_int_tests/booster_analytics_report.spec.js',
        'src/booster_ee_int_tests/booster_build_maven.spec.js',
        'src/booster_ee_int_tests/booster_verify_url.spec.js',
        'src/booster_ee_int_tests/booster_run_project.spec.js',
        'src/booster_ee_int_tests/booster_debug_project.spec.js',
        'src/booster_ee_int_tests/booster_junit_tests.spec.js',
        'src/booster_ee_int_tests/booster_che_preview.spec.js',
        'src/booster_ee_int_tests/booster_modify_src.spec.js',
        'src/booster_ee_int_tests/booster_cleanup.spec.js'
      ],

      boosterterminaltest: ['src/booster_ee_int_tests/quickstart_cheterminal.spec.js'],
      boosterjunittest: ['src/booster_ee_int_tests/quickstart_chejunit.spec.js'],
      boostereditortest: ['src/booster_ee_int_tests/quickstart_che_editor.spec.js'],


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
    return new Promise(resolve => screenshotReporter.beforeLaunch(resolve));
  },

  // Assign the test reporter to each running instance
  onPrepare: function() {
    jasmine.getEnv().addReporter(screenshotReporter);
    jasmine.getEnv().addReporter(consoleReporter);
    if (useVideoReporter) {
      jasmine.getEnv().addReporter(videoReporter);
    }

    if (browser.params.zabbix.enabled === 'true') {
      jasmine.getEnv().addReporter(new ZabbixReporter());
    }

    beforeEach(() => {
      jasmine.addMatchers(ProtractorMatchers);
    });
  },

  // Close the report after all tests finish
  afterLaunch: function(exitCode) {
    return new Promise(resolve => screenshotReporter.afterLaunch(resolve(exitCode)));
  }
};

exports.config = conf;

