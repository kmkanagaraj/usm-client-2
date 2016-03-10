// <reference path="../typings/tsd.d.ts" />

import {ClusterService} from '../../rest/clusters';
import {RequestService} from '../../rest/request';
import {RequestTrackingService} from '../../requests/request-tracking-svc';
import * as ModalHelpers from '../../modal/modal-helpers';

export class OsdDetailController {
    private id: any;
    private osdList: Array<any>;
    private isUtilizationShow: boolean;
    private showValueForOsd: string;
    private filterList: any;
    private selection: any;
    private filter: any;
    private utils: any;
    private isLeftSidebarShow; boolean;
    private osdAction: string;

    //Services that are used in this class.
    static $inject: Array<string> = [
        '$q',
        '$modal',
        '$scope',
        '$timeout',
        '$log',
        '$routeParams',
        'ClusterService',
        'RequestService',
        'RequestTrackingService'
    ];

    constructor(private qService: ng.IQService,
        private $modal: any,
        private scopeService: ng.IScope,
        private timeoutService: ng.ITimeoutService,
        private logService: ng.ILogService,
        private routeParamsSvc: ng.route.IRouteParamsService,
        private clusterService: ClusterService,
        private requestSvc: RequestService,
        private requestTrackingSvc: RequestTrackingService) {

        this.id = this.routeParamsSvc['id'];
        this.isLeftSidebarShow = true;
        this.selection = { activeOsd: {} ,allSelectedOsds: {} };
        this.filter = {};
        this.utils = { keys : Object.keys };
        this.isUtilizationShow = true;
        this.showValueForOsd = "utilization";
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
            {name: "Needs attension", subdata: [
                        {name: "Down"},
                        {name: "Inconsistent"},
                        {name: "Peering"},
                        {name: "Incomplete"},
                        {name: "Stale"}
                    ]
            }
        ];
        this.filterList.Utilization = [
            {name: "Full (95% or more)"},
            {name: "Near Full (85% or more)"},
            {name: "50% - 85%"},
            {name: "Less than 50%"}
        ];
        this.getOSDs();
    }

    public getOSDs() {
        this.clusterService.getSlus(this.id).then((slus: Array<any>) => {
            this.osdList = slus;
            (this.osdList || []).map( (osd) => {
                if(!this.filterList.OSDStatus[osd.status].enable)
                 this.filterList.OSDStatus[osd.status].enable = true;
            });
            if(this.osdList.length > 0) {
                this.selection.activeOsd = this.osdList[0];
            }
        });
    }

    public osdActionChange() {
        if(this.osdAction !== 'action') {
            var modal = ModalHelpers.ActionConfirmation(this.$modal, {});
            modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide, confirmed: boolean) => {
                if (confirmed) {
                    if(this.utils.keys(this.selection.allSelectedOsds).length === 0 ) {
                    this.clusterService.slusAction(this.id,this.selection.activeOsd.sluid,this.osdAction).then((result) => {
                        this.requestSvc.get(result.data.taskid).then((task) => {
                            this.requestTrackingSvc.add(task.id, task.name);
                        });
                    });
                    }else {
                        _.forOwn(this.selection.allSelectedOsds, (value, key) => {
                            this.clusterService.slusAction(this.id,key,this.osdAction).then((result) => {
                                this.requestSvc.get(result.data.taskid).then((task) => {
                                    this.requestTrackingSvc.add(task.id, task.name);
                                });
                            });
                        });
                    }
                    this.selection.allSelectedOsds= {};
                    this.osdAction = 'action';
                    this.timeoutService(() => this.getOSDs(), 10000);          
                }
                $hide();
            });
        }
    }

    public filterSelectedOsd(selectedOSDs) {
        _.forOwn(selectedOSDs, function(value, key) {
            if (value === false) {
                delete selectedOSDs[key];
            }
        });
    }

    public applyFilter =  (osd) => {
        return this.filter[osd.status] || this.noFilter(this.filter);
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
