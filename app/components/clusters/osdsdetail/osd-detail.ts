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
    private groupBy: string;

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
        this.groupBy = "options1['node']";
        this.selection = { activeOsd: {} ,allSelectedOsds: {} };
        this.filterBy = { osdStatus: {} ,utilization: {}, active: 'osd_status' };
        this.utils = { keys: Object.keys, numeral: numeral};
        this.filterList = {};
        this.filterList.OSDStatus = [
            {name: "Up-In", icon: "pficon pficon-ok", enable: false},
            {name: "Up-Out", icon: "pficon pficon-warning-triangle-o", enable: false},
            {name: "Down-In", icon: "pficon pficon-warning-triangle-o", enable: false},
            {name: "Down", icon: "fa fa-arrow-circle-o-down down-color", enable: false}
        ];
        this.filterList.PGStatus = [
            {name: "OK", subdata: [
                        {name: "Active"},
                        {name: "Clean"}
                    ]
            },
            {name: "Degraded", subdata: [
                        {name: "Creating"},
                        {name: "Replay"},
                        {name: "Splitting"},
                        {name: "Scrubbing"},
                        {name: "Degraded"},
                        {name: "Repair"},
                        {name: "Recovery"},
                        {name: "Backfill"},
                        {name: "Wait_Backfill"},
                        {name: "Remapped"}
                    ]
            },
            {name: "Needs Attention", subdata: [
                        {name: "Down"},
                        {name: "Inconsistent"},
                        {name: "Peering"},
                        {name: "Incomplete"},
                        {name: "Stale"}
                    ]
            }
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
            this.performGroupBy();
            this.openAccordion(this.osdListGroupBy[0].value);
        });
    }

    public resetFilterList() {
        _.forOwn(this.filterList, function(value, key) {
            _.each(value, (data: any) => {
                data.enable = false;
            });
        });
    }

    public performGroupBy() {
        this.osdListGroupBy = _.chain(this.osdList).groupBy(this.groupBy).pairs().map(function(currentItem) {
                                    return _.object(_.zip(["name", "value"], currentItem));
                                }).value();
    }

    public openAccordion(osdList) {
        if(osdList.length > 0) {
            this.selection.activeOsd = osdList[0];
            this.resetFilterList();
            (osdList || []).map( (osd) => {
                osd.usage.status = (osd.usage.percentused>=95? 0 :(osd.usage.percentused>=85? 1 :(osd.usage.percentused>=50? 2 : 3 )));
                if(!this.filterList.OSDStatus[osd.status].enable) {
                    this.filterList.OSDStatus[osd.status].enable = true;
                }
                if(!this.filterList.Utilization[osd.usage.status].enable) {
                    this.filterList.Utilization[osd.usage.status].enable = true;
                }
            });
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
        }
    }

    public noFilter(filterObj) {
        for (var key in filterObj) {
            if (filterObj[key]) {
                return false;
            }
        }
        return true;
    }

}
