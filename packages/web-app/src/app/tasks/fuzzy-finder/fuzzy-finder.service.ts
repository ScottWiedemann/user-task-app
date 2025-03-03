import { Injectable } from '@angular/core';
import Fuse from 'fuse.js';
import { Task } from '@take-home/shared';

@Injectable({
  providedIn: 'root',
})
export class FuzzyFinderService {
  private fuse: Fuse<Task> | null = null;

  constructor() {}

  initializeFuse(tasks: Task[]): void {
    if (!this.fuse) {
      const options = {
        keys: ['title'],
        threshold: 0.4,
      };
      this.fuse = new Fuse(tasks, options);
    }
  }

  getFuse(): Fuse<Task> | null {
    return this.fuse;
  }

  updateTasks(tasks: Task[]): void {
    if (this.fuse) {
      this.fuse.setCollection(tasks);
    } else {
      this.initializeFuse(tasks);
    }
  }
}
