import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { FeedComponent } from './feed/feed.component';
import { CreateComponent } from './creat-post/create.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './admin/dashboard.component';
import { NotificationsComponent } from './notifications/notifications.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'feed', component: FeedComponent },
  { path: 'post/create', component: CreateComponent },
  { path: 'profile/:username', component: ProfileComponent },
  { path: 'post/edit/:id', component: CreateComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'admin/dashboard', component: DashboardComponent },
  // { path: '**', redirectTo: '/login' }
];