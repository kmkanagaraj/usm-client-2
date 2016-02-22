import {ClusterService} from '../rest/clusters';
import {ServerService} from '../rest/server';
import {numeral} from '../base/libs';

enum ClusterStatus {
    OK,         //0
    WARNING,    //1
    ERROR,      //2
    UNKNOWN     //3
}

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

         this.getMostUsedPools();
         this.getUtilizationByType();

         this.serverService.getDashboardSummary().then((summary) => this.loadDashboardData(summary));
         this.clusterService.getList().then((clusters) => this.loadClusterData(clusters));
         this.serverService.getList().then((nodes) => this.loadMonitors(nodes));
    }

    /**
     *This is the callback function called after getting summary data.
    */
    public loadDashboardData(summary: any) {
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
                    subdata.push({ "used" : usedData , "color" : "#00558a" , "subtitle" : "General" });
                }else if(profile === 'sas') {
                    subdata.push({ "used" : usedData , "color" : "#0071a6" , "subtitle" : "SAS" });
                }else if(profile === 'ssd') {
                    subdata.push({ "used" : usedData , "color" : "#00a8e1" , "subtitle" : "SSD" });
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
    }

    /**
     *This is the callback function called after getting clusters data.
    */
    public loadClusterData(clusters: Array<any>) {
        if (clusters.length === 0) {
            this.$location.path('/first');
        }
        else {
            this.clusters.total = clusters.length;
            _.each(clusters, (cluster: any) => {
                if(cluster.status === ClusterStatus.WARNING) {
                    this.clusters.warning++;
                }
                else if(cluster.status === ClusterStatus.ERROR) {
                    this.clusters.critical++;
                }
            });
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
          'subdata' : [ { "used" : 45 , "color" : "#00558a" , "subtitle" : "Object" },
                        { "used" : 15 , "color" : "#0071a6" , "subtitle" : "Block" },
                        { "used" :  5 , "color" : "#00a8e1" , "subtitle" : "OpenStack" }]
        };
        this.utilizationByType.layout = {
          'type': 'multidata'
        };
    }

}
