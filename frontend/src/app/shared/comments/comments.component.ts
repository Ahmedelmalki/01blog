import { Component, Input, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { Comment } from "../../models/post.models";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import { COMMENTS_IMPORTS } from "./comments.imports";

@Component({
    selector: 'app-comments',
    standalone: true,
    imports: [COMMENTS_IMPORTS],
    templateUrl: './comments.component.html',
    styleUrl: './comments.component.css',
})
export class CommentsComponent implements OnInit {
    @Input() postId!: number;
    @Input() commentsCount: number = 0;
    faComment = faComment;
    comments: Comment[] = [];
    newCommentContent = '';
    isExpanded = false;
    isLoading = false;
    isSubmitting = false;
    errorMessage: String | null = null; // why null = null;

    constructor(private http: HttpClient, private router: Router) { }

    ngOnInit() { }

    toggleComments() {
        this.isExpanded = !this.isExpanded;
        if (this.isExpanded && this.comments.length === 0) {
            this.loadComments();
        }
    }

    loadComments() {
        this.isLoading = true;
        this.errorMessage = null;
        const token = localStorage.getItem('token');

        if (!token) {
            this.router.navigate(['./login']);
            return;
        }

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        // GET /posts/{postId}/comments
        this.http.get<Comment[]>(
            `http://localhost:8080/posts/${this.postId}/comments`,
            { headers }
        ).subscribe({ 
            next: (data) => {
                console.log('✅ Comments loaded:', data);
                this.comments = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('❌ Failed to load comments:', err);
                this.errorMessage = 'Failed to load comments.';
                this.isLoading = false;
            }
        });
    }

    submitComment() {
        if (!this.newCommentContent.trim()) {
            this.errorMessage = 'where is the comment!!';
            return;
        }
        this.isSubmitting = true;
        this.errorMessage = null;

        const token = localStorage.getItem('token');
        if (!token) {
            this.router.navigate(['./login']);
            return;
        }

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
        const commentRequest = {
            postId: this.postId,
            content: this.newCommentContent.trim(),
        };
        this.http.post<Comment>(
            'http://localhost:8080/comments',
            commentRequest,
            { headers }
        ).subscribe({
            next: (newComment) => {
                console.log('comment created: ', newComment);
                this.comments.unshift(newComment);
                this.newCommentContent = '';
                this.isSubmitting = false;
            },
            error: (err) => {
                console.log("big fat error", err);
                this.errorMessage = "failed to post comment";
                this.isSubmitting = false;
            }
        });
    }

    onKeyPress(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.submitComment();
        }
    }
}