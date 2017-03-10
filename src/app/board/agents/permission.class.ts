interface ColPermission {
  collectionName: string;
  permission: number;
}

interface DocPermission extends ColPermission {
  documentName: string;
}

export enum Permission {
  View = 1,
  Provide = 2,
  Update = 4
}

export class Permissions {
  private _collectionsPerm: ColPermission[] = [];
  private _documentsPerm: DocPermission[] = [];

  constructor(permissions: Object) {
    this.parseRawPerm(permissions);
  }

  static getPermissions(perm: number): Set<Permission> {
    const allPerm = [Permission.Update, Permission.Provide, Permission.View];
    const myPerm = [];
    allPerm.forEach(p => {
      if (p > perm) { return; }
      if (myPerm.reduce((a, b) => a + b) + p > perm) { return; }
      myPerm.push(p);
    });
    return new Set(myPerm);
  }

  private static isValidPermission(perm: number) {
    return Number.isInteger(perm) && perm > 0 && perm < 8;
  }

  private parseRawPerm(perm: Object): void {
    Object.keys(perm).forEach(colName => {
      const val = perm[colName];
      if (val === null) { return; }
      if (Permissions.isValidPermission(val)) {
        return this._collectionsPerm.push({
          collectionName: colName,
          permission: val
        });
      }
      if (typeof val === 'object') {
        Object.keys(val).forEach(docName => {
          const val = perm[docName];
          if (Permissions.isValidPermission(val)) {
            return this._documentsPerm.push({
              documentName: docName,
              collectionName: colName,
              permission: val,
            });
          }
        })
      }
    })
  }
}
