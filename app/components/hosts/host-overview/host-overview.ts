// <reference path="../typings/tsd.d.ts" />

import {ServerService} from '../../rest/server';
import {Node} from '../../rest/server';
import {I18N} from '../../base/i18n';
import {BytesFilter} from '../../shared/filters/bytes';

export class HostOverviewController {
    private id: string;
    private host: Node;
    private summary: any;
    private initialTime: any;
    private donutCharts: any;
    private trendCharts: any;
    private isOsd: Boolean;
    private isLoading: any;
    private bytes: any;
    private updateSummaryLabels: any;
    private updateHostLabels: any;
    public  osdsCountLabel: string;
    public  sssCountLabel: string;
    public  cpuusageLabel: string;
    public  memoryusageLabel: string;
    public  swapusageLabel: string;
    public  storageusageLabel: string;
    public  utilusageLabel: string;
    public  bindCpuusageLabel: any;
    public  bindMemoryusageLabel: any;
    public  bindSwapusageLabel: any;
    public  bindStorageusageLabel: any;
    public  bindUtilusageLabel: any;

    //Services that are used in this class.
    static $inject: Array<string> = [
        'ServerService',
        '$sce',
        'I18N',
    ];

    constructor(private serverService: ServerService,
                private $sce: ng.ISCEService,
                private i18n: I18N) {
            this.isLoading = { summaryData: true, donutChartsData: true, trendsChartsData: true };
            this.isOsd = false;
            this.summary = {};
            this.initialTime = { name: "Last 1 hour", value: "-1h" };
            this.donutCharts = {
                cpu:{data:{},config:{}},
                memory:{data:{},config:{}},
                swap:{data:{},config:{}},
                storage:{data:{},config:{}},
                network:{data:{},config:{}}
            };
            this.trendCharts = {
                cpu: {title:"",data:{xData:[],yData:[]},config:{}},
                memory: {title:"",data:{xData:[],yData:[]},config:{}},
                swap: {title:"",data:{xData:[],yData:[]},config:{}},
                storage: {title:"",data:{xData:[],yData:[]},config:{}},
                network: {title:"",data:{xData:[],yData:[]},config:{}},
                iop: {title:"",data:{xData:[],yData:[]},config:{}},
                throughput: {title:"",data:{xData:[],yData:[]},config:{}},
                latency: {title:"",data:{xData:[],yData:[]},config:{}}
            };
            this.serverService.get(this.id).then((host:any) => {
                this.host = host;
                if(this.host.roles.indexOf('OSD') > -1) {
                    this.isOsd = true;
                }
                this.getHostSummary(host.nodeid);
                this.changeTimeSlotForUtilization(this.initialTime);
                this.changeTimeSlotForPerformance(this.initialTime);
                this.changeTimeSlotForNetwork(this.initialTime);
                this.updateHostLabels();
            });
            this.updateSummaryLabels = function() {
                this.osdsCountLabel =
                        i18n.sprintf(i18n._("%d OSDs"),
                                     this.isLoading.summaryData ? 0 :
                                     this.summary.storage_logical_units.total);
                this.sssCountLabel =
                        i18n.sprintf(i18n._("%d Storage Services"),
                                     this.isLoading.summaryData ? 0 :
                                     this.summary.servicedetails.up.length + this.summary.servicedetails.down.length);
            };
            this.bytes = BytesFilter();
            this.updateHostLabels = function() {
                this.cpuusageLabel =
                        '<strong>CPU</strong> ' +
                        i18n.sprintf(i18n._("%s%s%%%s %sUsed%s"),
                                     '<div class="used-data-block">',
                                     i18n.numberFilter(this.host.utilizations.cpuusage.percentused, 1),
                                     '</div>',
                                     '<div class="total-data-block">',
                                     '</div>');
                this.bindCpuusageLabel = this.$sce.trustAsHtml(this.cpuusageLabel);
                this.memoryusageLabel =
                        '<strong>' +
                        i18n._("Memory") +
                        '</strong> ' +
                        i18n.sprintf(i18n._("%s of %s"),
                                    '<div class="used-data-block">' +
                                    this.bytes(this.host.utilizations.memoryusage.used) +
                                    '</div>',
                                    '<div class="total-data-block">' +
                                    this.bytes(this.host.utilizations.memoryusage.total) +
                                    '</div>');
                this.bindMemoryusageLabel = this.$sce.trustAsHtml(this.memoryusageLabel);
                this.swapusageLabel =
                        '<strong>' +
                        i18n._("Swap") +
                        '</strong> ' +
                        i18n.sprintf(i18n._("%s of %s"),
                                     '<div class="used-data-block">' +
                                     this.bytes(this.host.utilizations.swapusage.used) +
                                     '</div>',
                                     '<div class="total-data-block">' +
                                     this.bytes(this.host.utilizations.swapusage.total) +
                                     '</div>');
                this.bindSwapusageLabel = this.$sce.trustAsHtml(this.swapusageLabel);
                this.storageusageLabel =
                        '<strong>' +
                        i18n._("Storage") +
                        '</strong> ' +
                        i18n.sprintf(i18n._("%s of %s"),
                                    '<div class="used-data-block">' +
                                    this.bytes(this.host.utilizations.storageusage.used) +
                                    '</div>',
                                    '<div class="total-data-block">' +
                                    this.bytes(this.host.utilizations.storageusage.total) +
                                    '</div>');
                this.bindStorageusageLabel = this.$sce.trustAsHtml(this.storageusageLabel);
                this.utilusageLabel =
                        '<strong>' +
                        i18n._("Utilization") +
                        '</strong> ' +
                        i18n.sprintf(i18n._("%s of %s"),
                                     '<div class="used-data-block">' +
                                     this.bytes(this.host.utilizations.networkusage.used) +
                                     '/s</div>',
                                     '<div class="total-data-block">' +
                                     this.bytes(this.host.utilizations.networkusage.total) +
                                     '/s</div>');
                this.bindUtilusageLabel = this.$sce.trustAsHtml(this.utilusageLabel);
            };
            this.updateSummaryLabels();
            this.updateHostLabels();
    }

