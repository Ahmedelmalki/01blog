import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class FollowService {
    private followStatusMap = new Map<string, BehaviorSubject<boolean>>();
    constructor(private http: HttpClient) { }

    getFollowStatus$(username: string): Observable<boolean> {
        if (!this.followStatusMap.has(username)) {
            this.followStatusMap.set(username, new BehaviorSubject<boolean>(false));
        }
        return this.followStatusMap.get(username)!.asObservable();
    }

    updateFollowStatus(username: string, isFollowing: boolean): void {
        if (!this.followStatusMap.has(username)) {
            this.followStatusMap.set(username, new BehaviorSubject<boolean>(isFollowing));
        } else {
            this.followStatusMap.get(username)!.next(isFollowing);
        }
    }

    checkFollowStatus(username: string): Observable<{ following: boolean }> {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        const url = `http://localhost:8080/follow/status/${username}`;
        return this.http.get<{ following: boolean }>(url, { headers });
    }

    toggleFollow(username: string): Observable<{ following: boolean, message: string }> {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        const url = `http://localhost:8080/follow/${username}`;
        return this.http.post<{ following: boolean, message: string }>(url, {}, { headers });
    }
}