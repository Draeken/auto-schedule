// Type definitions for LokiJS 1.4.3
// Project: https://github.com/techfort/LokiJS
// Definitions by: PBM42

declare class loki {

  constructor(filename: string, options: Object);

  getCollection(n: string): loki.Collection;
}

declare module loki {
  class Collection {

      constructor(n: string, o: Object);

      find(query: Object): Object[];

      insert(doc: Object | Object[]): Object | Object[];

      remove(doc: Object): Object;
  }
}
