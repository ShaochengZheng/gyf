import 'jquery';
import 'jquery-ui/ui/widgets/datepicker';
import 'bootstrap-loader';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
