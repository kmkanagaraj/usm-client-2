// <reference path="../../../typings/tsd.d.ts" />

import {RequestService} from '../rest/request';
import {I18N} from '../base/i18n';

export class TaskDetailController {
    private list: Array<any>;
    private timer;
    private taskId: string;
    private detail: any;
    private subTasks: Array<any>;
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$routeParams',
        'RequestService',
        'I18N'
    ];
    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private routeParamsSvc: ng.route.IRouteParamsService,
        private requestSvc: RequestService,
        private i18n: I18N) {
        if(this.taskId === undefined){
            this.taskId = this.routeParamsSvc['taskId'];
        }
        this.timer = this.$interval(() => this.refresh(), 5000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.refresh();
    }

    public refresh() {
        this.requestSvc.get(this.taskId).then(task => {
            this.detail = task;
            if(task.completed == true){
                this.$interval.cancel(this.timer);
            }
            if(task.subtasks.length >0){
                this.requestSvc.getSubTasks(task.id).then(subtasks => {
                    this.subTasks = subtasks;
                });
            }
        });
    }

    public getLocalizedDateTime(timestamp) {
        return this.i18n.getDateTime(timestamp);
    }
}
