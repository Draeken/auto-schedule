import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DeliveryService }  from './delivery.service';
import { DataIOService }  from '../../core/data-io.service';
import { Task,
         TaskTransformNeed,
         TaskTransformUpdate,
         TaskTransformInsert,}       from './task.interface';
import { Agent }  from '../agents/agent.abstract';

interface Resource {
  objects: Object[];
  ref: string;
  collectionName: string;
}

@Injectable()
export class ResourceMapperService {

  constructor(private delivery: DeliveryService, private dataIo: DataIOService) {
  }

  updateTimeline(t: Observable<Task[]>): Observable<any> {
    return t
      .withLatestFrom(this.delivery.agents)
      .map(this.parseActivities)
      .filter(c => c[1].isValid)
      .map(c => c[0]);
  }

  parseActivities(c: [Task[], Agent[]]): [Task[], {isValid: boolean}] {
    let tasks = c[0];
    let agents = c[1];
    let valid = { isValid: true };

    tasks.forEach(task => {
      let resources: Resource[];
      task.transform.needs.forEach(this.handleNeeds.bind(this, resources, agents));
      task.transform.updates.forEach(this.handleUpdates.bind(this, resources));
      task.transform.inserts.forEach(this.handleInserts);

      resources.forEach(resource => {
        let col = this.dataIo.getCollection(resource.collectionName);
        resource.objects.forEach(obj => col.remove(obj));
      });
    });

    return [tasks, valid];
  }

  private handleNeeds(resources: Resource[], agents: Agent[], need: TaskTransformNeed) {
    let col = this.dataIo.getCollection(need.collectionName);
    if (!col) {
      console.error(`Collection ${need.collectionName} doesn't exist.`);
      //Call all agents with corresponding blabla
      return;
    }
    let objs = col.find(need.find);
    if (objs.length < need.quantity) {
      //Push agent request and send all in one time with delivery method. Agents will respond with feedback obs.
    }
    resources.push({ objects: objs.slice(0, need.quantity), ref: need.ref, collectionName: need.collectionName });
  }

  private handleUpdates(resources: Resource[], update: TaskTransformUpdate) {
    let resourceI = resources.findIndex(r => r.ref === update.ref);
    let resource = resources[resourceI];
    resources.splice(resourceI, 1);
    let col = this.dataIo.getCollection(resource.collectionName);
    if (!col) { console.error(`No collection ${resource.collectionName}.`); return; }
    this.applyUpdate(resource.objects, update.update, col);
  }

  private handleInserts(insert: TaskTransformInsert) {
    let col = this.dataIo.getCollection(insert.collectionName);
    col.insert(insert.doc);
  }

  private applyUpdate(obs: Object[], update: Object, col: loki.Collection): void {

  }

}
