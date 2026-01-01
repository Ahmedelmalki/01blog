import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FollowService } from "../../services/follow.service";
import { Subscription } from "rxjs";

@Component({
    selector: 'app-follow-button',
    standalone: true,
    templateUrl: './follow-button.component.html',
    styleUrl: './follow-button.component.css',
    imports: [CommonModule]
})
export class FollowButtonComponent implements OnInit, OnDestroy {
    @Input() username!: string;
    @Input() size: 'small' | 'medium' | 'large' = 'medium';
    @Output() followStatusChanged = new EventEmitter<boolean>();

    isFollowing: boolean = false;
    isLoading: boolean = false;
    currentUsername: string = '';
    private followSubscription?: Subscription;

    constructor(
        private followService: FollowService,
        private router: Router
    ) { }

    ngOnInit() {
        this.getCurrentUsername();
        if (this.username && this.username !== this.currentUsername) {
            this.followSubscription = this.followService.getFollowStatus$(this.username)
                .subscribe(isFollowing => {
                    this.isFollowing = isFollowing;
                });
            this.checkFollowStatus();
        }
    }

    ngOnDestroy() {
        if (this.followSubscription) {
            this.followSubscription.unsubscribe();
        }
    }

    private getCurrentUsername() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.currentUsername = payload.sub || '';
            } catch (e) {
                console.error('failed to decode token', e);
            }
        }
    }

    private checkFollowStatus() {
        const token = localStorage.getItem('token');
        if (!token) return;
        this.followService.checkFollowStatus(this.username).subscribe({
            next: (res) => {
                this.followService.updateFollowStatus(this.username, res.following);
            },
            error: (err) => {
                console.error('failed to check follow status:', err);
            }
        });
    }

    toggleFollow() {
        const token = localStorage.getItem('token');
        if (!token) {
            this.router.navigate(['/login']);
            return;
        }

        this.isLoading = true;

        this.followService.toggleFollow(this.username).subscribe({
            next: (res) => {
                this.followService.updateFollowStatus(this.username, res.following);
                this.isLoading = false;
                this.followStatusChanged.emit(res.following);
                console.log("toggle follow working", res.message);
            },
            error: (err) => {
                console.error('failed to toggle follow', err);
                this.isLoading = false;
                if (err.status === 401) {
                    localStorage.removeItem('token');
                    this.router.navigate(['/login']);
                }
            }
        });
    }

    shouldShowButton(): boolean {
        return this.username !== this.currentUsername && this.currentUsername !== '';
    }
}