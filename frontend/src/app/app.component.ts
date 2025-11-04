
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';  // ✅ add this import
// import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';        // ✅ import your icon



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink/*, FontAwesomeModule*/],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = '01Blog';
  // faThumbsUp = faThumbsUp;
}