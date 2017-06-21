/**
 * 
 * See: http://martinfowler.com/bliki/PageObject.html,
 * https://www.thoughtworks.com/insights/blog/using-page-objects-overcome-protractors-shortcomings
 * @author naina-verma@redhat.com
 * TODO - Complete the page object model pending completion of UI 
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

define("WAIT", 300000);
define("LONG_WAIT", 60000);
