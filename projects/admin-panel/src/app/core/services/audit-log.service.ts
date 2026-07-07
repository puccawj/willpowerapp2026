import { Injectable, signal } from '@angular/core';

export interface AuditLogEntry {
  id: number;
  timestamp: Date;
  actor: string;
  action: string;
}

let nextId = 1;

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  readonly entries = signal<AuditLogEntry[]>([]);

  record(actor: string, action: string): void {
    this.entries.update((list) => [{ id: nextId++, timestamp: new Date(), actor, action }, ...list].slice(0, 50));
  }
}
