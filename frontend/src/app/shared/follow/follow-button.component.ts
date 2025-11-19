import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
    selector: 'app-follow-button',
    standalone: true,
    templateUrl: './follow-button.component.html',
    styleUrl: './follow-button.component.css',
    imports: [CommonModule]
})
export class FollowButtonComponent implements OnInit {
    @Input() username!: string;
    @Input() size: 'small' | 'medium' | 'large' = 'medium';
    @Output() followStatusChanged = new EventEmitter<boolean>();

    isFollowing: boolean = false;
    isLoading: boolean = false;
    currentUsername: string = '';

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    ngOnInit() {
        this.getCurrentUsername();
        if (this.username && this.username !== this.currentUsername) {
            this.checkFollowStatus()
        }
    }

    private getCurrentUsername() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.currentUsername = payload.sub || '';
                // console.log("payload :", payload);
            } catch (e) {
                console.error('failed to decode token', e);
            }
        }
    }

    private checkFollowStatus() {
        const token = localStorage.getItem('token');
        if (!token) return;
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        this.http.get<{ following: boolean }>(
            `http://localhost:8080/follow/status/${this.username}`,
            { headers }
        ).subscribe({
            next: (res) => {
                this.isFollowing = res.following;
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

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        this.http.post<{ following: boolean, message: string }>(
            `http://localhost:8080/follow/${this.username}`,
            {},
            { headers }
        ).subscribe({
            next: (res) => {
                this.isFollowing = res.following;
                this.isLoading = false;
                console.log("toggle follow working i guess", res.message);
            },
            error: (err) =>{
                console.error('failed to toggle follow', err);
                this.isLoading = false;
                if(err.status === 401){
                    localStorage.removeItem('token');
                    this.router.navigate(['/login']);
                }
            }
        });
    }

    shouldShowButton(): boolean{
        return  this.username !== this.currentUsername && this.currentUsername !== '';
    }
}