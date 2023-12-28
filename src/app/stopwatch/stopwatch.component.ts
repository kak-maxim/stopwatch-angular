import { Component, OnInit, OnDestroy } from '@angular/core';
import { timer, BehaviorSubject, Subject } from 'rxjs';
import {
  takeUntil,
  map,
  withLatestFrom,
  exhaustMap,
  buffer,
  debounceTime,
  filter,
  tap,
} from 'rxjs/operators';

@Component({
  selector: 'app-stopwatch',
  templateUrl: './stopwatch.component.html',
  styleUrls: ['./stopwatch.component.scss'],
})
export class StopwatchComponent implements OnInit, OnDestroy {
  isRunning$ = new BehaviorSubject<boolean>(false);
  seconds$ = new BehaviorSubject<number>(0);
  private destroy$ = new Subject<void>();
  private toggleTimer$ = new Subject<boolean>();
  private onWait$ = new Subject<void>();

  ngOnInit(): void {
    this.initTimer();
    this.initWaitHandler();
  }

  private initWaitHandler(): void {
    this.onWait$
      .pipe(
        buffer(this.onWait$.pipe(debounceTime(300))),
        filter((clicks) => clicks.length === 2),
        tap(() => this.toggleTimer$.next(false)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public toggleTimer(): void {
    this.toggleTimer$.next(!this.isRunning$.value);
  }

  public onReset(): void {
    this.seconds$.next(0);
    this.toggleTimer$.next(false);
  }

  public onWaitClick(): void {
    this.onWait$.next();
  }

  private initTimer(): void {
    this.toggleTimer$
      .pipe(
        tap((isRunning) => this.isRunning$.next(isRunning)),
        withLatestFrom(this.seconds$),
        exhaustMap(([isRunning, lastTime]) =>
          isRunning
            ? timer(0, 1000).pipe(
                map((elapsedSeconds) => elapsedSeconds + lastTime),
                takeUntil(this.toggleTimer$.pipe(filter((run) => !run)))
              )
            : []
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
