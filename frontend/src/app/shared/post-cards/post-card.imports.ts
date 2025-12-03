import { RouterLink } from '@angular/router';
import { LikesComponent } from '../likes/likes.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { FollowButtonComponent } from '../follow/follow-button.component';
import { CommentsComponent } from '../comments/comments.component';

export const POST_CARD_IMPORTS = [
    CommonModule,
    RouterLink,
    LikesComponent,
    FontAwesomeModule,
    FollowButtonComponent,
    CommentsComponent
]