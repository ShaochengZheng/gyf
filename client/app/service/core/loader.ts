import { Injectable } from '@angular/core';

export interface ILoader {
    isLoading: boolean;
}

@Injectable()
export class LoaderService {
    loader: ILoader = { isLoading: false };
    private _enable: boolean = true;

    constructor() {

    }

    enable(value: boolean) {
        this._enable = value;
    }

    show() {
        if (this._enable) {
            this.loader.isLoading = true;
        }
    }

    hide() {
        this.loader.isLoading = false;
    }

}
