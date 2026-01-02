import { trigger, state, style, transition, animate } from '@angular/animations';

export const fadeInOut = trigger('fadeInOut', [
  state('void', style({
    opacity: 0
  })),
  transition(':enter', [
    animate('300ms ease-in-out')
  ]),
]);
export const slideInLeftRight = trigger('slideInLeftRight', [
    state('start', style({ transform: 'translateX(0)' })),
    state('end', style({ transform: 'translateX(100%)' })),
    transition('start => end', [
      animate('500ms ease-in')
    ]),
    transition('end => start', [
      animate('500ms ease-out')
    ])
])
export const cardMove = trigger('cardMove', [
    transition(':enter', [
      style({ opacity: 1, transform: 'translate(-10px,-10px)' }),
      animate('500ms ease-out', style({ opacity: 1, transform: 'translate(0)' }))
    ]),
    /* transition(':leave', [
      animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
    ]) */
  ])
  export const hightChange =  trigger('hightChange', [
    transition(':enter, :leave', [
      style({ height: '*', opacity: 1 }),
      animate('300ms ease-out', style({ height: 0, opacity: 1 })),
      animate('300ms ease-in', style({ height: '*', opacity: 1 }))
    ])
  ])
