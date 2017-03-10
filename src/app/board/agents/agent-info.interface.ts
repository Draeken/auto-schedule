import { Permissions } from './permission.class';

export interface AgentInfo {
  name: string;
  url: string;
  agentPermission: Permissions;
  userPermission: Permissions;
}

type Comparator = (a: any, b: any) => boolean;

function areArrayEquals(x: any[], y: any[], comparator: Comparator = (a, b) => a === b): boolean {
  if (!x && !y) {
    return true;
  } else if (!x || !y) {
    return false;
  }
  if (x.length !== y.length) {
    return false;
  }
  for (let i = 0; i < x.length; ++i) {
    if (!comparator(x[i], y[i])) {
      return false;
    }
  }
  return true;
}

export function distinctAgents(x: AgentInfo[], y: AgentInfo[]): boolean {
  return areArrayEquals(x, y, (a: AgentInfo, b: AgentInfo) => {
    return a.name === b.name && a.url === b.url &&
      areArrayEquals(a.agentPermission, b.agentPermission) &&
      areArrayEquals(a.userPermission, b.userPermission);
  });
}
