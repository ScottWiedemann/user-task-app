import { Component } from '@angular/core';

import { Task } from '@take-home/shared';
import { take } from 'rxjs';
import { TasksService } from '../tasks.service';
import { Router } from '@angular/router';
import { StorageService } from '../../storage/storage.service';

@Component({
  selector: 'take-home-list-component',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: false,
})
export class ListComponent {
  constructor(
    private storageService: StorageService,
    protected tasksService: TasksService,
    private router: Router,
  ) {
    this.getTaskList();
  }

  async onDoneTask(item: Task): Promise<void> {
    item['completed'] = true;
    await this.storageService.updateTaskItem(item);
  }

  async onDeleteTask(item: Task): Promise<void> {
    item['isArchived'] = true;
    await this.storageService.updateTaskItem(item);
    this.tasksService.getTasksFromStorage();
  }

  async onAddTask(): Promise<void> {
    await this.router.navigate(['add']);
  }

  private async getTaskList(): Promise<void> {
    this.tasksService
      .getTasksFromApi()
      .pipe(take(1))
      .subscribe(async (tasks) => {
        tasks.forEach(async (task) => {
          await this.storageService.updateTaskItem(task);
        });
        await this.tasksService.getTasksFromStorage();
      });
  }
}
