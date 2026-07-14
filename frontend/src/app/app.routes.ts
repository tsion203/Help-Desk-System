import { Routes } from '@angular/router';

import { LoginComponent } from './components/auth/login/login.component';

import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard/dashboard.component';

import { UserListComponent } from './components/users/user-list/user-list.component';
import { UserFormComponent } from './components/users/user-form/user-form.component';
import { UserDetailsComponent } from './components/users/user-details/user-details.component';

import { DepartmentListComponent } from './components/departments/department-list/department-list.component';
import { DepartmentFormComponent } from './components/departments/department-form/department-form.component';

import { RoleListComponent } from './components/roles/role-list/role-list.component';
import { RoleFormComponent } from './components/roles/role-form/role-form.component';

import { TicketListComponent } from './components/tickets/ticket-list/ticket-list.component';
import { TicketDetailsComponent } from './components/tickets/ticket-details/ticket-details.component';
import { TicketFormComponent } from './components/tickets/ticket-form/ticket-form.component';
import { TicketUpdateComponent } from './components/tickets/ticket-update/ticket-update.component';

import { TicketCommentListComponent } from './components/tickets/ticket-comment-list/ticket-comment-list.component';
import { TicketCommentFormComponent } from './components/tickets/ticket-comment-form/ticket-comment-form.component';

import { TicketAttachmentListComponent } from './components/tickets/ticket-attachment-list/ticket-attachment-list.component';
import { TicketAttachmentFormComponent } from './components/tickets/ticket-attachment-form/ticket-attachment-form.component';

import { TicketAssignmentHistoryComponent } from './components/tickets/ticket-assignment-history/ticket-assignment-history.component';
import { TicketStatusHistoryComponent } from './components/tickets/ticket-status-history/ticket-status-history.component';

export const routes: Routes = [

  { path: '', component: LoginComponent },

  { path: 'home', component: HomeComponent, },
  { path: 'dashboard', component: DashboardComponent },

  { path: 'users', component: UserListComponent },
  { path: 'users/new', component: UserFormComponent },
  { path: 'users/:id', component: UserDetailsComponent },

  { path: 'departments', component: DepartmentListComponent },
  { path: 'departments/new', component: DepartmentFormComponent },

  { path: 'roles', component: RoleListComponent },
  { path: 'roles/new', component: RoleFormComponent },

  { path: 'tickets', component: TicketListComponent },
  { path: 'tickets/new', component: TicketFormComponent },
  { path: 'tickets/:id', component: TicketDetailsComponent },
  { path: 'tickets/:id/edit', component: TicketUpdateComponent },

  { path: 'tickets/:id/comments', component: TicketCommentListComponent },
  { path: 'tickets/:id/comments/new', component: TicketCommentFormComponent },

  { path: 'tickets/:id/attachments', component: TicketAttachmentListComponent },
  { path: 'tickets/:id/attachments/new', component: TicketAttachmentFormComponent },

  { path: 'tickets/:id/assignment-history', component: TicketAssignmentHistoryComponent },

  { path: 'tickets/:id/status-history', component: TicketStatusHistoryComponent },

  { path: '**', redirectTo: '' }

];