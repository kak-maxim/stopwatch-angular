import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StopwatchComponent } from './stopwatch.component';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [
    StopwatchComponent
  ],
  imports: [
    MatButtonModule,
    CommonModule,
  ]
})
export class StopwatchModule { }
