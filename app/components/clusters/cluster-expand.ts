// <reference path="../typings/tsd.d.ts" />

import {OSDService} from '../rest/osd';
import {PoolService} from '../rest/pool';
import {UtilService} from '../rest/util';
import {VolumeService} from '../rest/volume';
import {ServerService} from '../rest/server';
import {ClusterService} from '../rest/clusters';
import {RequestService} from '../rest/request';
import {ClusterHelper} from './cluster-helpers';
import {RequestTrackingService} from '../requests/request-tracking-svc';
import * as ModalHelpers from '../modal/modal-helpers';
import {numeral} from '../base/libs';

export class ClusterExpandController {
    private name: any;
    private clusterType: any;
    private cluster: any;
    private newHost: any;
    private clusterID: string;
    private hosts: Array<any>;
    private disks: Array<any>;
    private clusterHelper: ClusterHelper;
    
    static $inject: Array<string> = [
        '$q',
        '$log',
        '$scope',
        '$modal',
        '$timeout',
        '$location',
        '$routeParams',
        'OSDService',
        'UtilService',
        'ServerService',
        'ClusterService',
        'RequestService',
        'RequestTrackingService'
    ];

    constructor(private qService: ng.IQService,
        private logService: ng.ILogService,
        private scopeService: ng.IScope,
        private modalService: any,
        private timeoutService: ng.ITimeoutService,
        private locationService: ng.ILocationService,
        private routeParamsSvc: ng.route.IRouteParamsService,
        private osdService: OSDService,
        private utilService: UtilService,
        private serverService: ServerService,
        private clusterService: ClusterService,
        private requestService: RequestService,
        private requestTrackingService: RequestTrackingService) {
        
        this.newHost = {};
        this.hosts = [];
        this.disks = [];
        this.clusterHelper = new ClusterHelper(utilService, requestService, logService, timeoutService);
        this.clusterID = this.routeParamsSvc['id'];

        this.clusterService.get(this.clusterID).then((cluster)=>this.loadCluster(cluster));
        this.fetchFreeHosts();
    }

    public loadCluster (cluster: any) {
        this.cluster = cluster;
        this.name = cluster.name;
        this.clusterType = this.clusterHelper.getClusterType(cluster.cluster_type);
    }

    public updateFingerPrint(host: any) {
        this.newHost.cautionMessage = "";
        this.newHost.errorMessage = "";
        this.utilService.getSshFingerprint(host.hostname).then(
            (sshfingerprint: any) => {
                host.sshfingerprint = sshfingerprint;
            },
            () => {
                this.newHost.cautionMessage = "Error!.";
                this.newHost.errorMessage = "Could not fetch ssh fingerprint";
            });
    }

    public updateIPAddress(host: any) {
        this.utilService.getIpAddresses(host.hostname).then((result) => {
            host.ipaddress = result.length > 0 ? result[0] : "N/A";
        });
    }

    public fetchFreeHosts() {
        this.serverService.getFreeHosts().then((freeHosts) => this.loadFreeHosts(freeHosts));
    }

    public loadFreeHosts(freeHosts: any) {
        this.hosts = [];
        _.each(freeHosts, (freeHost: any) => {
            var host = {
                id: freeHost.nodeid,
                hostname: freeHost.hostname,
                ipaddress: freeHost.management_ip4,
                state: "ACCEPTED",
                disks: freeHost.storage_disks,
                selected: false,
                isMon: false
            };
            host.disks = _.filter(freeHost.storage_disks, (disk: any) => {
                return disk.Type === 'disk' && disk.Used == false;
            });
            this.hosts.push(host);
            this.updateFingerPrint(host);
        });
    }

    public selectAllHosts() {
        _.each(this.hosts, (host) => {
            this.selectHost(host, true);
        });
    }

    public selectHost(host: any, selection: boolean) {
        host.selected = selection;
        this.countDisks();
        if(selection) {
            host.isMon = this.getHostFreeDisks(host).length == 0;
        }
        else {
            host.isMon = false;
        }
    }

    public getDisks(): any {
        return this.disks;
    }

    public getDisksSize(): any {
        var size: number = 0;
        size = _.reduce(this.disks, (size: any, disk: any) => {
            return size + disk.Size;
        }, 0);
        return numeral(size).format('0.0 b');
    }

    public getHostFreeDisks(host) {
        var freeDisks = _.filter(host.disks, (disk: any) => {
            return disk.Type === 'disk' && disk.Used == false;
        });
        return freeDisks;
    }

    public countDisks() {
        var disks: Array<any> = [];
        _.each(this.hosts, (host) => {
            if (host.selected) {
                Array.prototype.push.apply(disks, this.getHostFreeDisks(host));
            }
        });
        this.disks = disks;
    }

    public selectMon(host: any, selection: boolean) {
        if (selection) {
            this.selectHost(host, true);
        }
        else if (this.getHostFreeDisks(host).length == 0) {
            this.selectHost(host, false);
        }
        host.isMon = selection;
    }

    public addNewHost() {
        this.clusterHelper.addNewHost(this, this.serverService, this.timeoutService, this.requestService);
    }

    public postAddNewHost(host: any) {
        this.clusterHelper.acceptNewHost(this, host);
    }

    public isSubmitAvailable(): boolean {
        return true;
    }

    public cancel(): void {
        this.locationService.path('/clusters');
    }

    public submit() {
        var nodes: Array<any> = [];
        _.each(this.hosts, (host: any) => {
            if (host.selected) {
                var localHost: any = {
                    nodeid: host.id,
                    nodetype: []
                };
                var disks = [];
                _.each(host.disks, (disk: any) => {
                    if(disk.Type === 'disk' && disk.Used == false) {
                        disks.push({ name: disk.DevName, fstype: 'xfs' });
                    }
                });
                localHost.disks = disks;
                if(disks.length > 0) {
                    localHost.nodetype.push('OSD');
                }
                if (host.isMon) {
                    localHost.nodetype.push('MON');
                }
                nodes.push(localHost);
            }
        });
        this.expandCluster(this.clusterID, nodes);
    }

    public expandCluster(clusterId: string, cluster) {
        this.clusterService.expand(clusterId, cluster).then((result) => {
            if (result.status === 200) {
                this.logService.info('Cluster ' + cluster.cluster_name + ' expanded successfully');
                this.locationService.path('/clusters');
            }
            else if (result.status === 202) {
                this.requestService.get(result.data.taskid).then((task) => {
                    this.requestTrackingService.add(task.id, task.name);
                });
                var modal = ModalHelpers.SuccessfulRequest(this.modalService, {
                    title: 'Expand Cluster Request is Submitted',
                    container: '.usmClientApp'
                });
                modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide) => {
                    $hide();
                    this.locationService.path('/clusters');
                });
            }
            else {
                this.logService.error('Unexpected response from Clusters.expand:', result);
            }
        });
    }
}
