import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { timer, BehaviorSubject, Subject, fromEvent } from 'rxjs';
import {
  takeUntil,
  map,
  withLatestFrom,
  filter,
  exhaustMap,
  debounceTime,
  buffer,
} from 'rxjs/operators';

@Component({
  selector: 'app-stopwatch',
  templateUrl: './stopwatch.component.html',
  styleUrls: ['./stopwatch.component.scss'],
})
export class StopwatchComponent implements OnInit, OnDestroy {

  isRunning$ = false;
  seconds$ = new BehaviorSubject<number>(0);
  private destroy$ = new Subject<void>();
  private waitClicks = 0;
  private lastClickTime = 0;
  private onStop$ = new Subject<void>();
  private onStart$ = new Subject<void>();


  constructor() {}

  ngOnInit(): void {
    this.initTimer();
  }

  public toggleTimer(): void {
    if (this.isRunning$) {
      this.onStop$.next();
    } else {
      this.onStart$.next();
    }
    this.isRunning$ = !this.isRunning$;
  }

  public onReset(): void {
    this.onStop$.next();
    this.seconds$.next(0);
    this.isRunning$ = false;
  }

  public onWaitClick(): void {
    const now = Date.now();
    if (now - this.lastClickTime < 300) {
      this.waitClicks++;
      if (this.waitClicks === 2) {
        this.onStop$.next();
        this.isRunning$ = !this.isRunning$;
        this.waitClicks = 0;
      }
    } else {
      this.waitClicks = 1;
    }
    this.lastClickTime = now;
  }

  private initTimer(): void {
    this.onStart$
      .pipe(
        withLatestFrom(this.seconds$),
        exhaustMap(([, lastTime]) =>
          timer(0, 1000).pipe(
            map((elapsedSeconds) => elapsedSeconds + lastTime),
            takeUntil(this.onStop$)
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((updatedSeconds) => this.seconds$.next(updatedSeconds));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
