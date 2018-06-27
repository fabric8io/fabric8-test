export class LauncherRuntime {

  static VERTX = 'vertx';
  static SPRING_BOOT = 'springboot';
  static NODE_JS = 'nodejs';
  static WILDFLY_SWARM = 'swarm';

  id: string;
  name: string;
  quickstartStartedTerminal: string;

  constructor(runtime: string) {
    this.id = runtime;

    switch (runtime) {
      case LauncherRuntime.SPRING_BOOT: {
        this.name = 'Spring Boot';
        this.quickstartStartedTerminal = 'Setting the server\'s publish address to be';
        break;
      }
      case LauncherRuntime.NODE_JS: {
        this.name = 'Node.js';
        // TODO: implement
        this.quickstartStartedTerminal = '// TODO: implement';
        break;
      }
      case LauncherRuntime.WILDFLY_SWARM: {
        this.name = 'Wildfly Swarm';
        // TODO: implement
        this.quickstartStartedTerminal = '// TODO: implement';
        break;
      }
      case LauncherRuntime.VERTX:
      default: {
        this.name = 'Eclipse Vert.x';
        this.quickstartStartedTerminal = 'Succeeded in deploying verticle';
        break;
      }
    }
  }

  static runtime(id: string) {
    return new LauncherRuntime(id);
  }
}
