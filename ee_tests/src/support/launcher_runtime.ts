export class LauncherRuntime {

  static VERTX = 'vertx';
  static SPRING_BOOT = 'springboot';
  static NODE_JS = 'nodejs';
  static WILDFLY_SWARM = 'swarm';

  id: string;
  name: string;

  static runtime(id: string) {
    return new LauncherRuntime(id);
  }

  constructor(runtime: string) {
    this.id = runtime;

    switch (runtime) {
      case LauncherRuntime.SPRING_BOOT: {
        this.name = 'Spring Boot';
        break;
      }
      case LauncherRuntime.NODE_JS: {
        this.name = 'Node.js';
        break;
      }
      case LauncherRuntime.WILDFLY_SWARM: {
        this.name = 'Wildfly Swarm';
        break;
      }
      case LauncherRuntime.VERTX:
      default: {
        this.name = 'Eclipse Vert.x';
        break;
      }
    }
  }
}
