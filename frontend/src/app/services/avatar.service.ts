import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  getInitial(username: string): string {
    return username ? username.charAt(0).toUpperCase() : '?';
  }
  getAvatarColor(username: string): string {
    if (!username) return '#6c757d';
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#e57373', '#f06292', '#ba68c8', '#9575cd',
      '#7986cb', '#64b5f6', '#4fc3f7', '#4dd0e1',
      '#4db6ac', '#81c784', '#aed581', '#ff8a65'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  }
}