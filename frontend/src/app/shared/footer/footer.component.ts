import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly githubUrl = 'https://github.com/Samrat880/FletNix';
}
