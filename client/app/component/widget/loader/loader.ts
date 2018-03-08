import { Component } from '@angular/core';
import { LoaderService, ILoader } from '../../../service/core/loader';

@Component({
    selector: 'loader',
    styleUrls: ['./loader.scss'],
    templateUrl: './loader.html'
})
export class LoaderWidget {
    loader: ILoader;
    // private isRunning: boolean = false;

    constructor(_load: LoaderService) {
        this.loader = _load.loader;
    }
}
