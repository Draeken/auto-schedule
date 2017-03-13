interface ColPermission {
  collectionName: string;
  permission: number;
}

interface DocPermission extends ColPermission {
  documentsDesc: Object;
}

export enum Permission {
  Context = 1,
  Provide = 2,
  Watch = 4
}

export class Permissions {
  private _collectionsPerm: ColPermission[] = [];
  private _documentsPerm: DocPermission[] = [];

  constructor(permissions: Object) {
    this.parseRawPerm(permissions);
  }

  static getPermissions(perm: number): Set<Permission> {
    const allPerm = [Permission.Watch, Permission.Provide, Permission.Context];
    const myPerm = [];
    allPerm.forEach(p => {
      if (p > perm) { return; }
      if (myPerm.reduce((a, b) => a + b) + p > perm) { return; }
      myPerm.push(p);
    });
    return new Set(myPerm);
  }

  get collectionsPerm(): ColPermission[] {
    return this._collectionsPerm;
  }

  get documentsPerm(): DocPermission[] {
    return this._documentsPerm;
  }

  getCollectionsWith(perm: Permission): string[] {
    return this.filterToPerm(this._collectionsPerm, perm)
      .map(cp => cp.collectionName);
  }

  getDocumentsWith(perm: Permission): Map<string, Object[]> {
    let map = new Map<string, Object[]>();
    this.filterToPerm(this._documentsPerm, perm).forEach((d: DocPermission) => {
      if (!map.has(d.collectionName)) { map.set(d.collectionName, []); }
      map.get(d.collectionName).push(d.documentsDesc);
    });
    return map;
  }

  private filterToPerm(col: ColPermission[], perm: Permission) {
    return col
      .filter(cp => Permissions.getPermissions(cp.permission).has(perm));
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
      if (Array.isArray(val)) {
        val.forEach(doc => {
          const perm = doc.permission;
          if (!Permissions.isValidPermission(perm)) { return; }
          this._documentsPerm.push({
            documentsDesc: doc.documentsDesc,
            collectionName: colName,
            permission: perm,
          });
        })
      }
    })
  }
}
