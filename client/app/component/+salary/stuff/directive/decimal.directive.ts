import { Directive, ElementRef, Renderer } from '@angular/core';

@Directive({
  selector: '[gyp-decimal]',
  host: {
    '(blur)': 'handleChange()'
  }
})
export class DecimalDirective {
  constructor(private eleRef: ElementRef, private renderer: Renderer) {
    renderer.setElementStyle(eleRef.nativeElement, 'width', '120px');
  }

  /**
   * 监听blur事件
   */
  handleChange() {
    let val = this.eleRef.nativeElement.value;
    if (val) {
      console.log('handleChange->', Number(val).toFixed(2));
      console.log('handleChange parse->', parseFloat(Number(val).toFixed(2)));
      val = Number(val).toFixed(2);
    } else {
      val = 0.00;
    }
    console.log('handleChange -------------aaaaaaa', val);
    this.renderer.setElementProperty(this.eleRef.nativeElement, 'value', val);
  }
}
