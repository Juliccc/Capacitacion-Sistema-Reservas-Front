import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-error-toast',
  imports: [],
  templateUrl: './error-toast.html',
  styleUrl: './error-toast.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorToast {
  readonly message = input<string | null>(null);

  readonly dismissed = output<void>();

  protected cerrar(): void {
    this.dismissed.emit();
  }
}