    public getHostSummary(nodeid: string) {
        this.serverService.getHostSummary(nodeid).then((summary) => {
            this.summary = summary;
            this.isLoading.summaryData = false;
            this.updateSummaryLabels();
        });
    }

    public getCpuUtilization(timeSlot: any) {
        var usage: any = {"total": 0,"used": 0};
        if(this.host.utilizations.cpuusage !== undefined) {
            usage = { "total":100, "used": this.host.utilizations.cpuusage.percentused }
        }
        this.setGraphUtilization(usage, "cpu");
        this.serverService.getHostCpuUtilization(this.host.nodeid,timeSlot.value).then((cpu_utilization) => {
            this.setGraphData(cpu_utilization,"cpu","","%","large");
        });
    }

    public getMemoryUtilization(timeSlot: any) {
        var usage: any = {"total": 0,"used": 0};
        if(this.host.utilizations.memoryusage !== undefined) {
            usage = { "total":this.host.utilizations.memoryusage.total, "used": this.host.utilizations.memoryusage.used }
        }
        this.setGraphUtilization(usage, "memory");
        this.serverService.getHostMemoryUtilization(this.host.nodeid,timeSlot.value).then((memory_utilization) => {
            this.setGraphData(memory_utilization,"memory","","%","large");
        });
    }

    public getSwapUtilization(timeSlot: any) {
        var usage: any = {"total": 0,"used": 0};
        if(this.host.utilizations.swapusage !== undefined) {
            usage = { "total":this.host.utilizations.swapusage.total, "used": this.host.utilizations.swapusage.used }
        }
        this.setGraphUtilization(usage, "swap");
        this.serverService.getHostSwapUtilization(this.host.nodeid,timeSlot.value).then((swap_utilization) => {
            this.setGraphData(swap_utilization,"swap","","%","large");
        });
    }

