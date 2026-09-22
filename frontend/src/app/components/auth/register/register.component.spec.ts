import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RegisterComponent } from './register.component';

describe('Registration email verification', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); sessionStorage.clear(); });

  it('shows verification before success, handles wrong codes, resends, and completes registration', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
    http.expectOne(request => request.url.endsWith('/departments')).flush([]);
    const component = fixture.componentInstance;
    component.registerForm.setValue({ email: 'person@example.test', password: 'SecurePassword123!',
      firstName: 'Test', lastName: 'Person', employeeId: 'EMP-1', phoneNumber: '12345678',
      departmentId: 1, active: true, roleIds: [] });
    component.onRegister();
    const challenge = { registrationId: 'pending-id', expiresAt: new Date(Date.now() + 600000).toISOString(),
      resendAvailableAt: new Date(Date.now() - 1000).toISOString() };
    http.expectOne(request => request.url.endsWith('/auth/register')).flush(challenge);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Verify your email');
    expect(component.completed).toBe(false);
    expect(localStorage.getItem('helpdesk_jwt')).toBeNull();
    expect(sessionStorage.getItem('helpdesk_registration')).not.toContain('SecurePassword');
    component.verificationForm.controls.code.setValue('123456');
    component.onVerify();
    http.expectOne(request => request.url.endsWith('/register/verify')).flush(
      { message: 'The verification code is incorrect. Please try again.' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('The verification code is incorrect');
    expect(component.completed).toBe(false);
    component.onResend();
    http.expectOne(request => request.url.endsWith('/register/resend')).flush({ ...challenge,
      resendAvailableAt: new Date(Date.now() + 60000).toISOString() });
    expect(component.canResend).toBe(false);
    component.verificationForm.controls.code.setValue('654321');
    component.onVerify();
    http.expectOne(request => request.url.endsWith('/register/verify')).flush({ token: 'verified-token', email: 'person@example.test', role: 'EMPLOYEE' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Your account has been created.');
    expect(sessionStorage.getItem('helpdesk_registration')).toBeNull();
    expect(fixture.nativeElement.querySelector('a')?.getAttribute('href')).toBe('/login');
    fixture.destroy();
  });
});
