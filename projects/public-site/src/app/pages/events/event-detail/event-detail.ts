import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { MockDataService } from '../../../core/services/mock-data.service';
import { DonateType, RsvpChoice } from '../../../core/models/willpower.models';

@Component({
  selector: 'app-event-detail',
  imports: [RouterLink],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss',
})
export class EventDetail {
  private readonly data = inject(MockDataService);
  private readonly route = inject(ActivatedRoute);

  private readonly id = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: NaN },
  );

  readonly event = computed(() => this.data.getEventById(this.id()) ?? this.data.events[0]);
  readonly percentFull = computed(() => Math.round((this.event().going / this.event().capacity) * 100));

  readonly rsvpOptions: { key: RsvpChoice; label: string }[] = [
    { key: 'confirm', label: 'Yes, I’ll attend' },
    { key: 'maybe', label: 'Maybe' },
    { key: 'cancel', label: 'Can’t make it' },
  ];

  private readonly rsvpMessages: Record<RsvpChoice, string> = {
    confirm: 'You’re confirmed — a QR check-in code will be emailed to you before the event.',
    maybe: 'Marked as maybe. We’ll send a reminder before the RSVP cut-off.',
    cancel: 'You’ve declined this event. You can change your response any time.',
  };

  readonly rsvp = signal<RsvpChoice | null>(null);
  readonly rsvpMessage = computed(() => (this.rsvp() ? this.rsvpMessages[this.rsvp()!] : ''));

  readonly donateOptions: { key: DonateType; label: string }[] = [
    { key: 'money', label: 'Funds' },
    { key: 'goods', label: 'Goods' },
  ];

  readonly donateType = signal<DonateType>('money');
  readonly donated = signal(false);

  readonly donatePlaceholder = computed(() =>
    this.donateType() === 'money' ? 'Amount (USD)' : 'Describe the goods (e.g. 10 kg rice)',
  );

  constructor() {
    effect(() => {
      this.id();
      this.rsvp.set(null);
      this.donated.set(false);
    });
  }

  setRsvp(choice: RsvpChoice): void {
    this.rsvp.set(choice);
  }

  setDonateType(type: DonateType): void {
    this.donateType.set(type);
  }

  submitDonate(): void {
    this.donated.set(true);
  }
}
