import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private defaultConfig: MatSnackBarConfig = {
    duration: 3500,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  constructor(private snackBar: MatSnackBar) {}

  success(message: string): void {
    this.snackBar.open(message, '✕', {
      ...this.defaultConfig,
      panelClass: ['success-snack'],
    });
  }

  error(message: string): void {
    this.snackBar.open(message, '✕', {
      ...this.defaultConfig,
      duration: 5000,
      panelClass: ['error-snack'],
    });
  }

  info(message: string): void {
    this.snackBar.open(message, '✕', this.defaultConfig);
  }
}
