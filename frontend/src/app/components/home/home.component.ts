import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandLogoComponent } from '../shared/brand-logo/brand-logo.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, BrandLogoComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly features = [
    { icon: 'ticket', title: 'Ticket Management', description: 'Create, prioritize, assign, and resolve support requests from one organized workspace.' },
    { icon: 'mail', title: 'Email Notifications', description: 'Keep requesters and support teams informed with timely status updates.' },
    { icon: 'team', title: 'Team Collaboration', description: 'Route requests to the right experts and work together toward faster resolutions.' },
    { icon: 'lock', title: 'Secure Access', description: 'Role-based access keeps internal support information protected and relevant.' },
    { icon: 'audit', title: 'Full Audit Trail', description: 'Track every assignment, comment, and status change with complete accountability.' },
    { icon: 'dashboard', title: 'Dashboard Overview', description: 'See workload, priorities, and service performance at a glance.' },
  ];
}
