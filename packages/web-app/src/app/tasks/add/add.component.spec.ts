import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { StorageService } from '../../storage/storage.service';
import { AddComponent } from './add.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Router } from '@angular/router';
import { MatButtonHarness } from '@angular/material/button/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { addDays, subDays } from 'date-fns';
import { MatNativeDateModule } from '@angular/material/core';

class MockStorageService {
  updateTaskItem(): void {
    return;
  }
}

describe('AddComponent', () => {
  let fixture: ComponentFixture<AddComponent>;
  let loader: HarnessLoader;
  let component: AddComponent;
  let storageService: StorageService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
      ],
      declarations: [AddComponent],
      providers: [{ provide: StorageService, useClass: MockStorageService }],
    }).compileComponents();
  });

  beforeEach(() => {
    router = TestBed.inject(Router);
    storageService = TestBed.inject(StorageService);
    fixture = TestBed.createComponent(AddComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeDefined();
  });

  it('should display the title', () => {
    const title = fixture.debugElement.query(By.css('h1'));
    expect(title.nativeElement.textContent).toEqual('Add Task');
  });

  it(`should navigate to home when cancel button is clicked`, async () => {
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    jest.spyOn(component, 'onCancel');
    const cancelButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="cancel"]' }),
    );
    await cancelButton.click();
    fixture.detectChanges();
    expect(component.onCancel).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it(`should prevent adding task without a valid title`, async () => {
    const addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="add-task"]' }),
    );
    expect(await addButton.isDisabled()).toBeTruthy();
    component['addTaskForm'].controls['title'].setValue('Invalid');
    fixture.detectChanges();
    expect(await addButton.isDisabled()).toBeTruthy();
    component['addTaskForm'].controls['title'].setValue(
      'This is a valid title',
    );
    fixture.detectChanges();
    expect(await addButton.isDisabled()).toBeFalsy();
  });

  it(`should create a new task for a valid submission and navigate home`, async () => {
    const scheduledDate = new Date();
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    jest.spyOn(component, 'onSubmit');
    jest.spyOn(storageService, 'updateTaskItem').mockResolvedValue();
    component['addTaskForm'].controls['title'].setValue('Adding a test task');
    component['addTaskForm'].controls['description'].setValue(
      'This task should be added to the list',
    );
    component['addTaskForm'].controls['scheduledDate'].setValue(scheduledDate);
    fixture.detectChanges();
    const addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="add-task"]' }),
    );
    await addButton.click();
    fixture.detectChanges();
    expect(component.onSubmit).toHaveBeenCalledTimes(1);
    expect(storageService.updateTaskItem).toHaveBeenCalledTimes(1);
    expect(storageService.updateTaskItem).toHaveBeenCalledWith(
      expect.objectContaining({
        isArchived: false,
        title: 'Adding a test task',
        description: 'This task should be added to the list',
        scheduledDate,
      }),
    );
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it(`should prevent adding task without scheduledDate within 7 days of today`, async () => {
    const addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="add-task"]' }),
    );
    const scheduledDate = new Date();
    component['addTaskForm'].controls['title'].setValue(
      'This is a valid title',
    );
    expect(await addButton.isDisabled()).toBeFalsy();

    component['addTaskForm'].controls['scheduledDate'].setValue(
      addDays(scheduledDate, 10),
    );
    fixture.detectChanges();
    expect(await addButton.isDisabled()).toBeTruthy();

    component['addTaskForm'].controls['scheduledDate'].setValue(
      subDays(scheduledDate, 1),
    );
    fixture.detectChanges();
    expect(await addButton.isDisabled()).toBeTruthy();

    component['addTaskForm'].controls['scheduledDate'].setValue(scheduledDate);
    fixture.detectChanges();
    expect(await addButton.isDisabled()).toBeFalsy();

    component['addTaskForm'].controls['scheduledDate'].setValue(
      addDays(scheduledDate, 7),
    );
    fixture.detectChanges();
    expect(await addButton.isDisabled()).toBeFalsy();
  });
});
