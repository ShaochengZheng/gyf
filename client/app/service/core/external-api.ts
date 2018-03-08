import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptionsArgs } from '@angular/http';
import { Config } from './config';


@Injectable()
export class ExternalApiService {
    private defaultHeaders: Headers = new Headers();
    constructor(private router: Router, private http: Http, private config: Config) {
    }

    public ocrBusinessLicense(model, extraHttpRequestParams?: any): Observable<Object> {
        const path = 'https://api.hanvon.com/rt/ws/v1/ocr/businesslicense/recg?'
            + 'key=1864a024-12bf-46c9-9a94-e7b4c8d96144&code=392d0438-ebe1-4065-9a32-0fef34cbda56';

        let headerParams = this.defaultHeaders;
        headerParams.set('Content-Type', 'application/octet-stream');
        if (!model) {
            throw new Error('Missing required');
        }
        let requestOptions: RequestOptionsArgs = {
            method: 'POST',
            headers: headerParams,
        };
        requestOptions.body = model;
        return this.http.request(path, requestOptions)
            .map((response: Response) => response.json());
    }
    /*勿删 高原 2017年4月6日*/
    // changeListener($event): void {
    //     this.readThis($event.target);
    // }

    // readThis(inputValue: any): void {
    //     var file: File = inputValue.files[0];
    //     var myReader: FileReader = new FileReader();

    //     myReader.onloadend = (e) => {
    //         this.image = myReader.result;
    //     }
    //     myReader.readAsDataURL(file);
    // }
}
