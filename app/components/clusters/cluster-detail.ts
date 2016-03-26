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
    private tabList: any;
    private tabIndex: any;
    private clusterUtilization: any;
    private systemUtilization: any;
    private mostUsedPools: any;
    private utilizationByProfile: any;
    private trendsCharts: any;
    private timeSlots: [{name:string, value:string}];
    private selectedTimeSlot: any;
    private timer: ng.IPromise<any>;
    private rbds = [];

    //Services that are used in this class.
    static $inject: Array<string> = [
        '$q',
        '$scope',
        '$location',
        '$interval',
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
        this.systemUtilization = {cpu:{data:{},config:{}},memory:{data:{},config:{}}};
        this.mostUsedPools = [];
        this.clusterList = [];
        this.tabList = {
            Overview: 1,
            Hosts: 2,
            Pools: 3,
            RBDs: 4,
            OSDs: 5,
            Storage_Profiles: 6,
            Configuration: 7
        }
        this.tabIndex = this.tabList.Overview;
        this.clusterHelpers = new ClusterHelper(null, null, null, null);
        this.utilizationByProfile = {};
        this.id = this.routeParamsSvc['id'];
        this.cluster = {};
        this.capacity = {};
        this.trendsCharts = {
            cpu: {title:"",data:{},config:{}},
            memory: {title:"",data:{},config:{}},
            latency: {title:"",data:{},config:{}},
            throughput: {title:"",data:{},config:{}},
            iops: {title:"",data:{},config:{}}
        };
        this.hosts = { total: 0, error: 0, unaccepted: 0 };
        this.pgs = { total: 0, error: 0 };
        this.osds = { total: 0, error: 0 };
        this.objects = { total: 0, error: 0 };
        this.pools = { total: 0, down: 0 };
        this.monitors = { total: 0, error: 0 };
        this.timeSlots = [{ name: "Last 1 hour", value: "-1h" },
                         { name: "Last 2 hours", value: "-2h" },
                         { name: "Last 24 hours", value: "" }];
        this.selectedTimeSlot = this.timeSlots[0];
        this.clusterService.getList().then((clusters: Array<any>) => {
           this.clusterList = clusters;
        });
        this.clusterService.get(this.id).then((cluster) => this.loadCluster(cluster));
        this.clusterService.getClusterSummary(this.id).then((summary) => this.loadClusterSummary(summary));
        this.timer = this.intervalSvc(() => this.refreshRBDs(), 5000);
        this.scopeService.$on('$destroy', () => {
            this.intervalSvc.cancel(this.timer);
        });
        this.refreshRBDs();
    }

    public loadCluster(cluster: any) {
        this.cluster.name = cluster.name;
        this.cluster.type = this.clusterHelpers.getClusterType(cluster.cluster_type);
        this.cluster.status = cluster.status;
        this.cluster.enabled = cluster.enabled;
        this.changeTimeSlot(this.selectedTimeSlot);
    }

    public loadClusterSummary(summary) {
        this.getClusterUtilization(summary.usage);
        this.getUtilizationByProfile(summary.storageprofileusage);
        this.getMostUsedPools(summary.storageusage);
        this.objects.total = summary.objectcount.num_objects;
        this.objects.error = summary.objectcount.num_objects_degraded;
        this.pools = summary.storagecount
        this.osds = summary.slucount;
        this.hosts = summary.nodescount;
        this.monitors.total = summary.providermonitoringdetails.ceph.monitor;
    }

    public getClusterUtilization(usage: any) {
        this.capacity = usage;
        this.clusterUtilization.data = usage
        this.clusterUtilization.config.chartId = "utilizationChart";
        this.clusterUtilization.config.thresholds = {'warning':'60','error':'90'};
        this.clusterUtilization.config.tooltipFn = (d) => {
              return '<span class="donut-tooltip-pf"style="white-space: nowrap;">' +
                       numeral(d[0].value).format('0 b') + ' ' + d[0].name +
                     '</span>';
        };
        this.clusterUtilization.config.centerLabelFn = () => {
              return Math.round(usage.percentused) + "% Used";
        };
    }

    public getUtilizationByProfile(profiles: any) {
        this.utilizationByProfile.title = 'Utilization by storage profile';
        this.utilizationByProfile.layout = {
          'type': 'multidata'
        };
        var subdata = [];
        var othersProfile = { "used": 0, "total": 0};
        Object.keys(profiles).forEach((profile) => {
            var usedData = Math.round(profiles[profile]["percentused"]);
            if(profile === 'general') {
                subdata.push({ "used" : usedData , "color" : "#004368" , "subtitle" : "General" });
            }else if(profile === 'sas') {
                subdata.push({ "used" : usedData , "color" : "#00659c" , "subtitle" : "SAS" });
            }else if(profile === 'ssd') {
                subdata.push({ "used" : usedData , "color" : "#39a5dc" , "subtitle" : "SSD" });
            }else{
                othersProfile.used = othersProfile.used + profiles[profile]["used"];
                othersProfile.total = othersProfile.total + profiles[profile]["total"];
            }
        });
        var othersProfilePercent = Math.round(100 * (othersProfile.used / othersProfile.total));
        if (othersProfilePercent > 0) {
            subdata.push({ "used" : othersProfilePercent , "color" : "#7dc3e8" , "subtitle" : "Others" });
        }
        this.utilizationByProfile.data = {
          'total': '100',
          'subdata' : subdata
        };
    }

    public getCpuUtilization(timeSlot: any) {
        this.clusterService.getClusterCpuUtilization(this.cluster.name,timeSlot.value).then((cpu_utilization) => {
            this.setGraphData(cpu_utilization,"cpu","Cpu utilization","");
            var currentState = cpu_utilization[0].target.split(" ")[1].split(":");
            if(currentState[0] === 'Current') {
                this.setGraphUtilization({"total":100,"used":parseInt(currentState[1])},'cpu');
            }
        });
    }

    public getMemoryUtilization(timeSlot: any) {
        this.clusterService.getClusterMemoryUtilization(this.cluster.name,timeSlot.value).then((memory_utilization) => {
            this.setGraphData(memory_utilization,"memory","Memory utilization","");
            var currentState = memory_utilization[0].target.split(" ")[1].split(":");
            if(currentState[0] === 'Current') {
                this.setGraphUtilization({"total":100,"used":parseInt(currentState[1])},'memory');
            }
        });
    }

    public getIOPS(timeSlot: any) {
        this.clusterService.getIOPS(this.cluster.name,timeSlot.value).then((iops) => {
            this.setGraphData(iops,"iops","IOPS","K");
        });
    }

    public getThroughput(timeSlot: any) {
        this.clusterService.getThroughput(this.cluster.name,timeSlot.value).then((throughput) => {
            this.setGraphData(throughput,"throughput","Throughput","KB/s");
        });
    }

    public getNetworkLatency(timeSlot: any) {
        this.clusterService.getNetworkLatency(this.cluster.name,timeSlot.value).then((network_latency) => {
            this.setGraphData(network_latency,"latency","Latency","ms");
        });
    }

    public setGraphUtilization(usage, value) {
        this.systemUtilization[value].data = usage
        this.systemUtilization[value].config.chartId = value;
        this.systemUtilization[value].config.thresholds = {'warning':'60','error':'90'};
        this.systemUtilization[value].config.tooltipFn = (d) => {
              return '<span class="donut-tooltip-pf"style="white-space: nowrap;">' +
                       numeral(d[0].value).format('0 b') + ' ' + d[0].name +
                     '</span>';
        };
        this.systemUtilization[value].config.centerLabelFn = () => {
              return Math.round(usage.used) + "% Used";
        };
    }


    public setGraphData(graphArray, value, graphTitle, graphUnits) {
        var times = [];
        var used = [];
        times.push("dates");
        used.push("used");
        var usageDataArray = graphArray[0].datapoints;
        for (var index in usageDataArray) {
          var subArray = usageDataArray[index];
          times.push(new Date(subArray[1]));
          used.push(Math.round(subArray[0]));
        }
        this.trendsCharts[value] = {
            title: graphTitle,
            data: {
                  dataAvailable: true,
                  total: 100,
                  xData: times,
                  yData: used
            },
            config: {
                chartId      :  value,
                title        :  graphTitle,
                layout       : 'compact',
                valueType    : 'actual',
                units        :  graphUnits,
            }
        }
    }

    public changeTimeSlot(time: any) {
        this.selectedTimeSlot = time;
        this.getCpuUtilization(this.selectedTimeSlot);
        this.getMemoryUtilization(this.selectedTimeSlot);
        this.getIOPS(this.selectedTimeSlot);
        this.getThroughput(this.selectedTimeSlot);
        this.getNetworkLatency(this.selectedTimeSlot);
    }

    public getMostUsedPools(mostUsedPools) {
        _.each(mostUsedPools, (pool) => {
            this.mostUsedPools.push({"title":pool["name"],"data":pool["usage"]});
        });
    }

    public setTab(newTab: number) {
        this.tabIndex = newTab;
    }

    public isSet(tabNum: number) {
        return this.tabIndex === tabNum;
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
}
