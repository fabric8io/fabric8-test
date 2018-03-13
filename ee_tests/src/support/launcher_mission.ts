export class LauncherMission {

  static HEALTH_CHECK = 'healthCheck';
  static CRUD = 'crud';
  static CIRCUIT_BREAKER = 'circuitBreaker';
  static EXTERNALIZED_CONFIG = 'externalConfig';
  static REST_HTTP = 'restHttp';

  id: string;
  name: string;
  dependencyCount: { total: string, analyzed: string, unknown: string };

  static mission(id: string) {
    return new LauncherMission(id);
  }

  constructor(mission: string) {
    this.id = mission;

    switch (mission) {
      case LauncherMission.CRUD: {
        this.name = 'CRUD';
        this.dependencyCount = this.getDependencyCountObj('4', '4', '0');
        break;
      }
      case LauncherMission.CIRCUIT_BREAKER: {
        this.name = 'Circuit Breaker';
        this.dependencyCount = this.getDependencyCountObj('9', '9', '0');
        break;
      }
      case LauncherMission.EXTERNALIZED_CONFIG: {
        this.name = 'Externalized Configuration';
        this.dependencyCount = this.getDependencyCountObj('9', '9', '0');
        break;
      }
      case LauncherMission.REST_HTTP: {
        this.name = 'REST API Level 0';
        this.dependencyCount = this.getDependencyCountObj('3', '3', '0');
        break;
      }
      case LauncherMission.HEALTH_CHECK:
      default: {
        this.name = 'Health Check';
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
