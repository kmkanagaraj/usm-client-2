// <reference path="../typings/tsd.d.ts" />

import {ClusterHelper} from './cluster-helpers';
import {ClusterService} from '../rest/clusters';
import {ServerService} from '../rest/server';
import {StorageService} from '../rest/storage';
import {BlockDeviceService} from '../rest/blockdevice';
import {BlockDevice} from '../rest/blockdevice';
import {StorageSize} from '../shared/types/storage';
import * as ModalHelpers from '../modal/modal-helpers';
import {numeral} from '../base/libs';
import {RequestService} from '../rest/request';
import {RequestTrackingService} from '../requests/request-tracking-svc';

export class ClusterDetailController {
    private clusterHelpers: ClusterHelper;
    private clusterList: Array<any>;
    private cluster: any;
    private capacity: any;
    private id: any;
    private hosts: any;
    private pools: any;
    private pgs: any;
    private osds: any;
    private objects: any;
    private monitors: any;
    private tabList: Array<any>;
    private tabIndex: any;
    private discoveredHostsLength: any;
    private clusterUtilization: any;
    private openStackPools: any;
    private mostUsedPools: any;
    private utilizationByType: any;
    private utilizationByProfile: any;
    private memoryUtilization: any;
    private timeSlots: [{name:string, value:string}];
    private selectedTimeSlot: any;
    private timer: ng.IPromise<any>;
    private rbds = [];
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
        '$scope',
        '$location',
        '$interval',
        '$timeout',
        '$log',
        '$routeParams',
        '$modal',
        'ClusterService',
        'ServerService',
        'StorageService',
        'BlockDeviceService',
        'RequestService',
        'RequestTrackingService'
    ];

    constructor(private qService: ng.IQService,
        private scopeService: ng.IScope,
        private locationService: ng.ILocationService,
        private intervalSvc: ng.IIntervalService,
        private timeoutService: ng.ITimeoutService,
        private logService: ng.ILogService,
        private routeParamsSvc: ng.route.IRouteParamsService,
        private modalSvc,
        private clusterService: ClusterService,
        private serverService: ServerService,
        private storageService: StorageService,
        private blockDeviceSvc: BlockDeviceService,
        private requestSvc: RequestService,
        private requestTrackingSvc: RequestTrackingService) {

        this.clusterUtilization = { data: {}, config: {} };
        this.openStackPools = [];
        this.mostUsedPools = [];
        this.clusterList = [];
        this.tabList = [
            { tabName: "Overview" },{ tabName: "CRUSH map" },{ tabName: "Pools" },{ tabName: "RBDs" },
            { tabName: "OSDs" },{ tabName: "Storage Profiles" },{ tabName: "Configuration" }
        ];
        this.tabIndex = 0;
        this.clusterHelpers = new ClusterHelper(null, null, null, null);
        this.utilizationByType = {};
        this.utilizationByProfile = {};
        this.id = this.routeParamsSvc['id'];
        this.cluster = {};
        this.capacity = {};
        this.memoryUtilization = { title: "", data: {}, config: {} };
        this.hosts = { total: 0, warning: 0, critical: 0 };
        this.pgs = { total: 0, warning: 0, critical: 0 };
        this.osds = { total: 0, warning: 0, critical: 0 };
        this.objects = { total: 0, warning: 0, critical: 0 };
        this.pools = { total: 0, warning: 0, critical: 0 };
        this.monitors = { total: 0, warning: 0, critical: 0 };
        this.timeSlots = [{ name: "Last 1 hour", value: "-1h" },
                         { name: "Last 2 hours", value: "-2h" },
                         { name: "Last 24 weeks", value: "" }];
        this.selectedTimeSlot = this.timeSlots[0];
        this.isLeftSidebarShow = true;
        this.selection = { activeOsd: {} ,allSelectedOsds: {} };
        this.filter = {};
        this.utils = { keys : Object.keys };
        this.isUtilizationShow = true;
        this.showValueForOsd = "utilization";
        this.filterList = {};
        this.filterList.OSDStatus = [
            {name: "Up-In", icon: "pficon pficon-ok"},
            {name: "Up-Out", icon: "pficon pficon-warning-triangle-o"},
            {name: "Down-In", icon: "pficon pficon-warning-triangle-o"},
            {name: "Down", icon: "fa fa-arrow-circle-o-down down-color"}
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
        this.getUtilizationByType();
        this.getOpenStackPools();
        this.getMostUsedPools();
        this.serverService.getDiscoveredHosts().then((freeHosts) => {
            this.discoveredHostsLength = freeHosts.length;
        });
        this.clusterService.getList().then((clusters: Array<any>) => {
           this.clusterList = clusters;
        });
        this.clusterService.getClusterObjects(this.id).then((clusterObjects: Array<any>) => {
           this.objects.total = clusterObjects[0].datapoints[0][1];
        });
        this.storageService.getListByCluster(this.id).then((storages: Array<any>) => {
           this.pools.total = storages.length;
        });
        this.getMemoryUtilization(this.selectedTimeSlot);
        this.getOSDs();
        this.clusterService.get(this.id).then((cluster) => this.loadCluster(cluster));
        this.clusterService.getClusterUtilization(this.id).then((utilizations) => this.getClusterUtilization(utilizations));
        this.clusterService.getStorageProfileUtilization(this.id).then((utilizations) => this.getUtilizationByProfile(utilizations));
        this.serverService.getListByCluster(this.id).then((hosts) => this.getHostStatus(hosts));
        this.serverService.getList().then((nodes) => this.getMonitors(nodes));

        this.timer = this.intervalSvc(() => this.refreshRBDs(), 5000);
        this.scopeService.$on('$destroy', () => {
            this.intervalSvc.cancel(this.timer);
        });
        this.refreshRBDs();
    }

    public getMemoryUtilization(timeSlot: any) {
        this.clusterService.getClusterMemoryUtilization(this.id,timeSlot.value).then((memory_utilization) => {
            var times = [];
            var used = [];
            times.push("dates");
            used.push("used");
            var usageDataArray = memory_utilization[0].datapoints;
            for (var index in usageDataArray) {
              var subArray = usageDataArray[index];
              times.push(new Date(subArray[1]));
              used.push(Math.round(subArray[0]));
            }
            this.memoryUtilization = {
                title: "Memory utilization",
                data: {
                      dataAvailable: true,
                      total: 100,
                      xData: times,
                      yData: used
                },
                config: {
                    chartId      : 'memoryUtilization',
                    title        : 'Memory Utilization Trends',
                    layout       : 'inline',
                    valueType    : 'actual'
                }
            }
        });
    }

    public getOSDs = () => {
        this.clusterService.getSlus(this.id).then((slus: Array<any>) => {
            this.osdList = slus;
            this.osds.total = this.osdList.length;
            if(this.osdList.length > 0) {
                this.selection.activeOsd = this.osdList[0];
            }
        });
    }

    public getUtilizationByType() {
        this.utilizationByType.title = 'Utilization by storage type';
        this.utilizationByType.data = {
          'total': '100',
          'subdata' : [ { "used" : 45 , "color" : "#00558a" , "subtitle" : "Object" },
                        { "used" : 15 , "color" : "#0071a6" , "subtitle" : "Block" },
                        { "used" :  5 , "color" : "#00a8e1" , "subtitle" : "OpenStack" }]
        };
        this.utilizationByType.layout = {
          'type': 'multidata'
        };
    }

    public getUtilizationByProfile(utilizations: Array<any>) {
        this.utilizationByProfile.title = 'Utilization by storage profile';
        this.utilizationByProfile.layout = {
          'type': 'multidata'
        };
        var subdata = [];
        _.each(utilizations, (utilization: any) => {
            var label = utilization.target.split('.');
            var usedData  = utilization.datapoints[0][0];
            if( label[3] === 'usage_percent' ) {
                if ( label[2] === 'storage_profile_utilization_general') {
                    subdata.push({ "used" : usedData , "color" : "#00558a" , "subtitle" : "General" });
                }
                else if (label[2] === 'storage_profile_utilization_sas') {
                    subdata.push({ "used" : usedData , "color" : "#0071a6" , "subtitle" : "SAS" });
                }else if (label[2] === 'storage_profile_utilization_ssd') {
                    subdata.push({ "used" : usedData , "color" : "#00a8e1" , "subtitle" : "SSD" });
                }
            }
        });
        this.utilizationByProfile.data = {
          'total': '100',
          'subdata' : subdata
        };
    }

    public getOpenStackPools() {
        this.openStackPools.push({"title":"Cinder","units":"GB","data":{"used":"25","total":"100"}});
        this.openStackPools.push({"title":"Cinder-Backup","units":"GB","data":{"used":"75","total":"100"}});
        this.openStackPools.push({"title":"Glance","units":"GB","data":{"used":"86","total":"100"}});
        this.openStackPools.push({"title":"Nova","units":"GB","data":{"used":"30","total":"100"}});
    }

    public getMostUsedPools() {
        this.mostUsedPools.push({"title":"Pool1","units":"GB","data":{"used":"85","total":"100"}});
        this.mostUsedPools.push({"title":"Pool2","units":"GB","data":{"used":"75","total":"100"}});
        this.mostUsedPools.push({"title":"Pool3","units":"GB","data":{"used":"95","total":"100"}});
        this.mostUsedPools.push({"title":"Pool4","units":"GB","data":{"used":"30","total":"100"}});
    }

    public loadCluster(cluster: any) {
        this.cluster.name = cluster.name;
        this.cluster.type = this.clusterHelpers.getClusterType(cluster.cluster_type);
        this.cluster.status = cluster.status;
        this.cluster.enabled = cluster.enabled;
    }

    public getClusterUtilization(utilizations: Array<any>) {
        _.each(utilizations, (utilization: any) => {
            var label = utilization.target.split('.')[3];
            var data  = utilization.datapoints[0][0];
            var dataFormated = numeral(data).format('0 b');
            if ( label === 'total_bytes') {
                this.capacity.total = dataFormated;
                this.clusterUtilization.data.total = data;
            }
            else if (label === 'total_used_bytes') {
                this.capacity.used = dataFormated;
                this.clusterUtilization.data.used = data;
            }
        });
        this.clusterUtilization.config.chartId = "utilizationChart";
        this.clusterUtilization.config.units = "GB";
        this.clusterUtilization.config.thresholds = {'warning':'60','error':'90'};
        this.clusterUtilization.config.legend = {"show":false};
        this.clusterUtilization.config.tooltipFn = (d) => {
              return '<span class="donut-tooltip-pf"style="white-space: nowrap;">' +
                       numeral(d[0].value).format('0 b') + ' ' + d[0].name +
                     '</span>';
        };
        this.clusterUtilization.config.centerLabelFn = () => {
              return Math.round(100 * (this.clusterUtilization.data.used / this.clusterUtilization.data.total)) + "% Used";
        };
    }

    public getHostStatus(hosts: any) {
        this.hosts.total = hosts.length;
        var warning = 0, critical = 0;
        _.each(hosts, (host: any) => {
            if (host.node_status === 1) {
                critical++;
            }
        });
        this.hosts.critical = critical;
    }

    public getMonitors(nodes: any) {
        _.each(nodes, (node: any) => {
            if (node.clusterid === this.id && node.options1.mon === 'Y') {
                this.monitors.total++;
            }
        });
    }

    public setTab(newTab: any) {
        this.tabIndex = newTab;
    }

    public isSet(tabNum: any) {
        return this.tabIndex === tabNum;
    }

    public changeTimeSlot(time: any) {
        this.selectedTimeSlot = time;
        this.getMemoryUtilization(this.selectedTimeSlot);
    }

    public refreshRBDs() {
        this.blockDeviceSvc.getListByCluster(this.id).then(blockdevices => {
            this.loadRBDData(blockdevices);
        });
    }

    public loadRBDData(blockdevices: BlockDevice[]) {
        _.each(this.rbds, (blockdevice) => {
            blockdevice['updated'] = false;
        });
        _.each(blockdevices, (blockdevice: BlockDevice) => {
            var item = _.find(this.rbds, item => item.id === blockdevice.id);
            if (item) {
                item.size = blockdevice.size;
                item['updated'] = true;
            }
            else {
                blockdevice['updated'] = true;
                this.rbds.push(blockdevice);
            }
        });
        _.remove(this.rbds, blockdevice => !blockdevice['updated']);
    }

    public getFormatedSize(size: number): string {
        return numeral(size).format('0 b');
    }

    public createRBD() {
        this.locationService.path('/storage/new');
    }

    public showRBDResizeForm(rbd: BlockDevice) {
        rbd['resize'] = true;
        var sizeValue = rbd.size.substring(0, rbd.size.length - 2);
        var sizeUnit = rbd.size.substring(rbd.size.length - 2);
        var size = { value: parseInt(sizeValue), unit: sizeUnit };
        rbd['targetSize'] = size;
    }

    public updateRBDSize(rbd: BlockDevice, newSize: StorageSize) {
        rbd['targetSize'] = newSize;
    }

    public resizeRBD(rbd: BlockDevice) {
        var targetSize = rbd['targetSize'];
        var size = { size: targetSize.value + targetSize.unit };
        this.blockDeviceSvc.resize(rbd.clusterid, rbd.storageid, rbd.id, size).then((task) => {
            this.requestSvc.get(task.data.taskid).then((result) => {
                this.requestTrackingSvc.add(result.id, result.name);
            });
        });
        rbd['resize'] = false;
    }

    public cancelRBDResize(rbd: BlockDevice) {
        rbd['resize'] = false;
    }

    public removeRBD(rbd: BlockDevice) {
        var modal = ModalHelpers.RemoveConfirmation(this.modalSvc, {
        });
        modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide, confirmed: boolean) => {
            if (confirmed) {
                this.blockDeviceSvc.remove(rbd.clusterid, rbd.storageid, rbd.id).then((task) => {
                    this.requestSvc.get(task.data.taskid).then((result) => {
                        this.requestTrackingSvc.add(result.id, result.name);
                    });
                });
            }
            $hide();
        });
    }

    public osdActionChange = () => {
        if(this.osdAction !== 'action') {
            if(this.utils.keys(this.selection.allSelectedOsds).length === 0 ) {
                this.clusterService.slusAction(this.id,this.selection.activeOsd.sluid,this.osdAction).then((task) => {
                    this.requestSvc.get(task.taskid).then((result) => {
                        this.requestTrackingSvc.add(result.id, result.name);
                    });
                });
            }else {
                _.forOwn(this.selection.allSelectedOsds, (value, key) => {
                    this.clusterService.slusAction(this.id,key,this.osdAction).then((task) => {
                        this.requestSvc.get(task.taskid).then((result) => {
                            this.requestTrackingSvc.add(result.id, result.name);
                        });
                    });
                });
            }
            this.selection.allSelectedOsds= {};
            this.osdAction = 'action';
            this.timeoutService(() => this.getOSDs(), 10000);
        }
    }

    public filterSelectedOsd(selectedOSD) {
        _.forOwn(selectedOSD, function(value, key) {
            if (value === false) {
                delete selectedOSD[key];
            }
        });
    }

    public getFiltersByOSDStatus = () => {
        return (this.osdList || []).map(function (osd) {
            return osd.status;
        }).filter(function (osd, idx, arr) {
            return arr.indexOf(osd) === idx;
        });
    }

    public applyFilter =  (osd) => {
        return this.filter[osd.status] || this.noFilter(this.filter);
    }

    public noFilter = (filterObj) => {
        for (var key in filterObj) {
            if (filterObj[key]) {
                return false;
            }
        }
        return true;
    }

}
