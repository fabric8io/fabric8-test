export class Quickstart {
  id: string;
  name: string;
  dependencyCount: {total: string, analyzed: string, unknown: string};

  constructor(quickstart: string) {
    this.id = quickstart;

    switch (quickstart) {
      case 'vertxHealth': {
        this.name = 'Vert.x Health Check Example';
        this.dependencyCount = this.getDependencyCountObj('4', '4', '0');
        break;
      }
      case 'vertxConfig': {
        this.name = 'Vert.x - HTTP & Config Map';
        this.dependencyCount = this.getDependencyCountObj('9', '9', '0');
        break;
      }
      case 'SpringBootHttp': {
        this.name = 'Spring Boot - HTTP';
        this.dependencyCount = this.getDependencyCountObj('4', '4', '0');
        break;
      }
      case 'SpringBootHealth': {
        this.name = 'Spring Boot Health Check Example';
        this.dependencyCount = this.getDependencyCountObj('3', '3', '0');
        break;
      }
      case 'SpringBootCrud': {
        this.name = 'Spring Boot - CRUD';
        this.dependencyCount = this.getDependencyCountObj('4', '4', '0');
        break;
      }
      case 'SwarmHttp': {
        this.name = 'WildFly Swarm - HTTP';
        this.dependencyCount = this.getDependencyCountObj('N/A', 'N/A', 'N/A');
        break;
      }
      case 'SwarmHealth': {
        this.name = 'WildFly Swarm - Health Checks';
        this.dependencyCount = this.getDependencyCountObj('N/A', 'N/A', 'N/A');
        break;
      }
      default: {
        this.id = 'vertxHttp';
        this.name = 'Vert.x HTTP Booster';
        this.dependencyCount = this.getDependencyCountObj('2', '0', '2');
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
