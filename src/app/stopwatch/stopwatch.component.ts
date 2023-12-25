import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, interval, Subject, timer } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-stopwatch',
  templateUrl: './stopwatch.component.html',
  styleUrls: ['./stopwatch.component.scss'],
  providers: [DatePipe]
})
  
export class StopwatchComponent implements OnInit {
  $isRunning = new BehaviorSubject<boolean>(false);
  private resetTimer = new Subject<void>();
  private waitEvent = new Subject<void>();
  private doubleClickTimer = timer(300);
  private doubleClicks = 0;
  time = '00:00:00';
  private startTime = new Date(0);

  constructor(private datePipe: DatePipe) {
  }

  ngOnInit() {
    interval(1000).pipe(
      tap(() => {
        if (this.$isRunning.value) {
          this.startTime.setSeconds(this.startTime.getSeconds() + 1);
          const transformedTime = this.datePipe.transform(this.startTime, 'HH:mm:ss', 'UTC');
          this.time = transformedTime ?? this.time;
        }
      }),
      takeUntil(this.resetTimer)
    ).subscribe();
  }

  startStop() {
    if (!this.$isRunning.value) {
      this.$isRunning.next(true);
    } else {
      this.$isRunning.next(false);
    }
  }

  wait() {
    this.doubleClicks++;
    this.doubleClickTimer.subscribe(() => {
      if (this.doubleClicks === 2) {
        this.$isRunning.next(false);
      }
      this.doubleClicks = 0;
    });
  }

  reset() {
    this.$isRunning.next(false);
    this.startTime = new Date(0);
    const transformedTime = this.datePipe.transform(this.startTime, 'HH:mm:ss', 'UTC');
    this.time = transformedTime ?? this.time;
    this.resetTimer.next();
  }
}