// <reference path="../../../typings/tsd.d.ts" />

import {UtilService} from '../rest/util';
import {EventService} from '../rest/events';
import {RequestService} from '../rest/request';
import {RequestTrackingService} from '../requests/request-tracking-svc';

export class TaskDetailController {
    private list: Array<any>;
    private timer;
    private taskId: string;
    private task: any;
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$location',
        '$log',
        '$q',
        '$routeParams',
        'EventService',
        'RequestService',
        'RequestTrackingService'
    ];
    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private $q: ng.IQService,
        private routeParamsSvc: ng.route.IRouteParamsService,
        private eventSvc: EventService,
        private requestSvc: RequestService,
        private requestTrackingSvc: RequestTrackingService) {
        this.taskId = this.routeParamsSvc['taskId'];
        this.timer = this.$interval(() => this.refresh(), 5000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.refresh();
    }

    public refresh() {
        this.requestSvc.get(this.taskId).then(task => {
            this.task = task;
        });
    }
}
