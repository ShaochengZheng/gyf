import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { TagApi } from '../../../api/accounting/api/TagApi';
declare var jQuery: any;
import * as _ from 'lodash';

@Component({
    selector: 'tag',
    templateUrl: 'tag.component.html',
    styleUrls: ['./tag.component.scss'],
    providers: [TagApi]

})

export class TagComponent implements OnInit, AfterViewInit {
    @Input() public addTagList: Array<any> = []; // 添加标签列表
    @Input() public recommendTagList: Array<any> = []; // 推荐标签列表
    @Input() public isAdd: any = true; // 推荐标签列表

    @Output() result: EventEmitter<any> = new EventEmitter();

    // 默认显示添加标签按钮
    addTagToggle: boolean = true;
    // 限制标签添加的数量
    tagNum = 0;
    // 保持输入的标签字符
    tag = '';

    // ---- tag start ------
    // public element: ElementRef;
    optTagFlag: boolean = true;
    optionsOpened: boolean = true;
    inputValue: string = ''; // 添加标签时输入框的值
    matchTagList = []; // 展示添加标签时，和输入框匹配的值
    // recommendTagList = []; // 显示已存在的标签
    tagSearchCondition = {
        start: 0,
        size: 10,
        lastRequest: false
    };


    constructor(private tagApi: TagApi) {}
    // ---- tag end --------

    ngOnInit(): any {
        if (this.addTagList === undefined || this.addTagList === null) {
            this.addTagList = [];
        }

        if (this.recommendTagList === undefined || this.recommendTagList === null) {
            this.recommendTagList = [];
        }
            // console.log(this.recommendTagList, this.addTagList);
        if (this.recommendTagList.length > 0) {
            // console.log('已有推荐标签');
        } else {
            this.tagSearch();
        }
        // console.error('tag=========================================================================>');
    }

    ngAfterViewInit() {
        setTimeout(() => {
            if (this.addTagList && this.recommendTagList) {
                // 当记录中存在标签且与推荐标签同名，则让推荐标签中同名的标签disabled
                _.forEach(this.addTagList, (item) => {
                    if (item.value) {
                        let index = this.recommendTagList.findIndex((value) => value.value === item.value);
                        if (index > -1) {
                            this.recommendTagList[index].disabled = true;
                        }
                    }
                });
            }
        }, 700);
    }

    // 是否是新增保存
    public isSaveNew() {
        this.tagSearch();
    }

    // 获取推荐标签
    tagSearch() {
        this.tagApi.tagSearch().subscribe(
            tagModel => {
                console.log(tagModel);
                console.log('==================================');
                this.recommendTagList = tagModel;
            },
            error => {
                console.error(error);
            }
        );
    }

    // 始化标签信息
    // initTagInfo() { 
    //     this.addTagToggle = true;
    //     this.optTagFlag = true;
    //     this.recommendTagList = null;
    //     this.addTagList = [{
    //         id: '',
    //         value: '',
    //         isDefault: null
    //     }];
    //     this.tagNum = 0;
    //     this.tag = '';
    //     this.tagSearchCondition = {
    //         start: 0,
    //         size: 10,
    //         lastRequest: false
    //     };
    // }

    // 添加标签
    addTag() {
        if (this.tagNum === 6) {
            return;
        }
        this.tag = '';
        this.matchTagList = [];
        this.addTagToggle = !this.addTagToggle;
        setTimeout(() => {
            jQuery('.inputTag').focus();
        }, 0);
    }

    // 在标签输入框中失去焦点时，显示标签
    tagBlur(flag) {
        this.optTagFlag = true;
        setTimeout(() => {
            this.addTagListPush();
        }, 220);
        if (!flag) {
            return;
        }
    }

    // 保存输入的标签
    addTagListPush() {
        // console.log(this.optTagFlag);
        if (this.optTagFlag) {
            this.tag = this.tag.trim(); // 除去标签字符串的空字符
            if (this.tag) {
                let addTagListObj = {
                    id: '',
                    value: '',
                    isDefault: null
                };
                // 首先判断输入的标签是否存在，不存在就添加进来
                if (!this.addTagList.find((value) => value.value === this.tag)) {
                    this.tag = this.tag.substring(0, 10);
                    if (!this.addTagList.find((value) => value.value === this.tag)) {
                        addTagListObj.value = this.tag;
                        this.addTagList.push(addTagListObj);
                    }
                }
                // 如果添加的标签在标签库中存在，就让标签库中存在的标签disabled
                if (this.recommendTagList && this.recommendTagList.find((value) => value.value === this.tag)) {
                    let tagListIndex = this.recommendTagList.findIndex((value) => value.value === this.tag);
                    this.recommendTagList[tagListIndex].disabled = true;
                }
            }
            if (this.addTagList) {
                this.tagNum = this.addTagList.length;
            }
            this.addTagToggle = !this.addTagToggle;
        } else {
            this.tag = '';
            this.matchTagList = [];
        }
        this.result.emit(this.addTagList);
    }

    // 删除标签
    delTag(item, index) {
        // let index = this.addTagList.findIndex((value) => value.value === item.value);
        // 删除该标签
        this.addTagList.splice(index, 1);
        // 如果删除的该标签在推荐标签中，就让其disabled值变为false
        if (this.recommendTagList && this.recommendTagList.find((value) => value.value === item.value)) {
            let tagListIndex = this.recommendTagList.findIndex((value) => value.value === item.value);
            this.recommendTagList[tagListIndex].disabled = false;
        }
        if (this.addTagList) {
            this.tagNum = this.addTagList.length;
        }
        this.result.emit(this.addTagList);
    }

