// <reference path="../../../typings/tsd.d.ts" />

import {UtilService} from '../rest/util';
import {EventService} from '../rest/events';
import {I18N} from '../base/i18n';

export class EventListController {
    private list: Array<any>;
    private timer;
    private pageNo: number = 1;
    private pageSize: number = 10;
    private totalPages: number = 1;
    private totalCount: number = 0;
    private fromDateTimeFilter: string;
    private toDateTimeFilter: string;
    private filterObject = {};
    private requestObject = {};
    private searchQuery: string;
    private searchEntity: string = "Description";
    private warningCount: number = 0;
    private criticalCount: number = 0;
    private errorMessage: string = "";
    private severity: string;
    private severityLevel = [];
    private alarmStatus = ["indeterminate",
        "critical",
        "major",
        "minor",
        "warning",
        "info"];
    private criticalEvents = [this.alarmStatus[1], this.alarmStatus[2]];
    private warningEvents = [this.alarmStatus[0], this.alarmStatus[3], this.alarmStatus[4]];
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$location',
        '$modal',
        'EventService',
        '$rootScope',
        'I18N'
    ];
    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $location: ng.ILocationService,
        private modalSvc,
        private eventSvc: EventService,
        $rootScope: ng.IRootScopeService,
        private i18n: I18N) {
        var queryParams = $location.search();
        if (Object.keys(queryParams).length > 0) {
            if (queryParams['searchmessage'] !== undefined) {
                this.searchQuery = queryParams['searchmessage'];
                this.searchEntity = "description";
            }
            else if (queryParams['nodename'] !== undefined) {
                this.searchQuery = queryParams['nodename'];
                this.searchEntity = "host";
            }
            else if (queryParams['clustername'] !== undefined) {
                this.searchQuery = queryParams['clustername'];
                this.searchEntity = "cluster";
            }
                this.applyFilter(this.searchEntity, this.searchQuery);
                this.applyFilter('severity', 'warning');
                this.applyFilter('severity', 'critical');
                this.severity = 'notok';
        }
        this.timer = this.$interval(() => this.refresh(), 5000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.refresh();
    }

    public refresh() {
        if (this.severity === 'critical') {
            this.severityLevel = this.criticalEvents;
        } else if (this.severity === 'warning') {
            this.severityLevel = this.warningEvents;
        } else if (this.severity === 'notok') {
            this.severityLevel = this.criticalEvents;
            this.severityLevel.concat(this.warningEvents);
        } else {
            this.severityLevel = [];
        }

        this.requestObject = {
            pageno: this.pageNo,
            pagesize: this.pageSize,
            fromdatetime: this.fromDateTimeFilter,
            todatetime: this.toDateTimeFilter,
            severity: this.severityLevel
        };
        if (this.searchEntity.toLowerCase() === 'cluster') {
            this.requestObject['clustername'] = this.searchQuery;
        } else if (this.searchEntity.toLowerCase() === 'host') {
            this.requestObject['nodename'] = this.searchQuery;
        } else if (this.searchEntity.toLowerCase() === 'description') {
            this.requestObject['searchmessage'] = this.searchQuery;
        }

        this.eventSvc.getList(this.requestObject).then((data: any) => {
            this.totalCount = data.totalcount;
            this.totalPages = Math.ceil(data.totalcount / this.pageSize);
            this.list = data.events;
        });
        this.requestObject['pageno'] = 1;
        this.requestObject['severity'] = this.criticalEvents;
        this.eventSvc.getList(this.requestObject).then((data: any) => {
            this.criticalCount = data.totalcount;
        });
        this.requestObject['severity'] = this.warningEvents;
        this.eventSvc.getList(this.requestObject).then((data: any) => {
            this.warningCount = data.totalcount;
        });
    }

    public paginate(pageNo) {
        if (pageNo < 1 || pageNo > this.totalPages)
            return;
        this.pageNo = pageNo;
        this.refresh();
    }

    public viewDetails(eventId) {
        this.$location.path('/events/' + eventId);
    }

    public resetFilters() {
        this.filterObject = {};
        this.fromDateTimeFilter = undefined;
        this.toDateTimeFilter = undefined;
        this.searchQuery = undefined;
        this.severity = undefined;
    }

    public applyFilter(key, value) {
        if (value.length === 0) {
            delete this.filterObject[key]
        }
        else {
            this.filterObject[key] = value;
        }
        this.refresh();
    }

    public clearFilter(key) {
        delete this.filterObject[key];
        this.fromDateTimeFilter = this.filterObject[this.i18n.N_("from")];
        this.toDateTimeFilter = this.filterObject[this.i18n.N_("to")];
        this.searchQuery = this.filterObject[this.searchEntity];
        this.severity = this.filterObject["severity"];
    }

    public setSearchEntity(entity) {
        this.searchQuery = "";
        this.searchEntity = entity;
        delete this.filterObject['cluster'];
        delete this.filterObject['host'];
        delete this.filterObject['description'];
    }

    public dismiss(eventId) {
        var modalInstance = this.modalSvc({
            templateUrl: 'views/events/event-dismiss.tpl.html',
            controllerAs: 'event',
            controller: ['EventService', 'growl', function(eventSvc: EventService, growl: any) {
                this.dismissMessage = "";
                this.errorMessage = "";
                this.dismiss = function() {
                    eventSvc.dismiss(eventId, this.dismissMessage).then(status => {
                        modalInstance.$scope.$hide();
                        growl.success("Event Dismissed");
                    }).catch(status => {
                        this.errorMessage = status.data;
                        growl.error(status.data);
                    });
                }
            }]
        });
    }

    public getLocalizedDateTime(timestamp) {
        return this.i18n.getDateTime(timestamp);
    }
}
