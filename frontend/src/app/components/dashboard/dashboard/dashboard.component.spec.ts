import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { TicketService } from '../../../services/ticket.service';
import { DashboardComponent } from './dashboard.component';

describe('Employee dashboard FAQ', () => {
  let roles: string[];

  beforeEach(() => {
    roles = ['EMPLOYEE'];
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isEmployee: () => roles.includes('EMPLOYEE'),
            isAdmin: () => roles.includes('ADMIN'),
            isSupervisor: () => roles.includes('SUPERVISOR'),
            isSupportOfficer: () => roles.includes('SUPPORT_OFFICER'),
          },
        },
        { provide: TicketService, useValue: { ticketsChanged$: NEVER, getDashboard: () => NEVER } },
      ],
    });
  });

  it('searches questions, answers, and categories and can clear an empty result', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const search = element.querySelector<HTMLInputElement>('#faq-search')!;
    const query = (value: string) => {
      search.value = value;
      search.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };
    expect(element.querySelectorAll('details summary').length).toBe(14);
    query('  PRINTER  ');
    expect(element.querySelectorAll('details').length).toBe(1);
    expect(element.querySelector('summary')?.textContent).toContain('printer');
    query('DNS');
    expect(element.querySelector('summary')?.textContent).toContain('network/internet');
    query('Account & Login');
    expect(element.querySelectorAll('details').length).toBe(2);
    query('no-such-help-topic');
    expect(element.querySelectorAll('details').length).toBe(0);
    expect(element.querySelector('#faq-results')?.textContent).toContain('No matching help topics');
    element.querySelector<HTMLButtonElement>('.faq-search-row button')!.click();
    fixture.detectChanges();
    expect(search.value).toBe('');
    expect(element.querySelectorAll('details').length).toBe(14);
    fixture.destroy();
  });

  for (const otherRoles of [
    ['ADMIN'],
    ['SUPERVISOR'],
    ['SUPPORT_OFFICER'],
    ['EMPLOYEE', 'ADMIN'],
    ['EMPLOYEE', 'SUPPORT_OFFICER'],
  ]) {
    it(`preserves the ${otherRoles.join('/')} dashboard without an employee FAQ`, () => {
      roles = otherRoles;
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.faq-card')).toBeNull();
      expect(fixture.nativeElement.querySelector('.metrics')).not.toBeNull();
      fixture.destroy();
    });
  }
});
