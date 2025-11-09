import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class DarkModeService{
    private darkModeSubject = new BehaviorSubject<boolean>(this.getInitialMode());
    darkMode$ = this.darkModeSubject.asObservable();

    constructor(){
        this.applyDarkMode(this.darkModeSubject.value);
    }

    private getInitialMode(): boolean {
        const saved = localStorage.getItem('darkMode');
        console.log('saved ==>', saved);
        return saved ? JSON.parse(saved): false;
    }

    toggleDarkMode(){
        const newMode = !this.darkModeSubject.value;
        this.darkModeSubject.next(newMode);
        localStorage.setItem('darkMode', JSON.stringify(newMode));
        this.applyDarkMode(newMode);
    }

    private applyDarkMode(isDark: boolean){
        if (isDark){
            document.body.classList.add('dark-mode');
        }else{
            document.body.classList.remove('dark-mode');
        }
    }
}