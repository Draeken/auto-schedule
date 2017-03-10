import { Permissions } from './permissions.class';

export interface AgentInfo {
  name: string;
  url: string;
  agentPermission: Permissions;
  userPermission: Permissions;
}
