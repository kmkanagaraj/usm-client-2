// <reference path="../../../typings/tsd.d.ts" />

import {ClusterService} from '../rest/clusters';
import {Cluster} from '../rest/clusters';

export class StorageNewController {
    private clusters: Array<Cluster>;
    private cluster: Cluster;
    private errorMessage: string;
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
                this.validateCluster(this.cluster);
            }
        });
        this.type = "object";
    }

    public validateCluster(cluster):void {
        this.clusterSvc.get(cluster.clusterid).then((result) => {
            if(result.state == 2) {
                 return this.clusterSvc.getClusterSummary(cluster.clusterid);
            }
            else {
                this.errorMessage = "Cluster is not active";
            }
        }).then((summary) => {
            if(summary.slucount.total) {
                this.errorMessage = "";
            }
            else {
                this.errorMessage = "There is no OSD in the selected cluster";
            }
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
