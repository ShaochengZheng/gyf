import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-assets-tab',
  templateUrl: './assets-tab.component.html',
  styleUrls: ['./assets-tab.component.css']
})
export class AssetsTabComponent implements OnInit {
  isRecord: boolean = true;
  isEditFixed: boolean = false;
  isEditIntangible: boolean = false;
  id: any;
  constructor(private actRoute: ActivatedRoute) { }

  ngOnInit() {
    const type = this.actRoute.snapshot.params['type'];
    console.log('AssetsTabComponent=>' + type);

    if (type === 'Fixed' || type === 'Intangible') {
      this.isRecord = true;
      this.isEditFixed = false;
      this.isEditIntangible = false;
    } else if (type === 'EditFixed') {
      this.isRecord = false;
      this.isEditFixed = true;
      this.isEditIntangible = false;
    } else if (type === 'EditIntangible') {
      this.isRecord = false;
      this.isEditFixed = false;
      this.isEditIntangible = true;
    }
  }
}
