export class LauncherMission {
  id: string;
  name: string;
  dependencyCount: { total: string, analyzed: string, unknown: string };

  static mission(id: string) {
    return new LauncherMission(id);
  }

  constructor(mission: string) {
    this.id = mission;

    switch (mission) {
      case 'crud': {
        this.name = 'Crud';
        this.dependencyCount = this.getDependencyCountObj('4', '4', '0');
        break;
      }
      case 'circuitBreaker': {
        this.name = 'Circuit Breaker';
        this.dependencyCount = this.getDependencyCountObj('9', '9', '0');
        break;
      }
      case 'externalConfig': {
        this.name = 'Externalized Configuration';
        this.dependencyCount = this.getDependencyCountObj('9', '9', '0');
        break;
      }
      case 'healthCheck': {
        // TODO: Update name when present in UI
        this.name = 'N/A';
        this.dependencyCount = this.getDependencyCountObj('9', '9', '0');
        break;
      }
      case 'restApi': {
        this.name = 'REST API Level 0';
        this.dependencyCount = this.getDependencyCountObj('3', '3', '0');
        break;
      }
      case 'basic':
      default: {
        this.name = 'Basic Application';
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
