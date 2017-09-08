/**
 * AlMighty page object example module for work item list page
 * See: http://martinfowler.com/bliki/PageObject.html,
 * https://www.thoughtworks.com/insights/blog/using-page-objects-overcome-protractors-shortcomings
 * @author ldimaggi@redhat.com
 * TODO - Complete the page object model pending completion of UI at: http://demo.almighty.io/
 */

'use strict';

/*
 * Constants Definition
 */

function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

/* Timers */
define("WAIT", 3000);   /* 3 seconds */
define("LONG_WAIT", 30000);     /* 30 sec */
define("LONGER_WAIT", 180000);     /* 3 min */
define("LONGEST_WAIT", 600000);      /* 10 minutes */
define("PIPELINE_COMPLETE_WAIT", 6000000);      /* 100 minutes */
define("RESET_TENANT_WAIT", 300000);     /* 5 min */

/* Pre-test cleanup types */
define("CLEAN_CHE", "CLEAN_CHE");
define("CLEAN_STAGE_RUN", "CLEAN_STAGE_RUN");
define("CLEAN_ALL", "CLEAN_ALL");
