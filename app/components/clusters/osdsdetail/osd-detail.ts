// <reference path="../typings/tsd.d.ts" />

import {ClusterService} from '../../rest/clusters';
import {RequestService} from '../../rest/request';
import {RequestTrackingService} from '../../requests/request-tracking-svc';
import * as ModalHelpers from '../../modal/modal-helpers';
import {numeral} from '../../base/libs';

export class OsdDetailController {
    private id: any;
    private osdList: Array<any>;
    private osdListGroupBy: any;
    private filterList: any;
    private selection: any;
    private filterBy: any;
    private utils: any;
    private isLeftSidebarShow: boolean;
    private showAll: boolean;

    //Services that are used in this class.
    static $inject: Array<string> = [
        '$q',
        '$modal',
        '$scope',
        '$timeout',
        '$log',
        'ClusterService',
        'RequestService',
        'RequestTrackingService'
    ];

    constructor(private qService: ng.IQService,
        private $modal: any,
        private scopeService: ng.IScope,
        private timeoutService: ng.ITimeoutService,
        private logService: ng.ILogService,
        private clusterService: ClusterService,
        private requestSvc: RequestService,
        private requestTrackingSvc: RequestTrackingService) {

        this.isLeftSidebarShow = true;
        this.selection = { activeOsd: {} ,allSelectedOsds: {} };
        this.filterBy = { osdStatus: {} ,utilization: {}, active: 'osd_status' };
        this.utils = { keys: Object.keys, numeral: numeral};
        this.filterList = {};
        this.showAll = false;
        this.filterList.OSDStatus = [
            {name: "Up-In", icon: "pficon pficon-ok", enable: false},
            {name: "Up-Out", icon: "pficon pficon-warning-triangle-o", enable: false},
            {name: "Down-In", icon: "pficon pficon-warning-triangle-o", enable: false},
            {name: "Down", icon: "fa fa-arrow-circle-o-down down-color", enable: false}
        ];
        this.filterList.PGStatus = [
            {name: "active", enable: false},
            {name: "clean", enable: false},
            {name: "creating", enable: false},
            {name: "replay", enable: false},
            {name: "splitting", enable: false},
            {name: "scrubbing", enable: false},
            {name: "degraded", enable: false},
            {name: "undersized", enable: false},
            {name: "repair", enable: false},
            {name: "recovery", enable: false},
            {name: "backfill", enable: false},
            {name: "remapped", enable: false},
            {name: "down", enable: false},
            {name: "inconsistent", enable: false},
            {name: "peering", enable: false},
            {name: "incomplete", enable: false},
            {name: "stale", enable: false},
        ];
        this.filterList.Utilization = [
            {name: "Full (95% or more)", icon: "progress-bar-full", enable: false},
            {name: "Near Full (85% or more)", icon: "progress-bar-near-full", enable: false},
            {name: "50% - 85%", icon: "progress-bar-average", enable: false},
            {name: "Less than 50%", icon: "progress-bar-normal", enable: false}
        ];
        this.getOSDs();
    }

    public getOSDs() {
        this.clusterService.getSlus(this.id).then((slus: Array<any>) => {
            this.osdList = slus;
            (this.osdList || []).map( (osd) => {
                var pgArray = [];
                osd.usage.status = (osd.usage.percentused>=95? 0 :(osd.usage.percentused>=85? 1 :(osd.usage.percentused>=50? 2 : 3 )));
                if(!this.filterList.OSDStatus[osd.status].enable) {
                    this.filterList.OSDStatus[osd.status].enable = true;
                }
                if(!this.filterList.Utilization[osd.usage.status].enable) {
                    this.filterList.Utilization[osd.usage.status].enable = true;
                }
                Object.keys(osd.options1.pgsummary).forEach((element) => {
                    pgArray = pgArray.concat(element.split("+"));
                });
                osd.options1.pgsummary.pgarray = pgArray;  
            });
            this.selection.activeOsd = this.osdList[0];
            this.pgStatusFilterChange();
            this.performGroupBy('node');
        });
    }

    public performGroupBy(group_by) {
        if(group_by === 'node') {
            this.osdListGroupBy = _.groupBy(this.osdList, function(osd){ return osd.options1.node });
        }else {
            this.osdListGroupBy = _.groupBy(this.osdList, function(osd){ return osd.storageprofile });
        }
    }

    public osdActionChange(osdAction) {
        let actionObject = (osdAction==='mark_up'?{up:true}:(osdAction==='mark_in'?{in:true}:{in:false}));
        if(osdAction === 'mark_out') {
            var modal = ModalHelpers.OsdActionConfirmation(this.$modal, {}, 'Are you sure you want to move the selected OSDs out of the cluster?');
            modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide, confirmed: boolean) => {
                if (confirmed) {
                       this.performOsdAction(actionObject);
                }
                $hide();
            });
        }else {
            this.performOsdAction(actionObject);
        }
    }

    public performOsdAction(actionObject) {
        if(Object.keys(this.selection.allSelectedOsds).length === 0 ) {
            this.clusterService.slusAction(this.id,this.selection.activeOsd.sluid,actionObject).then((result) => {
                this.requestSvc.get(result.data.taskid).then((task) => {
                    this.requestTrackingSvc.add(task.id, task.name);
                });
            });
        }else {
            _.forOwn(this.selection.allSelectedOsds, (value, key) => {
                this.clusterService.slusAction(this.id,key,actionObject).then((result) => {
                    this.requestSvc.get(result.data.taskid).then((task) => {
                        this.requestTrackingSvc.add(task.id, task.name);
                    });
                });
            });
        }
        this.selection.allSelectedOsds= {};
        this.timeoutService(() => this.getOSDs(), 10000);
    }

    public filterSelectedOsd(selectedOSDs) {
        _.forOwn(selectedOSDs, function(value, key) {
            if (value === false) {
                delete selectedOSDs[key];
            }
        });
    }

    public applyFilter = (osd) => {
        if(this.filterBy.active === 'osd_status') {
            return this.filterBy.osdStatus[osd.status] || this.noFilter(this.filterBy.osdStatus);
        }else if(this.filterBy.active === 'utilization') {
            return this.filterBy.utilization[osd.usage.status] || this.noFilter(this.filterBy.utilization);
        }else if(this.filterBy.active === 'pg_status') {
            if(this.showAll) { return true; }
            var result = false;
            _.each(this.filterList.PGStatus, (element: any) => {
                if(element.enable){
                    if(osd.options1.pgsummary.pgarray.indexOf(element.name) === -1){
                        return false;
                    }else{
                        result = true;
                    }
                }
            });
            return result;
        }
    }

    public pgStatusFilterChange() {
        for(var index in this.filterList.PGStatus){
            if(this.filterList.PGStatus[index].enable){
                this.showAll = false;
                return;
            }
        }
        this.showAll = true;
    };

    public noFilter(filterObj) {
        for (var key in filterObj) {
            if (filterObj[key]) {
                return false;
            }
        }
        return true;
    }

}
