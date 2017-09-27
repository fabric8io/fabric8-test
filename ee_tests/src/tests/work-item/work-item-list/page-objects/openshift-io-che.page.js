/**
 * AlMighty page object example module for openshift.io start page
 * See: http://martinfowler.com/bliki/PageObject.html,
 * https://www.thoughtworks.com/insights/blog/using-page-objects-overcome-protractors-shortcomings
 * @author ldimaggi@redhat.com
 */

'use strict';

/*
 * Fabric8 Page Definition
 */

var testSupport = require('../testSupport'),
    constants = require("../constants");

var until = protractor.ExpectedConditions;

class OpenShiftIoChePage {

  constructor() {
  };

  /* Element - project root - by name */
  projectRootByName (projectRootString) {
    // example:  .//*[@id='gwt-debug-projectTree']/div[contains(@name,'testaug101502380205634')]
    var xpathString = ".//*[@id='gwt-debug-projectTree']/div[contains(@name,'" + projectRootString + "')]";
    browser.wait(until.presenceOf(element(by.xpath(xpathString)), constants.LONGEST_WAIT, 'Failed to find element projectName'));
    return element(by.xpath(xpathString));
  }

  /*
 
  Che page UI diagram (September 2017)

  -----------------------------------------------------------------------------------------------------------------------------
  |                                          *Main Menu Panel*                                                                |
  | toggle-icon   Workspace  Project  Edit  Assistant  Run  Git  Profile  Help    Run    Debug
  -----------------------------------------------------------------------------------------------------------------------------
  | *Debug Nav Panel*      |
  |                        |
  |  Projects Explorer     |
  |  project               |
  |  project               |
  |                        |
  |                        |
  |                        |
  |                        |
  |                        |
  |                        |
  |                        |
  -----------------------------------------------------------------------------------------------------------------------------
  | *Debug Consoles Panel* | dev-machine  terminal  run
  |                        |
  |                        |
  |                        |
  |                        |
  |                        |
  |                        |
  |                        |
  -----------------------------------------------------------------------------------------------------------------------------
  | *Debug Bottom Panel*
  |
  -----------------------------------------------------------------------------------------------------------------------------


  */

/* Main Menu Panel */
get mainMenuPanel () {
  return element(by.css("#gwt-debug-mainMenuPanel"));
}

/* Main Menu Panel toggle-icon */
get mainMenuToggleIcon () {
  return element(by.xpath(".//*[contains(@class,'GJ5I-CRBBN')]"));
}
clickMainMenuToggleIcon () {
  browser.wait(until.elementToBeClickable(this.mainMenuToggleIcon), constants.LONG_WAIT, 'Failed to find element mainMenuToggleIcon');
  this.mainMenuToggleIcon.click().then(function(){
    console.log("OpenShiftIoChePage - clicked element: mainMenuToggleIcon");
  });
  return;
}

/* Main Menu Panel option by name 
  //*[contains(@class,'GJ5I-CRBGU')][contains(text(),'Workspace’)]
  //*[contains(@class,'GJ5I-CRBGU')][contains(text(),'Project’)]
  //*[contains(@class,'GJ5I-CRBGU')][contains(text(),'Edit’)]
  //*[contains(@class,'GJ5I-CRBGU')][contains(text(),'Assistant’)]
  //*[contains(@class,'GJ5I-CRBGU')][contains(text(),'Run)]
  //*[contains(@class,'GJ5I-CRBGU')][contains(text(),'Git’)]
  //*[contains(@class,'GJ5I-CRBGU')][contains(text(),'Profile’)]
  //*[contains(@class,'GJ5I-CRBGU')][contains(text(),'Help’)]
*/
mainMenuOptionByName (nameString) {
  var xpathString = ".//*[contains(@class,'GJ5I-CRBGU')][contains(text(),'" + nameString + "’)]";
  return element(by.xpath(xpathString));
}
clickMainMenuOptionByName (nameString) {
  browser.wait(until.elementToBeClickable(this.mainMenuOptionByName(nameString)), constants.LONG_WAIT, 'Failed to find element mainMenuOptionByName');
  this.mainMenuOptionByName(nameString).click().then(function(){
    console.log("OpenShiftIoChePage - clicked element: mainMenuOptionByName");
  });
  return;
}

/* Main Menu Panel run button */
get mainMenuRunButton () {
  return element(by.css("#gwt-debug-command_toolbar-button_Run"));
//  return element(by.xpath(".//*[contains(@class,'GJ5I-CRBJ5.GJ5I-CRBK5')]"));
}
clickmainMenuRunButton () {
  browser.wait(until.elementToBeClickable(this.mainMenuRunButton), constants.LONG_WAIT, 'Failed to find element mainMenuRunButton');
  this.mainMenuRunButton.click().then(function(){
    console.log("OpenShiftIoChePage - clicked element: mainMenuRunButton");
  });
  return;
}

/*
<div class="gwt-PopupPanel GJ5I-CRBBAB" style="left: 556px; top: 29px; position: absolute; clip: rect(auto auto auto auto); overflow: visible;"><div class="popupContent"><div>
<div class="GJ5I-CRBP5 GJ5I-CRBAAB"><div style="float: left;">run</div></div></div></div></div>
*/

/* Main Menu Panel run button run selection*/
get mainMenuRunButtonRunSelection () {
//  return element(by.xpath(".//*[contains(@class,'gwt-PopupPanel GJ5I-CRBBAB')]"));
  return element(by.xpath(".//*[contains(@class,'gwt-PopupPanel GLJLMPIDEAB')]"));
}
clickmainMenuRunButtonRunSelection () {
  browser.wait(until.elementToBeClickable(this.mainMenuRunButtonRunSelection), constants.LONG_WAIT, 'Failed to find element mainMenuRunButtonRunSelection');
  this.mainMenuRunButtonRunSelection.click().then(function(){
    console.log("OpenShiftIoChePage - clicked element: mainMenuRunButtonRunSelection");
  });
  return;
}

/* Main Menu Panel debug button */
get mainMenuDebugButton () {
  return element(by.css("#gwt-debug-command_toolbar-button_Debug"));
}
clickmainMenuDebugButton () {
  browser.wait(until.elementToBeClickable(this.mainMenuDebugButton), constants.LONG_WAIT, 'Failed to find element mainMenuDebugButton');
  this.mainMenuDebugButton.click().then(function(){
    console.log("OpenShiftIoChePage - clicked element: mainMenuDebugButton");
  });
  return;
}


/* Debug Consoles Panel */
get debugConsolesPanel () {
  return element(by.css("#gwt-debug-consolesPanel"));
}



/* Debug Nav Panel */
get debugNavPanel () {
  return element(by.css("#gwt-debug-navPanel"));
}

/*

.//*[contains(@class,'GJ5I-CRBAK')][contains(text(),'Projects Explorer')]
.//*[contains(@class,'GJ5I-CRBFBB')]/*[contains(text(),'.vertx')]

*/


/* Bottom Panel */
get bottomPanel () {
  return element(by.css("#gwt-debug-BottomPanel"));
}

/* Bottom Panel run tab */
get bottomPanelRunTab () {
//  return element(by.xpath(".//*[contains(@class,'GJ5I-CRBCGC')][contains(text(),'run')]"));
  return element(by.xpath(".//*[contains(@class,'GLJLMPIDCHC')][contains(text(),'run')]"));
}
clickBottomPanelRunTab () {
  browser.wait(until.elementToBeClickable(this.bottomPanelRunTab), constants.LONGER_WAIT, 'Failed to find element bottomPanelRunTab');
  this.bottomPanelRunTab.click().then(function(){
    console.log("OpenShiftIoChePage - clicked element: bottomPanelRunTab");
  });
  return;
}

/* Bottom Panel title */
get bottomPanelOutputTitles () {
  return element.all(by.xpath(".//*[contains(@class,'GJ5I-CRBHRB GJ5I-CRBCRB')]"));
}
/* Bottom Panel label */
get bottomPanelOutputLabel () {
  return element.all(by.xpath(".//*[contains(@class,'gwt-Label GJ5I-CRBHRB GJ5I-CRBCRB')]"));
}
/* Bottom Panel command */
get bottomPanelOutputCommand () {
//  return element.all(by.xpath(".//*[contains(@class,'gwt-Anchor GJ5I-CRBIRB GJ5I-CRBMRB GJ5I-CRBCRB')]"));
  return element.all(by.xpath(".//*[contains(text(),'command:')]/following-sibling::div[contains(text(),'scl enable’)]"));
}
/* Bottom Panel preview */
get bottomPanelOutputPreview () {
    return element.all(by.xpath(".//*[contains(text(),'preview:')]/following-sibling::a[contains(text(),'http://')]"));
  }
/* Bottom Panel command console lines of text */
get bottomPanelCommandConsoleLines () {
  return element.all(by.id("gwt-debug-commandConsoleScrollPanel")).last();
}


/* Bottom Panel terminal tab */
get bottomPanelTerminalTab () {
  return element(by.xpath(".//*[contains(@class, 'GLJLMPIDCHC')][contains(text(),'Terminal’)]')]"));
  }
  clickBottomPanelTerminalTab () {
    browser.wait(until.elementToBeClickable(this.bottomPanelTerminalTab), constants.LONGER_WAIT, 'Failed to find element bottomPanelTerminalTab');
    this.bottomPanelRunTab.click().then(function(){
      console.log("OpenShiftIoChePage - clicked element: bottomPanelTerminalTab");
    });
    return;
  }

// TODO
//
//    .//*[contains(@class, 'GLJLMPIDCHC')][contains(text(),'Terminal’)]
//    .//*[@id='gat-debug-terminal']
//    .//*[contains(@class,'xterm-rows')]


}

module.exports = OpenShiftIoChePage;

