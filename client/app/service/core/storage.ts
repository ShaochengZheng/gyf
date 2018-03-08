import { Injectable } from '@angular/core';
import { CookieService }  from 'ngx-cookie';

@Injectable()
export class StorageService {

    constructor(
        private cookieService: CookieService
    ) { };

    setToken(oauthToken: any) {
        let expiresDate = new Date();
        expiresDate.setDate(expiresDate.getDate() + 1);
        if (oauthToken) {
            let options = { expires: expiresDate };
            this.setCookie('OAUTH_TOKEN', oauthToken, options);
        } else {
            this.removeCookie('OAUTH_TOKEN');
        }
    }



    getToken(key?: string) {
        if (!key) {
            key = 'OAUTH_TOKEN';
        }
        let token = this.getCookie(key);
        return token;
    }

    setStringTokenPair(key: string, value: any) {
        this.cookieService.put(key, value);
    }

    getStringToken(key: string) {
        let cookieData = this.cookieService.get(key);
        return cookieData;
    }

    private setCookie(key: string, value: Object, options?: any) {
        let cookieValue = JSON.stringify(value);
        options ? this.cookieService.put(key, cookieValue, options) :
          this.cookieService.put(key, cookieValue);
    }

    private removeCookie(key: string) {
        this.cookieService.remove(key);
    }

    private getCookie(key: string) {
        let cookieData = this.cookieService.get(key);
        /*jshint eqnull:true */
        if (cookieData != null) {
            return JSON.parse(cookieData);
        } else {
            return null;
        }
    }
}
