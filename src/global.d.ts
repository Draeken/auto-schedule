// Type definitions for LokiJS 1.4.3
// Project: https://github.com/techfort/LokiJS
// Definitions by: PBM42

declare class loki {

  constructor(filename: string, options: Object);

  getCollection(n: string): loki.Collection;

  addCollection(n: string, options?: Object): loki.Collection;

  anonym(docs?: Object[], options?: Object): loki.Collection;
}

declare module loki {

  interface Doc {
    $loki: number
  }

  class Collection {

      constructor(n: string, o: Object);

      find(query: Object): loki.Doc[];

      insert(doc: Object | Object[]): loki.Doc | loki.Doc[];

      remove(doc: Object): loki.Doc;
  }
}
