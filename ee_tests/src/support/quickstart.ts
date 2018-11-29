import { LauncherMission } from './launcher_mission';
import { LauncherRuntime } from './launcher_runtime';
import { browser, by, element, ExpectedConditions as until } from 'protractor';
import * as timeouts from '../support/timeouts';

export class Quickstart {
  id: string;
  name: string;
  mission: LauncherMission;
  runtime: LauncherRuntime;
  dependencyCount: { total: string, analyzed: string, unknown: string };
  junitTestCount: string;
  testFileName: string;
  sourceFileName: string;
  deployedPageTestCallback: () => void;

  constructor(quickstart: string) {
    this.id = quickstart;

    switch (quickstart) {
      case 'vertxHealth': {
        this.name = 'Vert.x Health Check Example';
        this.runtime = LauncherRuntime.runtime(LauncherRuntime.VERTX);
        this.mission = LauncherMission.mission(LauncherMission.HEALTH_CHECK);
        this.dependencyCount = this.getDependencyCountObj('4', '0', '4');
        this.junitTestCount = '2';
        this.testFileName = 'HttpApplicationTest.java';
        this.sourceFileName = 'HttpApplication.java';
        this.deployedPageTestCallback = dummy;
        break;
      }
      case 'vertxConfig': {
        this.name = 'Vert.x - HTTP & Config Map';
        this.runtime = LauncherRuntime.runtime(LauncherRuntime.VERTX);
        this.mission = LauncherMission.mission(LauncherMission.EXTERNALIZED_CONFIG);
        this.dependencyCount = this.getDependencyCountObj('9', '0', '9');
        this.junitTestCount = '2';
        this.testFileName = 'HttpApplicationTest.java';
        this.sourceFileName = 'HttpApplication.java';
        this.deployedPageTestCallback = dummy;
        break;
      }
      case 'SpringBootHttp': {
        this.name = 'Spring Boot - HTTP';
        this.runtime = LauncherRuntime.runtime(LauncherRuntime.SPRING_BOOT);
        this.mission = LauncherMission.mission(LauncherMission.REST_HTTP);
        this.dependencyCount = this.getDependencyCountObj('4', '0', '4');
        this.junitTestCount = '2';
        this.testFileName = 'LocalTest.java';
        this.sourceFileName = 'GreetingProperties.java';
        this.deployedPageTestCallback = httpBooster;
        break;
      }
      case 'SpringBootHealth': {
        this.name = 'Spring Boot Health Check Example';
        this.runtime = LauncherRuntime.runtime(LauncherRuntime.SPRING_BOOT);
        this.mission = LauncherMission.mission(LauncherMission.HEALTH_CHECK);
        this.dependencyCount = this.getDependencyCountObj('3', '0', '3');
        this.junitTestCount = '2';
        this.testFileName = 'LocalTest.java';
        this.sourceFileName = 'GreetingProperties.java';
        this.deployedPageTestCallback = dummy;
        break;
      }
      case 'SpringBootCrud': {
        this.name = 'Spring Boot - CRUD';
        this.runtime = LauncherRuntime.runtime(LauncherRuntime.SPRING_BOOT);
        this.mission = LauncherMission.mission(LauncherMission.CRUD);
        this.dependencyCount = this.getDependencyCountObj('4', '0', '4');
        this.junitTestCount = '2';
        this.testFileName = 'LocalTest.java';
        this.sourceFileName = 'GreetingProperties.java';
        this.deployedPageTestCallback = dummy;
        break;
      }
      case 'SwarmHttp': {
        this.name = 'WildFly Swarm - HTTP';
        this.runtime = LauncherRuntime.runtime(LauncherRuntime.WILDFLY_SWARM);
        this.mission = LauncherMission.mission(LauncherMission.REST_HTTP);
        this.dependencyCount = this.getDependencyCountObj('N/A', 'N/A', 'N/A');
        this.junitTestCount = '2';
        this.testFileName = 'GreetingServiceTest.java';
        this.sourceFileName = 'HttpApplication.java';
        this.deployedPageTestCallback = dummy;
        break;
      }
      case 'SwarmHealth': {
        this.name = 'WildFly Swarm - Health Checks';
        this.runtime = LauncherRuntime.runtime(LauncherRuntime.WILDFLY_SWARM);
        this.mission = LauncherMission.mission(LauncherMission.HEALTH_CHECK);
        this.dependencyCount = this.getDependencyCountObj('N/A', 'N/A', 'N/A');
        this.junitTestCount = '2';
        this.testFileName = 'GreetingServiceTest.java';
        this.sourceFileName = 'GreetingEndpoint.java';
        this.deployedPageTestCallback = dummy;
        break;
      }
      default: {
        this.id = 'vertxHttp';
        this.name = 'Vert.x HTTP Booster';
        this.runtime = LauncherRuntime.runtime(LauncherRuntime.VERTX);
        this.mission = LauncherMission.mission(LauncherMission.REST_HTTP);
        this.dependencyCount = this.getDependencyCountObj('2', '0', '2');
        this.junitTestCount = '2';
        this.testFileName = 'HttpApplicationTest.java';
        this.sourceFileName = 'GreetingEndpoint.java';
        this.deployedPageTestCallback = httpBooster;
        break;
      }
    }
  }

  private getDependencyCountObj = (total: string, analyzed: string, unknown: string) => {
    return {
      'total': total,
      'analyzed': analyzed,
      'unknown': unknown
    };
  }
}

async function httpBooster() {
  browser.wait(until.presenceOf(
  element(by.id('_http_booster'))), timeouts.DEFAULT_WAIT, '\_http_booster\' is present');
  let text = await element(by.id('_http_booster')).getText();
  expect(text).toContain('HTTP Booster', `page contains text`);
}

async function dummy() {
  // no specific test for booster page
}
