import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  portalLabel = 'HELP DESK PORTAL';
  heading = 'Support that keeps work moving.';
  description = 'Create, track, and resolve every request from one secure workspace.';
}
