
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AgentQuery } from '../board/gears/agent-query.interface';
import { Task,
         TaskHelper } from '../board/gears/task.interface';
import { timelineState } from './timeline-state/state-dispatcher.provider';
import { TimelineState } from '../core/timeline-state/timeline-state.interface';

@Injectable()
export class DataIOService {
  private loki: loki;

  constructor(@Inject(timelineState) private tlState: Observable<TimelineState>) {
    this.tlState
      .pluck('timeline')
      .map(TaskHelper.extractCurrent)
      .distinctUntilChanged(TaskHelper.distinct)
      .subscribe(this.saveCurrentTasks);

    this.loki = new loki('resources.db', {
      verbose: true,
      autosave: false,
      autoload: true,
      serializationMethod: 'pretty',
      throttledSaves: false,
    });
  }

  getCurrentTasks(): Observable<AgentQuery[]> {
    return Observable.of([]);
  }

  findDocs(colName: string, docDesc: Object, quantity: number): loki.Doc[] {
    const col = this.loki.getCollection(colName);
    if (!col) { console.error(`Collection ${colName} not found.`); return []; }
    const results = col.find(docDesc);
    if (results.length < quantity) {
      console.warn(`Not enough docs found (${results.length} returned for ${quantity}`, docDesc);
      return results;
    }
    return results.slice(0, quantity);
  }

  getCollection(name: string, create = false): loki.Collection {
    let col = this.loki.getCollection(name);
    col = (!col && create) ? this.loki.addCollection(name) : col;
    return col;
  }

  addCollection(name: string, options?: Object): loki.Collection {
    return this.loki.addCollection(name, options);
  }

  getAnonCollection(docs?: Object[], options?: Object) {
    return this.loki.anonym(docs, options);
  }

  resetLoki(): void {
    this.loki.loadDatabase();
  }

  saveLoki(): void {
    this.loki.saveDatabase();
  }

  serializeLoki(): string {
    return this.loki.serialize();
  }

  deserializeLoki(serialized: string): void {
    this.loki.loadJSON(serialized);
  }

  private saveCurrentTasks(tasks: Task[]): void {
    // Save to ASS
    console.log('save to ASS:', tasks);
  }

  private retrieveFromLocalStorage(key: string): any {
    return JSON.parse(localStorage.getItem(key));
  }

  private saveToLocalStorage(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
