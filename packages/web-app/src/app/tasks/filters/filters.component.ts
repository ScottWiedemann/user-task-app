import { Component } from '@angular/core';
import { TasksService } from '../tasks.service';
import { Task } from '@take-home/shared';
import { MatChipSelectionChange } from '@angular/material/chips';

@Component({
  selector: 'take-home-filters-component',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  standalone: false,
})
export class FiltersComponent {
  constructor(protected tasksService: TasksService) {}

  async filterTask(
    field: keyof Task,
    event: MatChipSelectionChange,
  ): Promise<void> {
    if (event.selected) {
      this.tasksService.filterTask(field);
    } else {
      await this.tasksService.getTasksFromStorage();
    }
  }
}
