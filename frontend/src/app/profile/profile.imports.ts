import { CommonModule } from '@angular/common';
import { PostCardComponent } from '../shared/post-cards/post-card.component';
import { FollowButtonComponent } from '../shared/follow/follow-button.component';

export const PROFILE_IMPORTS = [
    CommonModule,
    PostCardComponent,
    FollowButtonComponent
];