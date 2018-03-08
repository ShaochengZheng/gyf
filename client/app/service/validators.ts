import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable()
export class FormValidator {

    /*String.prototype.trim=function(){
        return this.replace(/(^\s*)|(\s*$)/g,'');
    }*/

    // 允许为零
    static amountValidatorAllowZero(control: FormControl): { [s: string]: boolean } {
        if (control.value && control.value < 0) {
            return { invalidAmount: true };
        }
    }

    static amountValidator(control: FormControl): { [s: string]: boolean } {
        if (control.value && control.value <= 0) {
            return { invalidAmount: true };
        }
    }
    static phoneOrEmailValidator(control: FormControl): { [s: string]: boolean } {
        let regPhone = /^1\d{10}$/;
        let regEmail = /^\S+@\S+\.\S+$/;
        /*control.value = trimstring;*/
        if (control.value !== null) {
            if (!(control.value.match(regPhone) || control.value.match(regEmail))) {
                return { invalidPhoneOrEamil: true };
            }
        }
    }
    static phoneValidator(control: FormControl): { [s: string]: boolean } {
        let regPhone = /^1\d{10}$/;
        if (control.value && !control.value.trim().match(regPhone)) {
            return { invalidPhone: true };
        }
    }
    static emailValidator(control: FormControl): { [s: string]: boolean } {
        let regEmail = /^\S+@\S+\.\S+$/;
        /*control.value = trimstring;*/
        if (control.value && !control.value.match(regEmail)) {
            return { invalidEmail: true };
        }
    }
    static hasLetterValidator(control: FormControl): { [s: string]: boolean } {
        let letter = new RegExp('[A-Za-z]');
        if (!letter.test(control.value)) {
            return { noLetter: true };
        }
    }
    static hasNumberValidator(control: FormControl): { [s: string]: boolean } {
        let numericRegEx = new RegExp('[0-9]');
        if (!numericRegEx.test(control.value)) {
            return { noNumber: true };
        }
    }
    static onlyPositiveValidator(control: FormControl): { [s: string]: boolean } {
        let positiveRegEx = new RegExp('^[0-9][0-9]*$');
        if (!positiveRegEx.test(control.value)) {
            return { ispositive: true };
        }

    }
    static shortValidator(control: FormControl): { [s: string]: boolean } {
        if (control.value.length < 8 || control.value.length > 64) {
            return { short: true };
        }
    }
    static illegalCharValidator(control: FormControl): { [s: string]: boolean } {
        let legalChar = /^[A-Za-z0-9_\d$@!%*#?&]+$/;
        if (!control.value.match(legalChar)) {
            return { illegalChar: true };
        }
    }
    static selectRequireValidator(control: FormControl) {
        if (!Array.isArray(control.value) || control.value.length === 0) {
            return { required: true };
        }
    }
    static matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
        return (group: FormGroup): { [key: string]: any } => {
            let password = group.controls[passwordKey];
            let confirmPassword = group.controls[confirmPasswordKey];
            if (password.value !== confirmPassword.value) {
                return {
                    unsamePassword: true
                };
            }
        };
    }
    static invalidDateFormat(control: FormControl): { [s: string]: boolean } {
        let datePattern = /^(\d{4})-(0\d{1}|1[0-2])-(0\d{1}|[12]\d{1}|3[01])$/;
        if (control.value != null) {
            if (!(control.value.toString().match(datePattern))) {
                return { invalidDateFormat: true };
            }
        }
    }
}
