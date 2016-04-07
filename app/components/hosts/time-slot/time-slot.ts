// <reference path="../typings/tsd.d.ts" />

export class TimeSlotController {
    private duration: any;

    //Services that are used in this class.
    static $inject: Array<string> = [];

    constructor() {
        this.duration = {
                timeSlots : [{ name: "Last 1 hour", value: "-1h" },
                         { name: "Last 2 hours", value: "-2h" },
                         { name: "Last 24 hours", value: "" }]
        };
        this.duration.selectedTimeSlot = this.duration.timeSlots[0];
    }

}
