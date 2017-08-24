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
define("LONGEST_WAIT", 300000);      /* 5 minutes */

/* Quickstart names */
define("VERTX_BASIC", "Vert.x - Basic");
define("VERTX_CONFIGMAP", "Vert.x - ConfigMap");
define("SPRINGBOOT_BASIC", "Spring Boot - Basic");
define("VERTX_HEALTH_CHECK", "Vert.x Health Check Example");
define("SPRINGBOOT_HEALTH_CHECK", "Spring Boot - Health Check");
