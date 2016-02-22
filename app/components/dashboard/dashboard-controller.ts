import {ClusterService} from '../rest/clusters';
import {ServerService} from '../rest/server';
import {numeral} from '../base/libs';

enum ClusterStatus {
    OK,         //0
    WARNING,    //1
    ERROR,      //2
    UNKNOWN     //3
};

export class DashboardController {
    private clusters: any;
    private hosts: any;
    private pools: any;
    private pgs: any;
    private osds: any;
    private objects: any;
    private monitors: any;
    private capacity: any;
    private utilization: any;
    private mostUsedPools: any;
    private utilizationByType: any;
    private utilizationByProfile: any;
    private systemPerformance: Array<any>;
    private timeSlot: any;
    private selectedTimeSlot: any;

    static $inject: Array<string> = [
        '$scope',
        '$location',
        '$log',
        'ClusterService',
        'ServerService'
    ];

    constructor(private $scope: ng.IScope,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private clusterService: ClusterService,
        private serverService: ServerService) {

         this.utilization = { data: {}, config: {} };
         this.mostUsedPools = [];
         this.utilizationByType = {};
         this.utilizationByProfile = {};

         this.clusters = { total: 0, warning: 0, critical: 0 };
         this.hosts = { total: 0, warning: 0, critical: 0, unaccepted: 0 };
         this.pgs = { total: 0, warning: 0, critical: 0 };
         this.osds = { total: 0, warning: 0, critical: 0 };
         this.objects = { total: 0, warning: 0, critical: 0 };
         this.pools = { total: 0, warning: 0, critical: 0 };
         this.monitors = { total: 0, warning: 0, critical: 0 };
         this.capacity = {};
         this.timeSlot = [{ name: "Last 24 hours", value: "24hours" },
                          { name: "Last 1 week", value: "1week" },
                          { name: "Last 2 weeks", value: "2weeks" },
                          { name: "Last 1 month", value: "1month" }];
         this.selectedTimeSlot = this.timeSlot[0];

         this.systemPerformance = this.getSystemPerformance();
         this.getMostUsedPools();
         this.getUtilizationByType();

         this.serverService.getDashboardSummary().then((summary) => this.loadDashboardData(summary));
         this.serverService.getList().then((nodes) => this.loadMonitors(nodes));
    }

    /**
     *This is the callback function called after getting summary data.
    */
    public loadDashboardData(summary: any) {
        if (summary.clusterscount.total === 0) {
            this.$location.path('/first');
        }
        else {
            //overall utilization data
            this.capacity.total = numeral(summary.usage.total).format('0 b');
            this.capacity.used = numeral(summary.usage.used).format('0 b');
            this.utilization.data.total = summary.usage.total;
            this.utilization.data.used = summary.usage.used;
            this.utilization.config.chartId = "utilizationChart";
            this.utilization.config.thresholds = {'warning':'60','error':'90'};
            this.utilization.config.legend = {"show":false};
            this.utilization.config.tooltipFn = (d) => {
                  return '<span class="donut-tooltip-pf"style="white-space: nowrap;">' +
                           numeral(d[0].value).format('0 b') + ' ' + d[0].name +
                         '</span>';
            };
            this.utilization.config.centerLabelFn = () => {
                  return Math.round(100 * (this.utilization.data.used / this.utilization.data.total)) + "% Used";
            };


            //storage utilization by profile
            this.utilizationByProfile.title = 'Utilization by storage profile';
            this.utilizationByProfile.layout = {
              'type': 'multidata'
            };
            var subdata = [];
            var profiles = summary.storageprofileusage;
            for (var profile in profiles) {
                if (profiles.hasOwnProperty(profile)) {
                    var usedData = Math.round(100 * (profiles[profile]["used"] / profiles[profile]["total"]));
                    if(profile === 'general') {
                        subdata.push({ "used" : usedData , "color" : "#004368" , "subtitle" : "General" });
                    }else if(profile === 'sas') {
                        subdata.push({ "used" : usedData , "color" : "#00659c" , "subtitle" : "SAS" });
                    }else if(profile === 'ssd') {
                        subdata.push({ "used" : usedData , "color" : "#39a5dc" , "subtitle" : "SSD" });
                    }else if(profile === 'others') {
                        subdata.push({ "used" : usedData , "color" : "#7dc3e8" , "subtitle" : "Others" });
                    }
                }
            }
            this.utilizationByProfile.data = {
              'total': '100',
              'subdata' : subdata
            };

            this.objects.total = summary.objectcnt;
            this.osds.total = summary.slucount.total;
            this.hosts.total = summary.nodescount.total;
            this.hosts.critical = summary.nodescount.down;
            this.hosts.unaccepted = summary.nodescount.unaccepted;
            this.clusters.total = summary.clusterscount.total;
            this.clusters.critical = summary.clusterscount.error;
        }
    }

    /**
     *This is the callback function called after getting monitors list.
    */
    public loadMonitors(nodes: Array<any>) {
        _.each(nodes, (node: any) => {
            if (node.options1.mon === 'Y') {
                this.monitors.total++;
                if(node.status === 'down') {
                    this.monitors.critical++;
                }
            }
        });
    }

