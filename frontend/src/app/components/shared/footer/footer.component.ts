import { Component } from '@angular/core';
import { BrandLogoComponent } from '../brand-logo/brand-logo.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [BrandLogoComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  applicationName = 'HelpDesk';
  systemStatus = 'All systems operational';
}
