import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'calculator',
	templateUrl: './calculator.html',
	styleUrls: ['./calculator.scss'],
})

export class CalculatorComponent implements OnInit {
	@Input() display: boolean = false;
	history = [];
	// 计算时用的数字的栈
	num = [];
	// 接受输入用的运算符栈
	opt = [];
	// 计算器计算结果
	result = '0';
	@Output() outputResult = new EventEmitter<string>();
	@Output() displayResult = new EventEmitter<boolean>();
	// 表示是否要重新开始显示,为true表示不重新显示，false表示要清空当前输出重新显示数字
	flag = true;
	// 表示当前是否可以再输入运算符，如果可以为true，否则为false
	isOpt = true;
	data = [
		['AC', '+/-', '%', '÷'],
		['7', '8', '9', '×'],
		['4', '5', '6', '-'],
		['1', '2', '3', '+'],
		['0', '.', '=']
	];
	public ngOnInit() {
		this.num = [];
		this.opt = [];
		this.history = [];
		this.flag = true;
		this.isOpt = true;
		this.result = '0';

	}
	addListen() {
		let self = this;
		window.addEventListener('keydown', function (event) {
			let key;
			key = event.key;
			if (key === '*') {
				self.showResult('×');
				return;
			} else if (key === '/' || key === '／') {
				self.showResult('÷');
				return;
			} else if (key === 'Enter') {
				self.showResult('=');
				return;
			} else if (key === 'Backspace') {
				self.ngOnInit();
			} else {
				self.showResult(key);
			}
		});
	}
	showClass(index, a) {
		if (a === '0') {
			return 'zero';
		}
		if (a === '÷' || a === '×' || a === '-' || a === '+' || a === '=') {
			return 'end-no';
		} else {
			return 'normal';
		}
		// return index === 3 || a === '=' ? 'end-no' : 'normal';
	}
	showResult(a) {
		console.log(a);
		this.history.push(a);
		let reg = /\d/ig, regDot = /\./ig, regAbs = /\//ig;
		if (reg.test(a)) {
			// 消除冻结
			if (this.isOpt === false) {
				this.isOpt = true;
			}

			if (this.result !== '0' && this.flag && this.result !== 'error') {
				this.result += a;
			} else {
				this.result = a;
				this.flag = true;
			}
		} else if (a === 'AC') {
			this.result = '0';
			this.ngOnInit();
		} else if (a === '.') {
			let calculateResult = Number(this.result);
			if (this.result !== '' && !regDot.test(this.result)) {
				calculateResult += a;
				this.result = calculateResult.toString();
			};
		} else if (regAbs.test(a)) {
			if (Number(this.result) > 0) {
				this.result = '-' + this.result;
			} else {
				this.result = Math.abs(Number(this.result)).toString();
			}
		} else if (a === '%') {
			this.result = this.format(Number(this.result) / 100);

		} else if (this.checkOperator(a) && this.result !== '' && this.result !== 'error' && this.isOpt) {
			this.flag = false;
			this.num.push(this.result);
			this.operation(a);
			// 点击一次运算符之后需要将再次点击运算符的情况忽略掉
			this.isOpt = false;
		} else if (a === '=' && this.result !== '' && this.result !== 'error') {
			this.flag = false;
			this.num.push(this.result);
			while (this.opt.length !== 0) {
				let operator = this.opt.pop();
				let right = this.num.pop();
				let left = this.num.pop();
				this.calculate(left, operator, right);
			}
		}
		this.outputResult.emit(this.result);
	}

	format(num) {
		let regNum = /.{10,}/ig;
		if (regNum.test(num)) {
			if (/\./.test(num)) {
				return num.toExponential(3);
			} else {
				return num.toExponential();
			}
		} else {
			return num;
		}
	}

	operation(current) {
		if (!this.opt.length) {
			this.opt.push(current);
			return;
		}
		let operator, right, left;
		let lastOpt = this.opt[this.opt.length - 1];
		// 如果当前运算符优先级大于last运算符，仅进栈
		if (this.isPri(current, lastOpt)) {
			this.opt.push(current);
		} else {
			operator = this.opt.pop();
			right = this.num.pop();
			left = this.num.pop();
			this.calculate(left, operator, right);
			this.operation(current);
		}
	}

	calculate(left, operator, right) {
		switch (operator) {
			case '+':
				this.result = this.format(Number(left) + Number(right));
				this.num.push(this.result);
				this.outputResult.emit(this.result);
				break;
			case '-':
				this.result = this.format(Number(left) - Number(right));
				this.num.push(this.result);
				this.outputResult.emit(this.result);
				break;
			case '×':
				this.result = this.format(Number(left) * Number(right));
				this.num.push(this.result);
				this.outputResult.emit(this.result);
				break;
			case '÷':
				if (right === 0) {
					this.result = 'error';
					this.ngOnInit();
					this.outputResult.emit(this.result);
				} else {
					this.result = this.format(Number(left) / Number(right));
					this.num.push(this.result);
					this.outputResult.emit(this.result);
				}
				break;
			default: break;
		}
	}
	isPri(current, last) {
		if (current === last) {
			return false;
		} else {
			if (current === '×' || current === '÷') {
				if (last === '×' || last === '÷') {
					return false;
				} else {
					return true;
				}
			} else {
				return false;
			}
		}
	}
	checkOperator(opt) {
		if (opt === '+' || opt === '-' || opt === '×' || opt === '÷') {
			return true;
		}
		return false;
	}
	close() {
		this.display = false;
		this.ngOnInit();
		window.removeEventListener('keydown');
	}
	keyBoard(e) {
		console.log(e);
	}
}
