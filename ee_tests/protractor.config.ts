import { browser, Config } from 'protractor';
import { SpecReporter } from 'jasmine-spec-reporter';
import * as failFast from 'protractor-fail-fast';
import * as VideoReporter from 'protractor-video-reporter';
import { FailuresReporter } from './src/support/failures_reporter';
import { ZabbixReporter } from './src/support/zabbix_reporter';
import * as support from './src/support';

// NOTE: weird import as documented in
// https://github.com/Xotabu4/jasmine-protractor-matchers
import ProtractorMatchers = require('jasmine-protractor-matchers');

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
    all: ['src/*.spec.js'],
    che: ['src/che_integration.spec.js'],
    local: ['src/local/*.js'],
    logintest: ['src/login.spec.js'],
    planner : ['src/planner.spec.js'],
    smoketest: ['src/smoke.spec.js']
  },

  // see: https://github.com/angular/protractor/blob/master/docs/timeouts.md
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      'args': [
        // '--headless', '--disable-gpu',
        '--no-sandbox', 'disable-popup-blocking=true'
      ]
    },
    'loggingPrefs': {
      browser: 'ALL'
    }
  },

  // Assign the test reporter to each running instance
  onPrepare: function () {
    jasmine.getEnv().addReporter(consoleReporter);
    if (useVideoReporter) {
      jasmine.getEnv().addReporter(videoReporter);
    }

    jasmine.getEnv().addReporter(new FailuresReporter());

    if (browser.params.zabbix.enabled === 'true') {
      jasmine.getEnv().addReporter(new ZabbixReporter());
    }

    beforeEach(() => {
      jasmine.addMatchers(ProtractorMatchers);
    });

    let genericWait = browser.wait;

    browser.wait = function (predicate: any, timeout = support.DEFAULT_WAIT, message: string) {
      return genericWait.apply(browser, [predicate, timeout, message]);
    };
  },
};

exports.config = conf;
