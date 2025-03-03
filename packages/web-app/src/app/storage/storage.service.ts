import { Injectable } from '@angular/core';
import { openDB } from 'idb';
import { from, Observable } from 'rxjs';

import { Task } from '@take-home/shared';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private dbName = 'take-home';
  private dbVersion = 1;
  private tasks = 'tasks';

  constructor() {
    this.restoreIndexedDB();
  }

  // Create / Update
  async addTaskItem(item: Task): Promise<void> {
    await this.addTask(item);
  }

  async updateTaskItem(item: Task): Promise<void> {
    await this.updateTask(item);
  }

  // Read
  async getTask(id: string | null): Promise<Task> {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return dbPromise.then((db) => {
      return db.get(`${this.tasks}`, id ? id : '');
    });
  }

  async getTasks(): Promise<Task[]> {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return dbPromise.then((db) => {
      return db.getAll(`${this.tasks}`);
    });
  }

  getItem<T>(storeName: string, id: string | null): Observable<T> {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return from(
      dbPromise.then((db) => {
        return db.get(storeName, id ? id : '');
      }),
    );
  }

  async getItems<T>(storeName: string): Promise<T[]> {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return dbPromise.then((db) => {
      return db.getAll(storeName);
    });
  }

  async resetIndexedDB(): Promise<void> {
    const tasks = this.clearTasks();
    await Promise.allSettled([tasks]).then(() => {
      this.restoreIndexedDB();
    });
  }

  private async addTask(item: Task) {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return dbPromise.then((db) => {
      return db.add(this.tasks, item, item.uuid);
    });
  }

  private async updateTask(item: Task) {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return dbPromise.then((db) => {
      return db.put(this.tasks, item, item.uuid);
    });
  }

  private async clearTasks() {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return dbPromise.then((db) => {
      return db.clear(`${this.tasks}`);
    });
  }

  private async restoreIndexedDB(tasks = `${this.tasks}`) {
    await openDB(`${this.dbName}`, this.dbVersion, {
      upgrade(db) {
        db.createObjectStore(tasks).createIndex('uuid', 'uuid', {
          unique: true,
        });
      },
    });
  }
}
