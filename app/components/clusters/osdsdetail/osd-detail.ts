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
    private flags: any;
    private filteredOSD: any;

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

        this.filteredOSD = {};
        this.isLeftSidebarShow = true;
        this.selection = { activeOsd: {} ,allSelectedOsds: {} };
        this.filterBy = { osdStatus: {} ,utilization: {}, active: 'osd_status' };
        this.utils = { keys: Object.keys, numeral: numeral};
        this.filterList = {};
        this.flags = { showAll: false, activeOsdFlag: false };
        this.filterList.OSDStatus = [
            {name: "Up-In", icon: "pficon pficon-ok", enabled: false},
            {name: "Up-Out", icon: "pficon pficon-warning-triangle-o", enabled: false},
            {name: "Down-In", icon: "pficon pficon-warning-triangle-o", enabled: false},
            {name: "Down", icon: "fa fa-arrow-circle-o-down down-color", enabled: false}
        ];
        this.filterList.PGStatus = [
            {name: "active", enabled: false},
            {name: "clean", enabled: false},
            {name: "creating", enabled: false},
            {name: "replay", enabled: false},
            {name: "splitting", enabled: false},
            {name: "scrubbing", enabled: false},
            {name: "degraded", enabled: false},
            {name: "undersized", enabled: false},
            {name: "repair", enabled: false},
            {name: "recovery", enabled: false},
            {name: "backfill", enabled: false},
            {name: "remapped", enabled: false},
            {name: "down", enabled: false},
            {name: "inconsistent", enabled: false},
            {name: "peering", enabled: false},
            {name: "incomplete", enabled: false},
            {name: "stale", enabled: false},
        ];
        this.filterList.Utilization = [
            {name: "Full (95% or more)", icon: "progress-bar-full", enabled: false},
            {name: "Near Full (85% or more)", icon: "progress-bar-near-full", enabled: false},
            {name: "50% - 85%", icon: "progress-bar-average", enabled: false},
            {name: "Less than 50%", icon: "progress-bar-normal", enabled: false}
        ];
        this.getOSDs();
        /* Here , watching the filteredOSD(filtered osd list) variable for any changes .
        so that we can select first value as a selected OSD in UI . and if there is no
        any element inside array, than no osd will be selected in UI. */
        this.scopeService.$watch(() => { return this.filteredOSD; }, (newValue, oldValue) => {
            this.flags.activeOsdFlag = false;
            _.forOwn(this.filteredOSD, (value, key) => {
                if ( value.length > 0 && !this.flags.activeOsdFlag ) {
                    this.selection.activeOsd = value[0];
                    this.flags.activeOsdFlag = true;
                }
            });
        },true);
    }

    /* Getting OSD list here */
    public getOSDs() {
        this.clusterService.getSlus(this.id).then((slus: Array<any>) => {
            this.osdList = slus;
            (this.osdList || []).map( (osd) => {
                var pgArray = [];
                /* Adding the usage status for each osd , so that easily can find color code as well
                as filter for percentused in UI */
                osd.usage.status = (osd.usage.percentused>=95? 0 :(osd.usage.percentused>=85? 1 :(osd.usage.percentused>=50? 2 : 3 )));
                /* By default , we have disabled all filter . and Just here we are enabling the filters
                which are present in OSD list */
                if(!this.filterList.OSDStatus[osd.status].enabled) {
                    this.filterList.OSDStatus[osd.status].enabled = true;
                }
                if(!this.filterList.Utilization[osd.usage.status].enabled) {
                    this.filterList.Utilization[osd.usage.status].enabled = true;
                }
                /* we have pg summary in object format with '+' sign . example - "pgsummary":{"active+undersized+degraded":128} .
                Here , we want to each key after spliting with '+' sign , should be array elements
                so that easily can apply filter  */
                Object.keys(osd.options1.pgsummary).forEach((element) => {
                    pgArray = pgArray.concat(element.split("+"));
                });
                osd.options1.pgsummary.pgarray = pgArray;
                osd.node = osd.options1.node;
            });
            this.pgStatusFilterChange();
            this.performGroupBy('node');
        });
    }

    /* Performing Group by */
    public performGroupBy(group_by) {
        if(group_by === 'node') {
            this.osdListGroupBy = _.groupBy(this.osdList, function(osd){ return osd.options1.node });
        }else {
            this.osdListGroupBy = _.groupBy(this.osdList, function(osd){ return osd.storageprofile });
        }
    }

    /* Calling on osd action changed and performing actions on selected osds */
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

    /* Performing the Actions on selected osds */
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

    /* Removing the unselected OSD from OSDs list for Action.
    public filterSelectedOsd(selectedOSDs) {
        _.forOwn(selectedOSDs, function(value, key) {
            if (value === false) {
                delete selectedOSDs[key];
            }
        });
    }

    /* Applying filter on OSD list from the ng-repeat in UI. here we have 3 set of filters based on
    1)osd status 2)utilization 3) pg_status . and at a time only one set of filter can be applied .
    so that why here i have if condition to check the set of filter . */
    public applyFilter = (osd) => {
        if(this.filterBy.active === 'osd_status') {
            return this.filterBy.osdStatus[osd.status] || this.noFilter(this.filterBy.osdStatus);
        }else if(this.filterBy.active === 'utilization') {
            return this.filterBy.utilization[osd.usage.status] || this.noFilter(this.filterBy.utilization);
        }else if(this.filterBy.active === 'pg_status') {
            if(this.flags.showAll) { return true; }
            var result = false;
            _.each(this.filterList.PGStatus, (element: any) => {
                if(element.enabled){
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

    /* Just clearing the Filter here for pg status */
    public pgStatusFilterChange() {
        for(var index in this.filterList.PGStatus){
            if(this.filterList.PGStatus[index].enabled){
                this.flags.showAll = false;
                return;
            }
        }
        this.flags.showAll = true;
    };

    /* Just clearing the Filter here for osd status and utilization */
    public noFilter(filterObj) {
        for (var key in filterObj) {
            if (filterObj[key]) {
                return false;
            }
        }
        return true;
    }

}
