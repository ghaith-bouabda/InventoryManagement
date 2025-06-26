import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthControllerService, UserControllerService } from '../services/services';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { UserDto } from '../services/models/user-dto';

@Component({
  selector: 'app-usermanagement',
  templateUrl: './usermanagement.component.html',
  styleUrls: ['./usermanagement.component.scss'],
  providers: [ConfirmationService]
})
export class UsermanagementComponent implements OnInit {
  registerForm: FormGroup;
  users: UserDto[] = [];
  filteredUsers: UserDto[] = [];
  searchTerm: string = '';
  selectedUser: UserDto | null = null;
  isEditing: boolean = false;
  displayDialog: boolean = false;

  // Add this roles array for the dropdown
  roles = [
    { label: 'User', value: 'USER' },
    { label: 'Admin', value: 'ADMIN' }
  ];

  constructor(
    private fb: FormBuilder,
    private auth: AuthControllerService,
    private userService: UserControllerService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['USER', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
      },
      error: (err) => this.showError('Failed to load users')
    });
  }

  filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.username?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term)
    );
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    const formData = this.registerForm.value;

    this.auth.register({body: formData}).subscribe({
      next: (res) => {
        this.showSuccess('User created successfully');
        this.registerForm.reset();
        this.loadUsers();
      },
      error: (err) => {
        this.showError('Registration failed. Please try again.');
      }
    });
  }

  editUser(user: UserDto): void {
    this.selectedUser = { ...user };
    this.isEditing = true;
    this.registerForm.patchValue({
      username: user.username,
      email: user.email,

      role: user.role
    });
    // Remove password validator for edit
    this.registerForm.get('password')?.clearValidators();
    this.registerForm.get('password')?.updateValueAndValidity();
  }

  updateUser(): void {
    if (this.registerForm.invalid || !this.selectedUser?.id) {
      return;
    }

    const updatedUser = {
      ...this.registerForm.value,
      id: this.selectedUser.id
    };

    this.userService.editUser({
      id: this.selectedUser.id,
      body: updatedUser
    }).subscribe({
      next: (res) => {
        this.showSuccess('User updated successfully');
        this.cancelEdit();
        this.loadUsers();
      },
      error: (err) => this.showError('Failed to update user')
    });
  }

  confirmDelete(user: UserDto): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${user.username}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteUser(user.id!);
      }
    });
  }

  deleteUser(id: number): void {
    this.userService.deleteUser({ id }).subscribe({
      next: () => {
        this.showSuccess('User deleted successfully');
        this.loadUsers();
      },
      error: (err) => this.showError('Failed to delete user')
    });
  }

  cancelEdit(): void {
    this.selectedUser = null;
    this.isEditing = false;
    this.registerForm.reset();
    this.registerForm.get('password')?.setValidators([Validators.required]);
    this.registerForm.get('password')?.updateValueAndValidity();
    this.registerForm.get('role')?.setValue('USER');
  }

  showSuccess(msg: string): void {
    this.toastr.success(msg);
  }

  showError(msg: string): void {
    this.toastr.error(msg);
  }
}
