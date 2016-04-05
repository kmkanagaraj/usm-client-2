// <reference path="../../../typings/tsd.d.ts" />

import {ClusterService} from '../rest/clusters';
import {Cluster} from '../rest/clusters';

export class StorageNewController {
    private clusters: Array<Cluster>;
    private cluster: Cluster;
    private hostCount: number;
    private type: String;

    static $inject: Array<string> = [
        '$location',
        'ClusterService'
    ];

    constructor(private $location: ng.ILocationService,
        private clusterSvc: ClusterService) {
        this.clusters = [];
        this.clusterSvc.getList().then((clusters) => {
            this.clusters = clusters;
            if (this.clusters.length > 0) {
                this.cluster = this.clusters[0];
            }
        });
        this.type = "object";
    }

    public getClusterSummary(clust):void {
        this.clusterSvc.getClusterSummary(clust.clusterid).then((summary) => {
            this.hostCount= summary.nodescount.total;
        });
    }

    public next(): void {
        if (this.cluster) {
            if (this.type === 'object') {
                this.addGenericStorage();
            }
            else if (this.type === 'block') {
                this.addBlockStorage();
            }
        }
    }

    public cancel(): void {
        this.$location.path('/storage/');
    }

    public addGenericStorage(): void {
        this.$location.path('/storage/new/object/' + this.cluster.clusterid);
    }

    public addBlockStorage(): void {
        this.$location.path('/storage/new/block/' + this.cluster.clusterid);
    }
}
