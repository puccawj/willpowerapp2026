import { Injectable, computed, signal } from '@angular/core';
import { StudentUser } from '../models/student.models';

const STORAGE_KEY = 'willpower.student-session';

function readStoredUser(): StudentUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as StudentUser) : null;
}

function initialsFromEmail(email: string): string {
  const name = email.split('@')[0] ?? 'S';
  return name.slice(0, 2).toUpperCase();
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<StudentUser | null>(readStoredUser());
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  login(email: string): void {
    const trimmed = email.trim();
    const name = trimmed.split('@')[0] || 'Student';
    const user: StudentUser = {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: trimmed || 'student@example.com',
      initials: initialsFromEmail(trimmed || 'student@example.com'),
    };
    this.currentUser.set(user);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }

  logout(): void {
    this.currentUser.set(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }
}
