import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterLink],
  template: `<main class="page"><section class="card"><h1>Access denied</h1><p>You do not have permission to open this page.</p><a class="btn btn-primary" routerLink="/home">Return home</a></section></main>`
})
export class AccessDeniedComponent {}
