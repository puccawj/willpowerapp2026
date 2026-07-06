import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly roleService = inject(RoleService);

  private readonly routeData = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.deepestChild(this.route).snapshot.data),
    ),
    { initialValue: this.deepestChild(this.route).snapshot.data },
  );

  readonly title = computed(() => (this.routeData()['title'] as string) ?? '');
  readonly subtitle = computed(() => (this.routeData()['subtitle'] as string) ?? '');

  private deepestChild(route: ActivatedRoute): ActivatedRoute {
    let r = route;
    while (r.firstChild) r = r.firstChild;
    return r;
  }
}
