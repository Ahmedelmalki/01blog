import { Component, EventEmitter, Input, Output } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { Comment } from "../../models/post.models";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import { COMMENTS_IMPORTS } from "./comments.imports";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

@Component({
    selector: 'app-comments',
    standalone: true,
    imports: [COMMENTS_IMPORTS],
    templateUrl: './comments.component.html',
    styleUrl: './comments.component.css',
})
export class CommentsComponent {
    // definite assignment assertion.
    @Input() postId!: number;
    @Input() commentsCount: number = 0;
    @Input() commentRespons!: Comment;
    @Output() commentDeleted = new EventEmitter<number>();
    faComment = faComment;
    comments: Comment[] = [];
    newCommentContent = '';
    isExpanded = false;
    isLoading = false;
    isSubmitting = false;
    errorMessage: String | null = null;
    faTrash = faTrash;
    currentUsername: string = '';

    constructor(
        private http: HttpClient,
        private router: Router) {
        this.loadCurrentUsername();
    }

    // Extract username from JWT token
    private loadCurrentUsername() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.currentUsername = payload.sub || payload.username || '';
                console.log('Current username:', this.currentUsername);
            } catch (error) {
                console.error('Error parsing token:', error);
                this.currentUsername = '';
            }
        }
    }

    // Check if current user is the comment author
    isCurrentUserAuthor(comment: Comment): boolean {
        return comment.author.username === this.currentUsername;
    }

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
        const url = `/api/posts/${this.postId}/comments`;

        this.http.get<Comment[]>(url, { headers }).subscribe({
            next: (data) => {
                console.log('Comments loaded:', data);
                console.log('comment id', data[0]?.id);

                this.comments = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.log(err);
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
        this.http.post<Comment>('/api/comments', commentRequest, { headers }).subscribe({
            next: (newComment) => {
                console.log('comment created: ', newComment);
                this.comments.unshift(newComment);
                this.newCommentContent = '';
                this.isSubmitting = false;
            },
            error: (err) => {
                if (err.status === 400) {
                    this.errorMessage = err.error.message;
                } else {
                    this.errorMessage = "failed to post comment";
                }
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

    deleteComment(commentId: number) {
        if (!confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            this.router.navigate(['./login']);
            return;
        }

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
        });

        this.http.delete(`/api/comments/${commentId}`, { headers }).subscribe({
            next: () => {
                // Remove the comment from the local array
                this.comments = this.comments.filter(c => c.id !== commentId);
                this.commentsCount--;
                console.log('Comment deleted successfully');
            },
            error: (err) => {
                console.error('Error deleting comment:', err);
                this.errorMessage = 'Failed to delete comment.';
            }
        });
    }
}