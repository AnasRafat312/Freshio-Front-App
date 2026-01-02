import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    public config = signal<any>({});

    constructor(private http: HttpClient) { }

    loadConfig() {
        return this.http.get('config.json').pipe(
            tap(config => {
                this.config.set(config);
            })
        );
    }

    get api() {
        return this.config;
    }
}
