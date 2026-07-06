import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminDataService } from '../../core/services/admin-data.service';
import { CrudModalService } from '../../core/services/crud-modal.service';
import { RoleService } from '../../core/services/role.service';
import { ListController } from '../../core/list-controller';
import { TableToolbar } from '../../shared/table-toolbar/table-toolbar';
import { Course, FieldDef } from '../../core/models/admin.models';

const FIELDS: FieldDef[] = [
  { key: 'title', label: 'Course title', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'sessions', label: 'Total sessions', type: 'number' },
  { key: 'hours', label: 'Total hours', type: 'number' },
  { key: 'pass', label: 'Passing % (e.g. 80%)', type: 'text' },
];

@Component({
  selector: 'app-courses',
  imports: [TableToolbar],
  templateUrl: './courses.html',
  styleUrl: './courses.scss',
})
export class Courses {
  private readonly data = inject(AdminDataService);
  private readonly modal = inject(CrudModalService);
  private readonly router = inject(Router);
  readonly roleService = inject(RoleService);

  private readonly visibleCourses = computed(() => {
    if (!this.roleService.isInstructor()) return this.data.courses();
    const myTitles = new Set(
      this.data
        .offerings()
        .filter((o) => o.instructor === this.roleService.instructorName)
        .map((o) => o.course),
    );
    return this.data.courses().filter((c) => myTitles.has(c.title));
  });

  readonly ctrl = new ListController<Course>(this.visibleCourses);

  goSchedule(): void {
    this.router.navigate(['/schedule']);
  }

  addCourse(): void {
    this.modal.open({
      title: 'Add Course',
      fields: FIELDS,
      isEdit: false,
      values: { title: '', category: '', sessions: 8, hours: 16, pass: '80%' },
      onSave: (values) => {
        this.data.courses.update((list) => [...list, { status: 'Active', ...values } as Course]);
      },
    });
  }

  editCourse(course: Course): void {
    this.modal.open({
      title: 'Edit Course',
      fields: FIELDS,
      isEdit: true,
      values: { ...course },
      onSave: (values) => {
        this.data.courses.update((list) => list.map((c) => (c === course ? { ...c, ...values } as Course : c)));
      },
      onDelete: () => {
        this.data.courses.update((list) => list.filter((c) => c !== course));
      },
    });
  }
}
