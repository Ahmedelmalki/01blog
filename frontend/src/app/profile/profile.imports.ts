import { CommonModule } from '@angular/common';
import { PostCardComponent } from '../shared/post-cards/post-card.component';
import { FollowButtonComponent } from '../shared/follow/follow-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

export const PROFILE_IMPORTS = [
    CommonModule,
    PostCardComponent,
    FollowButtonComponent,
    FontAwesomeModule
];