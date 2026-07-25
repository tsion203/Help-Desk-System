import { Component } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [],
  templateUrl: './user-details.component.html',
})
export class UserDetailsComponent {
  constructor(private readonly userService: UserService) {}
}
