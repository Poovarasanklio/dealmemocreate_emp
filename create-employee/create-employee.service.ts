import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserData, EmployeeResponse } from 'app/core/create-employee/create-employee.types'; // Adjust the path as needed

@Injectable({
  providedIn: 'root'
})
export class CreateEmployeeService {
  private baseUrl = 'http://localhost:4200'; // Adjust according to your Laravel base URL
  private authKey = 'auth_key eyJpdiI6IjJkL2x6VldGdUZIcUtGVy9LODFnUlE9PSIsInZhbHVlIjoiMjdnblN3bkM0Sm9ZTXJPYTZ2QndSdz09IiwibWFjIjoiYzRlODg3MmY0MTU0MzFjZDMxZmU4ZDkwODA1NTM2MmE3MjVmOTNmZWRmODcxMWRhM2Y4NDE0YTUzNDdlNzBhYSIsInRhZyI6IiJ9'; // Replace with your actual authentication key

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authKey}`,
      'Content-Type': 'application/json'
    });
  }

  // Create a new employee
  createEmployee(employeeData: UserData): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/api/employee`, employeeData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get all employees
  getEmployees(): Observable<EmployeeResponse> {
    const headers = this.getHeaders();
    return this.http.get<EmployeeResponse>(`${this.baseUrl}/api/employee`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update an existing employee
  updateEmployee(employeeId: number, employeeData: UserData): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.baseUrl}/api/employee/${employeeId}`, employeeData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Delete an employee
  deleteEmployee(employeeId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.baseUrl}/api/employee/${employeeId}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Reset the password of an employee employee/{id}/reset_password
  resetPassword(employeeId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/api/employee/${employeeId}/reset_password`, {}, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Handle errors
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError(() => error);
  }
}
