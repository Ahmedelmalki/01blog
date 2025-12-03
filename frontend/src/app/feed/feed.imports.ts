import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PostCardComponent } from '../shared/post-cards/post-card.component'; 

export const FEED_IMPORTS = [
  CommonModule,
  RouterLink,
  FontAwesomeModule,
  PostCardComponent,
];