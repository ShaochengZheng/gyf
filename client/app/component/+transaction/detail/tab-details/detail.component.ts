import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'detail',
    templateUrl: 'detail.component.html',
    styleUrls: ['./detail.component.scss']
})

export class DetailComponent implements OnInit {
    record: boolean = false;
    editOutcome: boolean = false;
    editIncome: boolean = false;
    editaccountTransfers: boolean = false;
    constructor(private activatedRoute: ActivatedRoute, private router: Router) {
        this.router = router;
        if (router.events.subscribe) {
            router.events.debounceTime(500).distinctUntilChanged().subscribe(() => (this.setTBAPage()));
            // router.events.subscribe(() => (this.setTBAPage()));
        }
    }

    ngOnInit() {
        this.setTBAPage();
    }
    /**
     *
     * 设置TAB页
     *
     * @memberof DetailComponent
     */
    setTBAPage() {
        console.log('更新tab');

        const pathname = location.pathname.split('/');
        if (pathname[3] === 'detail') {
            const paths = pathname[4].split(';');
            const type = paths[0];
            console.warn(type);
            if (type === 'Outcome' || type === 'Income' || type === 'accountTransfers') {
                this.record = true;
                this.editIncome = false;
                this.editOutcome = false;
                this.editaccountTransfers = false;
            } else if (type === 'editOutcome') {
                this.editOutcome = true;
                this.record = false;
                this.editIncome = false;
                this.editaccountTransfers = false;
            } else if (type === 'editIncome') {
                this.editIncome = true;
                this.record = false;
                this.editOutcome = false;
                this.editaccountTransfers = false;

            } else if (type === 'editaccountTransfers') {
                this.editaccountTransfers = true;
                this.editIncome = false;
                this.record = false;
                this.editOutcome = false;
            } else {
                console.error('到哪里了');
            }

        } else {
            // console.log('');
        }

    }
}

