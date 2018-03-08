import { Injectable, PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'absolute' })
@Injectable()
export class AbsolutePipe implements PipeTransform {
    transform(value: any): number {
        return Math.abs(value);
    }
}
