// <reference path="../../../typings/tsd.d.ts" />

import {UtilService} from '../rest/util';
import {RequestService} from '../rest/request';
import {RequestTrackingService} from '../requests/request-tracking-svc';

export class TaskListController {
    private list: Array<any>;
    private timer;
    private pageNo = 1;
    private pageSize = 20;
    private totalPages = 1;
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$location',
        '$log',
        '$q',
        'RequestService',
        'RequestTrackingService'
    ];
    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private $q: ng.IQService,
        private requestSvc: RequestService,
        private requestTrackingSvc: RequestTrackingService) {
        this.timer = this.$interval(() => this.refresh(), 5000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.refresh();
    }

    public refresh() {
        this.requestSvc.getList(this.pageNo,this.pageSize).then((data :any) => {
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

    public loadData(tasks: Array<any>) {
        var list = [];
        _.each(tasks, (task) => {
            if (task.parentid === '00000000-0000-0000-0000-000000000000') {
                var lastStatus = _.last<any>(task.statuslist);
                if (lastStatus) {
                    task.statusMsg = lastStatus.Message;
                    task.timestamp = lastStatus.Timestamp;
                }
                if ((!task.completed) && task.subtasks.length > 0) {
                    this.requestSvc.get(task.subtasks[0]).then((subtask) => {
                        var lastStatus = _.last<any>(subtask.statuslist);
                        if (lastStatus) {
                            task.statusMsg = lastStatus.Message;
                            task.timestamp = lastStatus.Timestamp;
                        }
                    });
                }
                list.push(task)
            }
        });
        this.list = list.reverse();
    }

    public viewDetails(taskId) {
        this.$location.path('/tasks/' + taskId);
    }
}
