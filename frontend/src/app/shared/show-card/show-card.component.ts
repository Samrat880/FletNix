import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Show } from '../../core/models/api.model';
import { ratingTone, showGradient } from '../utils/show-visual.util';

@Component({
  selector: 'app-show-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './show-card.component.html',
})
export class ShowCardComponent {
  @Input({ required: true }) show!: Show;

  gradientClasses(): string {
    return showGradient(this.show.title);
  }

  ratingClasses(): string {
    return ratingTone(this.show.rating);
  }
}
