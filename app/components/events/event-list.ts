// <reference path="../../../typings/tsd.d.ts" />

import {UtilService} from '../rest/util';
import {EventService} from '../rest/events';
import {RequestTrackingService} from '../requests/request-tracking-svc';

export class EventListController {
    private list: Array<any>;
    private timer;
    private pageNo = 1;
    private pageSize = 20;
    private totalPages = 1;
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$location',
        '$q',
        'EventService',
        'RequestService'
    ];
    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $location: ng.ILocationService,
        private $q: ng.IQService,
        private eventSvc: EventService) {
        this.timer = this.$interval(() => this.refresh(), 5000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.refresh();
    }

    public refresh() {
        this.eventSvc.getList(this.pageNo,this.pageSize).then((data :any) => {
            this.totalPages = Math.ceil(data.totalcount/this.pageSize);
            this.loadData(data.tasks);
        });
    }

    public paginate(pageNo) {
        if(pageNo<1 || pageNo > this.totalPages)
            return;
        this.pageNo = pageNo;
        this.refresh();
    }

    public loadData(events: Array<any>) {
        var list = [];
        _.each(events, (event) => {
            if (event.parentid === '00000000-0000-0000-0000-000000000000') {
                var lastStatus = _.last<any>(event.statuslist);
                if (lastStatus) {
                    event.statusMsg = lastStatus.Message;
                    event.timestamp = lastStatus.Timestamp;
                }
                list.push(event)
            }
        });
        this.list = list.reverse();
    }

    public viewDetails(eventId) {
        this.$location.path('/events/' + eventId);
    }
}
