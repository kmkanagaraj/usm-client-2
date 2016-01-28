// <reference path="../typings/tsd.d.ts" />

import {ClusterHelper} from './cluster-helpers';
import {ClusterService} from '../rest/clusters';
import {ServerService} from '../rest/server';
import {VolumeService} from '../rest/volume';
import {PoolService} from '../rest/pool';
import {MockDataProvider} from './mock-data-provider-helpers';
import {numeral} from '../base/libs';

export class ClusterDetailController {
    private mockDataProvider: MockDataProvider;
    private clusterHelpers: ClusterHelper;
    private clusterList: Array<any>;
    private cluster: any;
    private capacity: any;
    private id: any;
    private hosts: any;
    private pools: any;
    private pgs: any;
    private osds: any;
    private tabList: Array<any>;
    private tabIndex: any;
    
    //Services that are used in this class.
    static $inject: Array<string> = [
        '$q',
        '$scope',
        '$location',
        '$log',
        '$routeParams',
        'ClusterService',
        'ServerService',
        'PoolService',
    ];

    constructor(private qService: ng.IQService,
        private scopeService: ng.IScope,
        private locationService: ng.ILocationService,
        private logService: ng.ILogService,
        private routeParamsSvc: ng.route.IRouteParamsService,
        private clusterService: ClusterService,
        private serverService: ServerService,
        private poolService: PoolService) {

        this.clusterList = [];
        this.tabList = [
            { tabName: "Overview" },{ tabName: "CRUSH map" },{ tabName: "Pools" },{ tabName: "RBDs" },
            { tabName: "OSDs" },{ tabName: "Storage Profiles" },{ tabName: "Configuration" }
        ];
        this.tabIndex = 0;
        this.clusterHelpers = new ClusterHelper(null, null, null, null);
        this.mockDataProvider = new MockDataProvider();
        
        this.id = this.routeParamsSvc['id'];
        this.cluster = {};
        this.capacity = { free: 0, used: 0, total: 0 };
        this.hosts = { total: 0, warning: 0, critical: 0 };
        this.pools = { total: 0, warning: 0, critical: 0 };
        this.pgs = { total: 1024, warning: 0, critical: 0 };
        this.osds = { total: 3, warning: 0, critical: 0 };

        this.clusterService.getList().then((clusters: Array<any>) => {
           this.clusterDropdown(clusters);
        });
        this.clusterService.get(this.id).then((cluster) => this.loadCluster(cluster));
        this.serverService.getListByCluster(this.id).then((hosts) => this.getHostStatus(hosts));
        this.poolService.getListByCluster(this.id).then((pools) => this.getPoolsLength(pools));
     
    }

    public clusterDropdown(clusters: Array<any>) {
        _.each(clusters, (cluster) => {
            this.clusterList.push(cluster);
        });
    }

    public loadCluster(cluster: any) {
        this.cluster.name = cluster.cluster_name;
        this.cluster.type = this.clusterHelpers.getClusterType(cluster.cluster_type);
        this.capacity.used = cluster.used * 1073741824;
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

    public getPoolsLength(pools: any) {
        this.pools.total = pools.length;
    }

    public setTab(newTab: any) {
        this.tabIndex = newTab;
    }

    public isSet(tabNum: any) {
        return this.tabIndex === tabNum;
    }

}
