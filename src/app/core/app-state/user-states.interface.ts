export enum LoginStatus {
  notLogged,
  partialLogged,
  fullyLogged
}
export interface UserStates {
  loggedStatus: LoginStatus
}
