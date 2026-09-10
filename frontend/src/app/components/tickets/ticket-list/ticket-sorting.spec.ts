import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { TicketService } from '../../../services/ticket.service';
import { TicketCategoryService } from '../../../services/ticket-category.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmationService } from '../../../services/confirmation.service';
import { TicketListComponent } from './ticket-list.component';
import { CreatedTicketListComponent } from '../created-ticket-list/created-ticket-list.component';
import { AssignedTicketListComponent } from '../assigned-ticket-list/assigned-ticket-list.component';

for (const component of [TicketListComponent, CreatedTicketListComponent, AssignedTicketListComponent]) {
  describe(component.name + ' sorting', () => {
    it('sends direction and filters on every page and resets the page when direction changes', () => {
      TestBed.configureTestingModule({
        imports: [component],
        providers: [provideHttpClient(), provideHttpClientTesting(), TicketService,
          { provide: TicketCategoryService, useValue: { getAll: () => of([]) } },
          { provide: UserService, useValue: { getCurrentProfile: () => of({ id: 1 }) } },
          { provide: AuthService, useValue: {} },
          { provide: ToastService, useValue: {} },
          { provide: ConfirmationService, useValue: {} },
        ],
      });
      TestBed.overrideComponent(component, { set: { template: '' } });
      const fixture = TestBed.createComponent<TicketListComponent | CreatedTicketListComponent | AssignedTicketListComponent>(component);
      const list = fixture.componentInstance;
      const http = TestBed.inject(HttpTestingController);
      const check = (page: number, direction: string, filtered: boolean) => {
        const request = http.expectOne(req => req.url.includes('/tickets'));
        expect(request.request.params.get('sort')).toBe('updatedAt,' + direction);
        expect(request.request.params.get('page')).toBe(String(page));
        expect(request.request.params.get('size')).toBe('5');
        expect(request.request.params.get('status')).toBe(filtered ? 'OPEN' : null);
        expect(request.request.params.get('category')).toBe(filtered ? 'Hardware' : null);
        expect(request.request.params.get('priority')).toBe(filtered ? 'HIGH' : null);
        request.flush({ content: [], number: page, totalElements: 15, totalPages: 3 });
      };
      list.ngOnInit();
      check(0, 'desc', false);
      list.filterForm.patchValue({ status: 'OPEN', category: 'Hardware', priority: 'HIGH' });
      check(0, 'desc', true);
      list.changePage(2);
      check(2, 'desc', true);
      list.filterForm.controls.sortDirection.setValue('asc');
      check(0, 'asc', true);
      list.changePage(1);
      check(1, 'asc', true);
      list.clearFilters();
      check(0, 'asc', false);
      http.verify();
      fixture.destroy();
    });
  });
}

