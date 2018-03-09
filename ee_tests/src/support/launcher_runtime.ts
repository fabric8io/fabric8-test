export class LauncherRuntime {
  id: string;
  name: string;
  dependencyCount: { total: string, analyzed: string, unknown: string };

  static runtime(id: string) {
    return new LauncherRuntime(id);
  }

  constructor(runtime: string) {
    this.id = runtime;

    switch (runtime) {
      case 'springboot': {
        this.name = 'Spring Boot';
        this.dependencyCount = this.getDependencyCountObj('4', '4', '0');
        break;
      }
      case 'nodejs': {
        this.name = 'Node.js';
        this.dependencyCount = this.getDependencyCountObj('9', '9', '0');
        break;
      }
      case 'swarm': {
        this.name = 'Wildfly Swarm';
        this.dependencyCount = this.getDependencyCountObj('3', '3', '0');
        break;
      }
      case 'vertx':
      default: {
        this.name = 'Eclipse Vert.x';
        this.dependencyCount = this.getDependencyCountObj('4', '4', '0');
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
