export class LauncherMission {

  static HEALTH_CHECK = 'healthCheck';
  static CRUD = 'crud';
  static CIRCUIT_BREAKER = 'circuitBreaker';
  static EXTERNALIZED_CONFIG = 'externalConfig';
  static REST_HTTP = 'restHttp';

  id: string;
  name: string;

  static mission(id: string) {
    return new LauncherMission(id);
  }

  constructor(mission: string) {
    this.id = mission;

    switch (mission) {
      case LauncherMission.CRUD: {
        this.name = 'CRUD';
        break;
      }
      case LauncherMission.CIRCUIT_BREAKER: {
        this.name = 'Circuit Breaker';
        break;
      }
      case LauncherMission.EXTERNALIZED_CONFIG: {
        this.name = 'Externalized Configuration';
        break;
      }
      case LauncherMission.REST_HTTP: {
        this.name = 'REST API Level 0';
        break;
      }
      case LauncherMission.HEALTH_CHECK:
      default: {
        this.name = 'Health Check';
        break;
      }
    }
  }
}