    // 在输入框出现匹配时，点击选择的标签，进行标签添加
    chooseTag(item) {
        if (item) {
            this.optTagFlag = false;
            let addTagListObj = {
                id: '',
                value: '',
                isDefault: null
            };

            if (!this.addTagList.find((value) => value.value === item.value)) {
                addTagListObj.value = item.value;
                this.addTagList.push(addTagListObj);
            }
            this.addTagListPush();

            if (this.recommendTagList && this.recommendTagList.find((value) => value.value === item.value)) {
                let tagListIndex = this.recommendTagList.findIndex((value) => value.value === item.value);
                this.recommendTagList[tagListIndex].disabled = true;
            }

            this.addTagToggle = !this.addTagToggle;
        }
    }

    // 选择推荐标签
    recommendTag(item, index) {
        let addTagListObj = {
            id: '',
            value: '',
            isDefault: null
        };
        // 如果标签中的数量为5后，再点击推荐标签时，不让其添加
        if (this.addTagList.length === 5) {
            return;
        }
        addTagListObj.value = item.value;
        addTagListObj.id = item.id;
        this.addTagList.push(addTagListObj);
        this.recommendTagList[index].disabled = true;
        if (this.addTagList) {
            this.tagNum = this.addTagList.length;
        }
        this.result.emit(this.addTagList);
    }

    // 显示更多标签，一般情况下只显示10个，当标签多余10个时，点击显示更多按钮显示
    displayTag() {
        if (this.recommendTagList.length === 20) {
            this.tagSearchCondition.lastRequest = true;
        } else {
            this.tagSearchCondition.size = 20;
            this.tagSearchCondition.lastRequest = true;
        }
        if (this.tagSearchCondition.lastRequest && this.recommendTagList.length > 10) {
            this.tagSearchCondition.lastRequest = false;
            this.tagSearchCondition.size = 10;
        }
    }

    // TODO 下面的注释发布完成后还有要修改的 宏宇
    public inputEvent(e: any): void {
        // this.matchTagList = [];
        // this.jQueryel = jQuery(el.nativeElement);

        // backspace
        if (e.keyCode === 8) {
            // let el: any = this.element.nativeElement
            //     .querySelector('div.ui-select-container > input');
            // if (!el.value || el.value.length <= 0) {
            //     if (this.active.length > 0) {
            //         this.remove(this.active[this.active.length - 1]);
            //     }
            //     e.preventDefault();
            // }
        }

        // esc
        // if (e.keyCode === 27) {
        //     this.optionsOpened = false;
        //     e.preventDefault();
        //     return;
        // }
        // del
        // if (e.keyCode === 46) {
        //     if (this.active.length > 0) {
        //         this.remove(this.active[this.active.length - 1]);
        //     }
        //     e.preventDefault();
        // }
        // left
        if (e.keyCode === 37) {
            let liList = jQuery('#ulMatch li');
            if (liList) {
                for (let i = 0; i < liList.length; i++) {
                    if (jQuery(liList[i]).hasClass('hlight')) {
                        jQuery(liList[i]).removeClass('hlight');
                        i = 0;
                        jQuery(liList[i]).addClass('hlight');
                        this.tag = this.matchTagList[i].value;
                        return;
                    }
                }
            }
            e.preventDefault();
            return;
        }
        // right
        if (e.keyCode === 39) {
            let liList = jQuery('#ulMatch li');
            if (liList) {
                for (let i = 0; i < liList.length; i++) {
                    if (jQuery(liList[i]).hasClass('hlight')) {
                        jQuery(liList[i]).removeClass('hlight');
                        i = liList.length - 1;
                        jQuery(liList[i]).addClass('hlight');
                        this.tag = this.matchTagList[i].value;
                        return;
                    }
                }
            }
            e.preventDefault();
            return;
        }
        // up
        if (e.keyCode === 38) {
            let liList = jQuery('#ulMatch li');
            if (liList) {
                for (let i = 0; i < liList.length; i++) {
                    if (jQuery(liList[i]).hasClass('hlight')) {
                        jQuery(liList[i]).removeClass('hlight');
                        if (i === 0) {
                            i = liList.length - 1;
                            jQuery(liList[i]).addClass('hlight');
                            this.tag = this.matchTagList[i].value;
                        } else {
                            jQuery(liList[i - 1]).addClass('hlight');
                            this.tag = this.matchTagList[i - 1].value;
                        }
                        return;
                    }
                }
            }
            e.preventDefault();
            return;
        }
        // down
        if (e.keyCode === 40) {
            let liList = jQuery('#ulMatch li');
            if (liList) {
                for (let i = 0; i < liList.length; i++) {
                    if (jQuery(liList[i]).hasClass('hlight')) {
                        jQuery(liList[i]).removeClass('hlight');
                        if (i === liList.length - 1) {
                            i = 0;
                            jQuery(liList[i]).addClass('hlight');
                            this.tag = this.matchTagList[i].value;
                        } else {
                            jQuery(liList[i + 1]).addClass('hlight');
                            this.tag = this.matchTagList[i + 1].value;
                        }
                        return;
                    }
                }
            }
            e.preventDefault();
            return;
        }
        // enter
        if (e.keyCode === 13) {
            setTimeout(() => {
                jQuery('.inputTag').blur();
            }, 0);
            e.preventDefault();
            return;
        }
        let target = e.target || e.srcElement;
        if (e.srcElement && e.srcElement.value) {
            this.inputValue = target.value;
            this.matchTagList = [];
            _.forEach(this.recommendTagList, (item) => {
                let isMatch = item.value.match(this.inputValue);
                if (isMatch && this.matchTagList.length < this.recommendTagList.length) {
                    this.matchTagList.push(item);
                }
            });
        }
        if (this.matchTagList.length > 0) {
            setTimeout(() => {
                let el: any = jQuery('.tag-select-choices li:first');
                el.addClass('hlight');
            }, 0);
        }
    }
}
