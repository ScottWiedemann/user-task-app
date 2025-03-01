import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Task, TaskPriority } from '@take-home/shared';
import { StorageService } from '../../storage/storage.service';
import { faker } from '@faker-js/faker';
import { addDays } from 'date-fns';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'take-home-add-component',
  templateUrl: './add.component.html',
  providers: [provideNativeDateAdapter()],
  styleUrls: ['./add.component.scss'],
  standalone: false,
})
export class AddComponent {
  protected today = new Date();
  protected addTaskForm: FormGroup = new FormGroup({
    title: new FormControl(null, {
      validators: [Validators.required, Validators.minLength(10)],
    }),
    description: new FormControl(null),
    priority: new FormControl(
      { value: TaskPriority.MEDIUM, disabled: false },
      {
        validators: Validators.required,
      },
    ),
    scheduledDate: new FormControl(this.today),
  });
  protected priorities = Object.values(TaskPriority);
  protected minDate = this.today;
  protected maxDate = addDays(this.today, 7);

  constructor(private storageService: StorageService, private router: Router) {}

  onSubmit() {
    const newTask: Task = {
      ...this.addTaskForm.getRawValue(),
      uuid: faker.string.uuid(),
      isArchived: false,
    };

    this.storageService.updateTaskItem(newTask);

    this.router.navigateByUrl('/');
  }

  onCancel(): void {
    this.router.navigateByUrl('/');
  }
}
