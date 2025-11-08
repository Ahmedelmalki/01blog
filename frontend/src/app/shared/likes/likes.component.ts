import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-likes',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule],
    templateUrl: './likes.component.html',
    styleUrls: ['./likes.component.css']
})

export class LikesComponent implements OnInit {
    faThumbsUp = faThumbsUp;
    faThumbsDown = faThumbsDown;
    @Input() entityType!: 'post' | 'comment';
    @Input() entityId!: number;
    @Input() likesCount: number = 0;
    @Input() dislikesCount: number = 0;
    @Input() userReaction?: number;

    localUserReaction: number | undefined = undefined;
    localLikesCount: number = 0;
    localDislikesCount: number = 0;

    constructor(private http: HttpClient, private router: Router) { }

    ngOnInit() {
        this.localUserReaction = this.userReaction ?? undefined;
        this.localLikesCount = this.likesCount;
        this.localDislikesCount = this.dislikesCount
    }

    toggleReaction(val: number) {
        const token = localStorage.getItem('token');

        if (!token) {
            this.router.navigate(['/login']);
            return;
        }

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        const endpoint = this.getEndpoint();

        this.http.post(endpoint, {}, { headers }).subscribe({
            next: () => {
                const currentReaction = this.localUserReaction;

                if (currentReaction === val) {
                    this.localUserReaction = undefined;
                    if (val === 1) {
                        this.localLikesCount--;
                    } else {
                        this.localDislikesCount--;
                    }
                } else {
                    if (currentReaction !== undefined) {
                        if (currentReaction === 1) {
                            this.localLikesCount--;
                        } else {
                            this.localDislikesCount--;
                        }
                    }
                    this.localUserReaction = val;
                    if (val === 1) {
                        this.localLikesCount++;
                    } else {
                        this.localDislikesCount++;
                    }
                }
            },
            error: (err) => {
                console.error('❌ Failed to toggle reaction:', err);
            }
        });
    }
    
    // ========= HELPERS ==========
    private getEndpoint(): string {
        if (this.entityType === 'post') {
            return `http://localhost:8080/posts/${this.entityId}/like?value=${this.localUserReaction === 1 ? -1 : 1}`;
        } else if (this.entityType === 'comment') {
            return `http://localhost:8080/comments/${this.entityId}/like?value=${this.localUserReaction === 1 ? -1 : 1}`;
        }
        throw new Error('Invalid entity type');
    }
    
    toggleLike() {
        this.toggleReaction(1);
    }

    toggleDislike() {
        this.toggleReaction(-1);
    }
    
    isLiked(): boolean {
        return this.localUserReaction === 1;
    }
    isDisliked(): boolean {
        return this.localUserReaction === -1;
    }
}