    /**
     *This is the callback function called after getting most used pools.
    */
    public getMostUsedPools() {
        this.mostUsedPools.push({"title":"Pool1","units":"GB","data":{"used":"85","total":"100"}});
        this.mostUsedPools.push({"title":"Pool2","units":"GB","data":{"used":"75","total":"100"}});
        this.mostUsedPools.push({"title":"Pool3","units":"GB","data":{"used":"95","total":"100"}});
        this.mostUsedPools.push({"title":"Pool4","units":"GB","data":{"used":"30","total":"100"}});
    }

    /**
     *This is the callback function called after getting utilization by type.
    */
    public getUtilizationByType() {
        this.utilizationByType.title = 'Utilization by storage type';
        this.utilizationByType.data = {
          'total': '100',
          'subdata' : [ { "used" : 45 , "color" : "#004368" , "subtitle" : "Object" },
                        { "used" : 25 , "color" : "#00659c" , "subtitle" : "Block" },
                        { "used" : 15 , "color" : "#39a5dc" , "subtitle" : "OpenStack" },
                        { "used" : 10 , "color" : "#7dc3e8" , "subtitle" : "Others" }]
        };
        this.utilizationByType.layout = {
          'type': 'multidata'
        };
    }

    /**
     *This is the function for change time slot.
    */
    public changeTimeSlot(time: any) {
        this.selectedTimeSlot = time;
    }

    /**
     *This is mock function for get system performance.
    */
    public getSystemPerformance() : Array<any> {
        var today = new Date();
        var dates = [];
        dates.push("dates");
        for (var d = 20 - 1; d >= 0; d--) {
             dates.push(new Date(today.getTime() - (d * 24 * 60 * 60 * 1000)));
        }
        var systemPerformance = [
            {
                title: "CPU utilization",
                data: {
                      dataAvailable: true,
                      total: 250,
                      xData: dates,
                      yData: ['used', 10, 20, 30, 20, 30, 10, 14, 20, 25, 68, 54, 56, 78, 56, 67, 88, 76, 65, 87, 76]
                },
                config: {
                    chartId      : 'exampleTrendsChart1',
                    title        : 'Network Utilization Trends',
                    layout       : 'inline',
                    valueType    : 'actual',
                    timeFrame    : 'Last 15 Minutes',
                    units        : 'MHz',
                    tooltipType  : 'percentage'
                }
            },
            {
                title: "Memory utilization",
                data: {
                      dataAvailable: true,
                      total: 250,
                      xData: dates,
                      yData: ['used', 30, 20, 30, 20, 10, 20, 44, 20, 25, 68, 5, 56, 78, 56, 50, 88, 16, 65, 87, 76]
                },
                config: {
                    chartId      : 'exampleTrendsChart2',
                    title        : 'Network Utilization Trends',
                    layout       : 'inline',
                    valueType    : 'actual',
                    timeFrame    : 'Last 15 Minutes',
                    units        : 'MHz',
                    tooltipType  : 'percentage'
                }
            },
            {
                title: "IOPS",
                data: {
                      dataAvailable: true,
                      total: 150,
                      xData: dates,
                      yData: ['used', 10, 20, 30, 20, 10, 30, 44, 20, 25, 68, 5, 56, 78, 56, 50, 88, 16, 65, 87, 76]
                },
                config: {
                    chartId      : 'exampleTrendsChart3',
                    title        : 'Network Utilization Trends',
                    layout       : 'inline',
                    valueType    : 'actual',
                    timeFrame    : 'Last 15 Minutes',
                    units        : 'MHz',
                    tooltipType  : 'percentage'
                }
            },
            {
                title: "Throughput",
                data: {
                      dataAvailable: true,
                      total: 450,
                      xData: dates,
                      yData: ['used', 30, 20, 30, 20, 10, 30, 44, 20, 25, 68, 5, 56, 78, 56, 50, 88, 16, 65, 87, 76]
                },
                config: {
                    chartId      : 'exampleTrendsChart4',
                    title        : 'Network Utilization Trends',
                    layout       : 'inline',
                    valueType    : 'actual',
                    timeFrame    : 'Last 15 Minutes',
                    units        : 'MHz',
                    tooltipType  : 'percentage'
                }
            },
            {
                title: "Latency",
                data: {
                      dataAvailable: true,
                      total: 300,
                      xData: dates,
                      yData: ['used', 30, 20, 30, 20, 10, 30, 44, 20, 15, 68, 5, 56, 78, 36, 50, 88, 16, 65, 87, 76]
                },
                config: {
                    chartId      : 'exampleTrendsChart5',
                    title        : 'Network Utilization Trends',
                    layout       : 'inline',
                    valueType    : 'actual',
                    timeFrame    : 'Last 15 Minutes',
                    units        : 'MHz',
                    tooltipType  : 'percentage'
                }
            }

        ];
        return systemPerformance;
    }

}
