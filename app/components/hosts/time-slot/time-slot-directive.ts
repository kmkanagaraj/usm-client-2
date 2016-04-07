/// <reference path="../../../../typings/tsd.d.ts" />

/*
 * @ngdoc directive
 * @name time:timeSlot
 * @scope
 * @restrict E
 *
 * @description
 * An AngularJS directive for showing the time slot.
 *
 * @example
 * <time-slot perform-action="changeTimeSlotForUtilization(time)"></time-slot>
 *
*/

import {TimeSlotController} from './time-slot';

export class TimeSlot implements ng.IDirective {
    restrict: string = "E";
    scope = {
        performAction: '&'
    };
    controllerAs: string = 'timeslot';
    bindToController: boolean = true;
    controller = TimeSlotController;
    template = '<span class="add-cursor-pointer" data-animation="am-flip-x" data-template="views/hosts/time-slot/time-slot.html" bs-dropdown="ellipsis">{{timeslot.duration.selectedTimeSlot.name}}<b class="caret"></b></span>';
}
