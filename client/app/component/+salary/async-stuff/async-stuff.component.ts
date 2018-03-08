import { STORAGE_KEY } from './../shared/constant';
import { Component, ViewChild, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { SalaryService } from './../shared/salary.service';

@Component({
  selector: 'async-stuff',
  templateUrl: './async-stuff.component.html',
  styleUrls: ['./async-stuff.component.scss']
})
/**
 * 用作工资表，员工同步
 */
export class AsyncStuffComponent implements OnInit {

  @ViewChild('modal') modal;
  @Output() done = new EventEmitter();
  // 未出现在工资表的员工

  year: string;
  month: string;
  contactType: string;
  stuffList: Array<any> = [];
  // 选择框状态
  triggered: boolean = false;

  importCacheList: Array<any> = [];

  constructor(private salaryService: SalaryService) {

  }

  ngOnInit() {

  }
  /**
   * 
   * @param year 会计年
   * @param month 会计月
   * @param contactType 工资类型
   */
  searchStuff(year, month, contactType) {
    this.salaryService.getImportStuffForSalary(this.year, this.month, this.contactType)
      .then(data => {
        let temp = data;
        let cache = this.salaryService.getCacheStuff(STORAGE_KEY.STUFF);
        if (cache) {
          temp = this.salaryService.duplingCheck(cache, temp);
          console.log('searchStuff=>', temp);
        }
        this.stuffList = temp;
      }).catch(error => {
        console.log(error);
      });
  }
  /**
   * 
   * @param year 会计年
   * @param month 会计月
   * @param contactType 工资类型
   */
  show(year, month, contactType) {
    this.year = year;
    this.month = month;
    this.contactType = contactType;
    let importCache = this.salaryService.getCacheStuff(STORAGE_KEY.STUFF_IMPORT);
    if (importCache) { // 如果调用过API 并导入过 就拿缓存的数据
      let stuffCache = this.salaryService.getCacheStuff(STORAGE_KEY.STUFF);
      this.stuffList = this.salaryService.duplingCheck(importCache, stuffCache);
    } else {  // 请求API 获取数据
      this.searchStuff(year, month, contactType);
    }

    this.modal.show();
  }
  /**
   * 全选
   */
  triggerItem(i) {
    console.log(i, this.triggered);
    if (i === undefined || i === null) { // 全选
      // this.salaryService.selectAll(this.stuffList);
      this.triggered = !this.triggered;
      this.stuffList = this.salaryService.selectAll(this.triggered, this.stuffList);
    } else { // 单选
      this.stuffList = this.salaryService.selectOne(this.stuffList, i);
    }
  }

  /**
   * 获取选中的数据
   */
  getSelected() {
    let templist = [];
    this.stuffList.forEach(e => {
      if (e.selected) {
        e.selected = !e.selected;
        templist.push(e);
      } else {
        this.importCacheList.push(e);
      }
    });
    return templist;
  }

  /**
   * 导入
   */
  import() {
    // this.donedone();
    let selectList = this.getSelected();
    // this.salaryService.cacheStuff(selectList);
    this.salaryService.cacheImport(this.importCacheList);
    this.done.emit(selectList);
    this.close();
  }
  /**
   * 关闭
   */
  close() {
    this.triggered = false; // 默认不全选
    this.importCacheList = [];
    this.modal.hide();
  }
}
