// <reference path="../typings/tsd.d.ts" />

import {ServerService} from '../../rest/server';

export class HostOverviewController {
    private id: any;
    private host: any;
    private summary: any;
    private duration: any;
    private donutCharts: any;
    private trendCharts: any;

    //Services that are used in this class.
    static $inject: Array<string> = [
        '$q',
        '$modal',
        '$scope',
        '$timeout',
        '$log',
        'ServerService'
    ];

    constructor(private qService: ng.IQService,
        private $modal: any,
        private scopeService: ng.IScope,
        private timeoutService: ng.ITimeoutService,
        private logService: ng.ILogService,
        private serverService: ServerService) {
            this.summary = {
                basicDetail: { hostRole: "Osd Host", upSince: "12 march 2016", cluster: "My Ceph", clusterStatus: 0 }, 
                osd: { total: 32, error: 2, warning: 3 },
                rhscService: { total: 42, error: 1, warning: 9 }
            }
            this.duration = { 
                timeSlots : [{ name: "Last 1 hour", value: "-1h" },
                             { name: "Last 2 hours", value: "-2h" },
                             { name: "Last 24 hours", value: "" }],
                utilizationSelectedTimeSlot : { name: "Last 1 hour", value: "-1h" },
                networkSelectedTimeSlot : { name: "Last 1 hour", value: "-1h" },
                performanceSelectedTimeSlot : { name: "Last 1 hour", value: "-1h" }         
            };
            this.donutCharts = {
                cpu:{data:{},config:{}},
                memory:{data:{},config:{}},
                swap:{data:{},config:{}},
                storage:{data:{},config:{}},
                network:{data:{},config:{}}
            };
            this.trendCharts = {
                cpu: {title:"",data:{},config:{}},
                memory: {title:"",data:{},config:{}},
                swap: {title:"",data:{},config:{}},
                storage: {title:"",data:{},config:{}},
                network: {title:"",data:{},config:{}},
                iop: {title:"",data:{},config:{}},
                throughput: {title:"",data:{},config:{}},
                latency: {title:"",data:{},config:{}}
            };
            this.serverService.get(this.id).then((host:any) => {
                host.hostname =(host.hostname).split(".").join("_");
                this.host = host;
                this.changeTimeSlotForUtilization(this.duration.utilizationSelectedTimeSlot);
                this.changeTimeSlotForPerformance(this.duration.performanceSelectedTimeSlot);
                this.changeTimeSlotForNetwork(this.duration.networkSelectedTimeSlot);
            });
    }

    public getCpuUtilization(timeSlot: any) {
        this.serverService.getHostCpuUtilization(this.host.hostname,timeSlot.value).then((cpu_utilization) => {
            this.drawGraphs(cpu_utilization,"cpu","Cpu utilization","%");
        });
    }

    public getMemoryUtilization(timeSlot: any) {
        this.serverService.getHostMemoryUtilization(this.host.hostname,timeSlot.value).then((memory_utilization) => {
            this.drawGraphs(memory_utilization,"memory","Memory utilization","%");
        });
    }

    public getSwapUtilization(timeSlot: any) {
        this.serverService.getHostSwapUtilization(this.host.hostname,timeSlot.value).then((swap_utilization) => {
            this.drawGraphs(swap_utilization,"swap","Swap utilization","%");
        });
    }

    public getStorageUtilization(timeSlot: any) {
        this.serverService.getHostStorageUtilization(this.host.hostname,timeSlot.value).then((storage_utilization) => {
            this.drawGraphs(storage_utilization,"storage","Storage utilization","%");
        });
    }

    public getNetworkUtilization(timeSlot: any) {
        this.serverService.getHostNetworkUtilization(this.host.hostname,timeSlot.value).then((network_utilization) => {
            this.drawGraphs(network_utilization,"network","Network utilization","ms");
        });
    }

    public getDiskIOPS(timeSlot: any) {
        this.serverService.getHostIOPS(this.host.hostname,timeSlot.value).then((iops) => {
            this.setGraphData(iops,"iops","IOPS","K");
        });
    }

    public getThroughput(timeSlot: any) {
        this.serverService.getHostThroughput(this.host.hostname,timeSlot.value).then((throughput) => {
            this.setGraphData(throughput,"throughput","Network Throughput","KB/s");
        });
    }

    public getNetworkLatency(timeSlot: any) {
        this.serverService.getHostNetworkLatency(this.host.hostname,timeSlot.value).then((network_latency) => {
            this.setGraphData(network_latency,"latency","Network Latency","ms");
        });
    }

    public drawGraphs(graphArray, graphName, graphTitle, graphUnits) {
        this.setGraphData(graphArray,graphName,graphTitle,graphUnits);
        /* sample response : "target": "collectd.system.cpu-user Current:1.01 Max:17.30 Min:0.20 ".
        formatting the currentState :- taking first value from  array , and splitting target's key string based on space and than at the last splitting this array based on ':'. now will have currentState in splitted array */
        var currentState = graphArray[0].target.split(" ")[1].split(":");
        if(currentState[0] === 'Current') {
            this.setGraphUtilization({"total":100,"used":parseInt(currentState[1])}, graphName);
        }
    }

    public setGraphUtilization(usage, graphName) {
        this.donutCharts[graphName].data = usage
        this.donutCharts[graphName].config.chartId = graphName;
        this.donutCharts[graphName].config.thresholds = {'warning':'60','error':'90'};
        this.donutCharts[graphName].config.tooltipFn = (d) => {
              return '<span class="donut-tooltip-pf"style="white-space: nowrap;">' +
                       numeral(d[0].value).format('0 b') + ' ' + d[0].name +
                     '</span>';
        };
        this.donutCharts[graphName].config.centerLabelFn = () => {
              return Math.round(usage.used) + "% Used";
        };
    }

    public setGraphData(graphArray, graphName, graphTitle, graphUnits) {
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
        this.trendCharts[graphName] = {
            title: graphTitle,
            data: {
                  dataAvailable: true,
                  total: 100,
                  xData: times,
                  yData: used
            },
            config: {
                chartId      :  graphName,
                title        :  graphTitle,
                layout       : 'compact',
                valueType    : 'actual',
                units        :  graphUnits,
                tooltipFn    :  function(d) {
                                    return  '<span class="donut-tooltip-pf">' +
                                              d[0].value + ' ' + graphUnits +
                                            '</span>';
                                }
            }
        }
    }

    public changeTimeSlotForUtilization(time: any) {
        this.duration.utilizationSelectedTimeSlot = time;
        this.getCpuUtilization(this.duration.utilizationSelectedTimeSlot);
        this.getMemoryUtilization(this.duration.utilizationSelectedTimeSlot);
        this.getSwapUtilization(this.duration.utilizationSelectedTimeSlot);
        this.getStorageUtilization(this.duration.utilizationSelectedTimeSlot);
    }

    public changeTimeSlotForNetwork(time: any) {
        this.duration.networkSelectedTimeSlot = time;
        this.getNetworkUtilization(this.duration.networkSelectedTimeSlot);
    }

    public changeTimeSlotForPerformance(time: any) {
        this.duration.performanceSelectedTimeSlot = time;
        this.getDiskIOPS(this.duration.performanceSelectedTimeSlot);
        this.getThroughput(this.duration.performanceSelectedTimeSlot);
        this.getNetworkLatency(this.duration.performanceSelectedTimeSlot);
    }

}