    public getStorageUtilization(timeSlot: any) {
        var usage: any = {"total": 0,"used": 0};
        if(this.host.utilizations.storageusage !== undefined) {
            usage = { "total":this.host.utilizations.storageusage.total, "used": this.host.utilizations.storageusage.used }
        }
        this.setGraphUtilization(usage, "storage");
        this.serverService.getHostStorageUtilization(this.host.nodeid,timeSlot.value).then((storage_utilization) => {
            this.setGraphData(storage_utilization,"storage","","%","large");
        });
    }

    public getNetworkUtilization(timeSlot: any) {
        var usage: any = {"total": 0,"used": 0};
        if(this.host.utilizations.networkusage !== undefined) {
            usage = { "total":this.host.utilizations.networkusage.total, "used": this.host.utilizations.networkusage.used }
        }
        this.setGraphUtilization(usage, "network");
        this.serverService.getHostNetworkUtilization(this.host.nodeid,timeSlot.value).then((network_utilization) => {
            this.setGraphData(network_utilization,"network","","%","large");
        });
    }

    public getDiskIOPS(timeSlot: any) {
        this.serverService.getHostIOPS(this.host.nodeid,timeSlot.value).then((iops) => {
            this.setGraphData(iops,"iops","IOPS","","compact");
        });
    }

    public getThroughput(timeSlot: any) {
        this.serverService.getHostThroughput(this.host.nodeid,timeSlot.value).then((throughput) => {
            this.setGraphData(throughput,"throughput","Network Throughput","B/s","compact");
        });
    }

    public getNetworkLatency(timeSlot: any) {
        this.serverService.getHostNetworkLatency(this.host.nodeid,timeSlot.value).then((network_latency) => {
            this.setGraphData(network_latency,"latency","Network Latency","ms","compact");
        });
    }

    public setGraphUtilization(usage, graphName) {
        this.donutCharts[graphName].data = usage
        this.donutCharts[graphName].config.chartId = graphName;
        this.donutCharts[graphName].config.thresholds = {'warning':'60','error':'90'};
        this.donutCharts[graphName].config.tooltipFn = (d) => {
              return '<span class="donut-tooltip-pf"style="white-space: nowrap;">' +
                       ((d[0].value * 100)/usage.total).toFixed(1) + '% ' + d[0].name +
                     '</span>';
        };
        this.donutCharts[graphName].config.centerLabelFn = () => {
              return ((usage.used * 100)/usage.total).toFixed(1) + "%";
        };
        this.isLoading.donutChartsData = false;
    }

    public setGraphData(graphArray, graphName, graphTitle, graphUnits, graphLayout) {
        var times = [];
        var used = [];
        times.push("dates");
        used.push("used");
        var isDataAvailable: boolean = false;
        if(graphArray.length !== 0 ) {
            var usageDataArray = graphArray[0].datapoints;
            isDataAvailable = (usageDataArray.length > 0 ? true : false);
            for (var index in usageDataArray) {
              var subArray = usageDataArray[index];
              times.push(new Date(subArray[1]));
              used.push(subArray[0].toFixed(1));
            }
        }
        this.trendCharts[graphName] = {
            title: graphTitle,
            data: {
                  dataAvailable: isDataAvailable,
                  total: 100,
                  xData: times,
                  yData: used
            },
            config: {
                chartId      :  graphName,
                title        :  graphTitle,
                layout       :  graphLayout,
                valueType    : 'actual',
                units        :  graphUnits,
                tooltipFn    :  function(d) {
                                    return  '<span class="donut-tooltip-pf">' +
                                              d[0].value + ' ' + graphUnits +
                                            '</span>';
                                }
            }
        }
        this.isLoading.trendsChartsData = false;
    }

    public changeTimeSlotForUtilization(time: any) {
        this.getCpuUtilization(time);
        this.getMemoryUtilization(time);
        this.getSwapUtilization(time);
        this.getStorageUtilization(time);
    }

    public changeTimeSlotForNetwork(time: any) {
        this.getNetworkUtilization(time);
    }

    public changeTimeSlotForPerformance(time: any) {
        this.getDiskIOPS(time);
        this.getThroughput(time);
        this.getNetworkLatency(time);
    }

}
