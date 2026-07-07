import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './layout/sidebar/sidebar';
import { Topbar } from './layout/topbar/topbar';
import { CrudModal } from './shared/crud-modal/crud-modal';
import { ToastHost } from './shared/toast-host/toast-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Topbar, CrudModal, ToastHost],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
