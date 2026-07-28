import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent {
  user: User | null = null;
  loading = false;
  errorMessage = '';
}
