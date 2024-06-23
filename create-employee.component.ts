import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { TextFieldModule } from '@angular/cdk/text-field';
import { CreateEmployeeService } from 'app/core/create-employee/create-employee.service';
import { UserData, EmployeeResponse } from 'app/core/create-employee/create-employee.types';

// Alert import
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'app/shared folder/confirmation-dialog/confirmation-dialog.component';


// matdialog



@Component({
  selector: 'app-create-employee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    TextFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    CommonModule,
    MatProgressSpinnerModule,
    FuseAlertComponent,
    ConfirmationDialogComponent,
    MatDialogModule
    ],
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.scss']
})





export class CreateEmployeeComponent implements OnInit, AfterViewInit {

  newEmployeeForm: FormGroup;
  dataSource = new MatTableDataSource<UserData>([]);
  displayedColumns: string[] = ['name', 'address', 'mobile_number', 'email', 'action'];
  fieldErrors: { [key: string]: string } = {};
  roles: number[] = [1, 2, 3];
  selectedEmployee: UserData | null = null;
  // loading: boolean = true; // Loading state
  showAlert: boolean = false;
  getConfirm: boolean = false;
  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('nameInput') nameInput: ElementRef;
  @ViewChild('addressInput') addressInput: ElementRef;
  @ViewChild('emailInput') emailInput: ElementRef;
  @ViewChild('mobile_numberInput') mobile_numberInput: ElementRef;
  @ViewChild('roleidInput') roleidInput: MatSelect; // Use MatSelect instead of ElementRef
 
  openForm() {
    this.getConfirm = !this.getConfirm;
  }
  
  

  constructor(private _formBuilder: FormBuilder, private createEmployeeService: CreateEmployeeService,private dialog: MatDialog) { }

  ngOnInit(): void {
    this.newEmployeeForm = this._formBuilder.group({
      name: [''],
      address: [''],
      email: [''],
      mobile_number: [''],
      role_id: ['']
    });

    this.loadEmployees();
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadEmployees(): void {
    // this.loading = true; // Set loading to true
    this.createEmployeeService.getEmployees()
      .subscribe(
        (response: EmployeeResponse) => {
          this.dataSource.data = response.data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          // this.loading = false; // Set loading to false
        },
        error => {
          console.error('Error loading employees:', error);
          // this.loading = false; // Set loading to false
        }
      );
  }

  private createEmployee(employeeData: UserData): void {
    this.createEmployeeService.createEmployee(employeeData).subscribe({
      next: (response) => {
        console.log(
          'Employee created successfully!', response);
        // alert('Employee created successfully!');
        this.alert = {
          message: response,
          type: 'success'
        };
        this.showAlert = true;
        this.loadEmployees();
        this.resetForm();
      },
      error: (error) => {
        if (error.error && error.error.error) {
          console.log('error = >', " ", error.error.error)
          this.mapErrorsToFields(error.error.error);
        } else {
          alert('An error occurred while creating the employee.');
        }
      }
    });
  }

  private updateEmployee(employeeData: UserData): void {
    if (this.selectedEmployee) {
      this.createEmployeeService.updateEmployee(this.selectedEmployee.id, employeeData).subscribe({
        next: (response) => {
          console.log("emp updated =>", response)
          this.alert = {
            type: 'success',
            message: response.msg
          };
          this.showAlert = true;
          this.loadEmployees();
          this.resetForm();
          // alert('Employee updated successfully!');
        },
        error: (error) => {
          if (error.error && error.error.error) {
            this.mapErrorsToFields(error.error.error);
            console.log("update employees consoling => ", error.error.error);

          } else {
            alert('An error occurred while updating the employee.');
          }
        }
      });
    }
  }


  private mapErrorsToFields(errorMessage: string): void {
    console.log('Error message:', errorMessage);

    // Define keyword-based field mapping
    const errorFieldMapping: { [key: string]: string } = {
      'name': 'name',
      'address': 'address',
      'email': 'email',
      'mobile_number': 'mobile_number',
      'role_id': 'role_id',
    };

    // Split error message into words for comparison
    const errorWords = errorMessage.toLowerCase().split(/\s+/);

    for (const key in errorFieldMapping) {
      // Check if any word in error message matches the keyword
      if (errorWords.includes(key.toLowerCase())) {
        const field = errorFieldMapping[key];
        this.newEmployeeForm.get(field)?.setErrors({ backendError: errorMessage });
        this.fieldErrors[field] = errorMessage;
        this.focusField(field);
        console.log('field', field);
        return;
      }
      this.newEmployeeForm.setErrors({ backendError: errorMessage });
    }
  }
  private focusField(field: string): void {
    switch (field) {
      case 'name':
        this.nameInput.nativeElement.focus();
        break;
      case 'mobile_number':
        this.mobile_numberInput.nativeElement.focus();
        break;
      case 'address':
        this.addressInput.nativeElement.focus();
        break;
      case 'email':
        this.emailInput.nativeElement.focus();
        break;
      case 'role_id':
        this.roleidInput.open(); // Use open method for MatSelect Focus on role_id input        break;
        break;
    }
  }

  // delete button for delete an existing employee
  deleteEmployee(employee: UserData): void {
    // Open the confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: { title: 'Delete Employee', message: `Are you sure you want to delete ${employee.name}?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // If user confirmed, proceed with deletion
        this.createEmployeeService.deleteEmployee(employee.id).subscribe({
          next: (response) => {
            this.alert = {
              type: 'success',
              message: response.msg
            };
            this.showAlert = true;
            this.loadEmployees();
          },
          error: (error) => {
            console.error("Error deleting employee:", error);
            this.alert = {
              type: 'error',
              message: 'An error occurred while deleting the employee.'
            };
            this.showAlert = true;
          }
        });
      }
    });
  }

  // form submitting 
  saveForm(): void {
    this.fieldErrors = {}; // Reset previous errors
    if (this.newEmployeeForm.valid) {
      if (this.selectedEmployee) {
        this.updateEmployee(this.newEmployeeForm.value);
      } else {
        this.createEmployee(this.newEmployeeForm.value);
      }
    } else {
      alert('Form is invalid. Please fill all required fields correctly.');
    }
  }
  
  // Edit an employee data
  openEditEmployee(employee: UserData): void {
    this.openForm()
    this.selectedEmployee = employee;
    this.newEmployeeForm.patchValue(employee);
  }


  // function to reset password for an existing employee
  resetPassword(employee: UserData): void {
    if (confirm(`Are you sure you want to reset the password for ${employee.name}?`)) {
      this.createEmployeeService.resetPassword(employee.id).subscribe({
        next: (response) => {
          this.alert = {
            type: 'success',
            message: response.msg
          };
          this.showAlert = true;
          // alert('Password reset successfully!');
        },
        error: (error) => {
          alert('An error occurred while resetting the password.');
          console.error(error);
        }
      });
    }
  }
  
  // fnc for clear the input fields
  resetForm(): void {
    this.newEmployeeForm.reset();
    this.selectedEmployee = null;
    this.fieldErrors = {};
  }
}





