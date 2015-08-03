// <reference path="../typings/tsd.d.ts" />
// <reference path="./cluster-helpers.ts" />

import {ClusterHelper} from './cluster-helpers';
import {VolumeHelper} from '';
import {ModalHelper} from '';
import {ClusterService} from '../rest/clusters';
import {ServerService} from '';
import {VolumeService} from '';
import {OSDService} from '';
import {PoolService} from '';
import {UtilService} from '../rest/util';
import {RequestTrackingService} from '';
import {RequestService} from '';
import {Volume} from './cluster-modals';
import {Pool} from './cluster-modals';
import {Host} from './cluster-modals';

export class ClusterNewController {
    private self;
    private step: number;
    private summaryHostsSortOrder: any;

    private storageTypes: Array<any>;
    private storageType: any;

    private clusterName: any;
    private clusterTypes: Array<any>;
    private clusterType: any;

    private workLoads: Array<any>;
    private workLoad: any;

    private deploymentTypes: Array<any>;
    private deploymentType: any;

    private newHost: any;
    private hosts: Array<any>;
    private disks: Array<any>;
    private osds: Array<any>;
    private volumes: Array<Volume>;
    private newVolume: Volume;
    private pools: Array<Pool>;
    private newPool: Pool;

    static $inject: Array<string> = [
        '$q',
        '$log',
        '$scope',
        '$modal',
        '$timeout',
        '$location',
        'VolumeService',
        'ClusterService',
        'ServersService',
        'OSDService',
        'PoolService',
        'UtilService',
        'RequestService',
        'RequestTrackingService',
    ];
    /**
     * Initializing the properties of the class ClusterNewController.
     */
    constructor(private qService: ng.IQService,
        private logService: ng.ILogService,
        private scopeService: ng.IScope,
        private modalService: any,
        private timeoutSerivice: ng.ITimeoutService,
        private locationService: ng.ILocationService,
        private volumeService: VolumeService,
        private clusterSerivice: ClusterService,
        private serverService: ServerService,
        private osdService: OSDService,
        private poolService: PoolService,
        private utilService: UtilService,
        private requestService: RequestService,
        private requestTrackingService: RequestTrackingService,
        private clusterHelper: ClusterHelper,
        private volumeHelper: VolumeHelper,
        private modalHelper: ModalHelper) {

        this.storageTypes = ClusterHelper.getStorageTypes();
        this.storageType = this.storageTypes[0];

        this.clusterType = this.clusterTypes[0];
        this.clusterTypes = ClusterHelper.getClusterTypes();

        this.workLoads = this.clusterType.workLoads;
        this.workLoad = this.workLoads[0];

        this.deploymentTypes = this.clusterType.deploymentTypes;
        this.deploymentType = this.deploymentTypes[0];

        this.newVolume.copyCount = volumeHelper.getCopiesList();
        this.newVolume.copyCountList = volumeHelper.getRecomendedCopyCount();
        this.newVolume.sizeUnit = volumeHelper.getTargetSizeUnits();
        this.newVolume.sizeUnits = this.newVolume.sizeUnits[0];

        this.newPool.copyCountList = volumeHelper.getCopiesList();
        this.newPool.copyCount = volumeHelper.getRecomendedCopyCount();

        this.serverService.getDiscoveredHosts().then(this.discoveredHostCallBack);
        this.serverService.getFreeHosts().then(this.freeHostCallBack);
    }


    public updateFingerCallBack(host: any): any {
        this.utilService.getIpAddress(host.hostName).then((ipAddress) => {
            host.ipAddress = ipAddress;
            this.newHost.errorMessage = "";
            this.newHost.cautionMessage = "";
            return this.utilService.getSshFingerprint(host.ipAddress);
        },
            () => {
                this.newHost.cautionMessage = "Error!.";
                this.newHost.errorMessage = "Could not resolve the hostname";
            },
            (fingerPrint) => {
                host.fingerPrint = fingerPrint;
            });
    }

    public updateFingerPrintHost(host: any) {
        this.newHost.errorMessage = "";
        this.newHost.cautionMessage = "";
        (host) = this.updateFingerCallBack(host);
    }

    public discoveredHostCallBack = (freeHosts: any) => {
        _.each(freeHosts, (freeHost: any) => {
            var host: any = {
                hostname: freeHost.nodeName,
                ipaddress: freeHost.managementIP,
                state: "UNACCEPTED",
                selected: false
            };
            this.hosts.push(host);
            this.updateFingerPrintHost(host);
        });
    }

    public freeHostCallBack = (freeHosts: any) => {
        _.each(freeHosts, function(freeHost: any) {
            var host = {
                ID: freeHost.nodeID,
                hostname: freeHost.nodeName,
                ipaddress: freeHost.managementIp,
                state: "ACCEPTED",
                selected: false
            };
            this.hosts.push(host);
            this.updateFingerprint(host);
        });
    }

    public getDisks(): any {
        return this.disks;
    }

    public getDiskSize(): any {
        var size: number = 0;
        return _.reduce(this.disks, (size: any, disk: any) => {
            return disk.size + size;
        }, 0);
    }

    public countDisks() {
        var disks: Array<any>;
        _.each(this.hosts, (host) => {
            if (host.selected) {
                Array.prototype.push.apply(disks, host.disks);
            }
        });
        this.disks = disks;
    }

    public selectHostCallBack = (host: any) => {
        this.serverService.getStorageDevicesFree(host.ID, host.hostName).then((disks) => {
            host.disks = disks;
            this.countDisks();
        });
    }

    public selectHost(host: any, selection: boolean) {
        if (host.state === "ACCEPTED") {
            host.selected = selection;
            if (host.selected) {
                (host) => this.selectHostCallBack(host);
            }
            this.countDisks();
        }
    }

    public selectAllHosts() {
        _.each(this.hosts, (host) => {
            this.selectHost(host, true);
        });
    }

    public sortHostInSummary() {
        this.summaryHostsSortOrder = this.summaryHostsSortOrder === '-hostname' ? 'hostname' : '-hostname';
    }

    public onStorageTypeChanged() {
        if (this.storageType.ID === 1 || this.storageType.ID === 3) {
            this.clusterType = this.clusterTypes[1];
        } else {
            this.clusterType = this.clusterType[0];
        }
        this.onClusterTypeChanged();
    }

    public onClusterTypeChanged() {
        this.deploymentTypes = this.clusterType.deploymentTypes;
        this.deploymentType = this.deploymentTypes[0];
        this.workLoads = this.clusterType.workLoads;
        this.workLoad = this.workLoads[0];
    }

    public addNewHost() {
        this.clusterHelper.addNewHost(this);
    }

    public postAddNewHost(host: any) {
        this.clusterHelper.acceptNewHost(this, host);
    }

    public acceptHost(host: any) {
        this.clusterHelper.acceptHost(this, host);
    }

    public acceptAllHosts() {
        _.each(this.hosts, (host) => {
            if (host.state === "UNACCEPTED") {
                this.acceptHost(host);
            }
        });
    }

    public postAcceptHostCallBack = (host: any) => {
        this.serverService.getByHostName(host.hostName).then((hostFound) => {
            host.ID = hostFound.nodeID;
            this.selectHost(host, true);
        });
    }

    public postAcceptHost(host: any) {
        if (host.ID) {
            this.selectHost(host, true);
        } else {
            (host) => this.postAcceptHostCallBack(host);
        }
    }

    public removeHost(host: any) {
        _.remove(this.hosts, (currentHost) => {
            return currentHost.hostName === host.hostName;
        });
    }

    public addNewVolume(newVolume: any) {
        var freeDisks: any = _.filter(this.disks, (disk: any) => {
            return !disk.used;
        });

        var devicesMap: any = _.groupBy(freeDisks, (disk: any) => {
            return disk.node;
        });

        var devicesList: any = _.map(devicesMap, (disks: any) => {
            return disks;
        });

        var selectedDisks = this.volumeHelper.getStorageDevicesForVolumeBasic(newVolume.size, newVolume.copyCount, devicesList);
        _.each(selectedDisks, (selectedDisk: any) => {
            selectedDisk.used = true;
        })
        newVolume.disks = selectedDisks;
        this.volumes.push(newVolume);

        this.newVolume = {
            copyCountList: this.volumeHelper.getCopiesList(),
            copyCount: this.volumeHelper.getRecomendedCopyCount(),
            sizeUnits: this.volumeHelper.getTargetSizeUnits(),
            sizeUnit: this.newVolume.sizeUnits[0]
        };
    }

    public addNewPool(newPool: Pool) {
        this.pools.push(newPool);
        this.newPool = {
            copyCountList: this.volumeHelper.getCopiesList(),
            copyCount: this.volumeHelper.getRecomendedCopyCount()
        };
    }

    public moveStep(nextStep: any) {
        this.step = (this.step === 1 && this.clusterName === undefined) ? this.step : this.step + nextStep;
    }

    public isCancelAvailable(): boolean {
        return this.step === 1;
    }

    public isSubmitAvailable(): boolean {
        return this.step === 4
    }

    public cancel() {
        this.locationService.path('/clusters');
    }

    public glusterCallBack(requests: any, volumes: any) {
        this.qService.all(requests).then((results) => {
            var index = 0;
            while (index < results.length) {
                if (results[index].status === 202) {
                    this.requestTrackingService.add(results[index].data, 'Creating volume \'' + volumes[index].name);
                }
                ++index;
            }
        });
    }

    public postGlusterClusterCreate(cluster: any, volumes: any) {
        var requests: Array<any>;

        _.each(volumes, (volume : any) => {
            var localVolume: any = {
                cluster: cluster.cluterID,
                volumeName: volume.name,
                volumeType: 2,
                replicaCount: volume.copyCount,
                bricks: []
            };

            _.each(volume.disks, (device: any) => {
                var brick: any = {
                    node: device.node,
                    storageDevices: device.storageDeviceID
                };
                localVolume.bricks.push(brick);
            });
            requests.push(this.volumeService.create(localVolume));
        });

        (requests, volumes) => this.glusterCallBack(requests, volumes);
    }

    public createCephPoolsCallBack(cluster: any, poolsRequest: any, request: any) {
        this.poolService.create(poolsRequest).then( (result) => {
            if(request.status === 202)  {
                this.requestTrackingService.add(result.data, 'Creating pools in cluster \'' + cluster.clusterName + '\'');
            }else {
                this.logService.error('Unexpected response from Pools.create', result);
            }    
        });
    }
    
    public createCephPools(cluster: any, disks: any, pools: any) {
        this.logService.info('Post OSD Create');
        var poolsRequest = {
            cluster: cluster.clusterID,
            pools: []
        };
        
        _.each(pools, (pool: any) => {
           poolsRequest.pools.push({
               poolName: pool.name,
               pgNum: parseInt(pool.pgNum)
           });
           
           if(poolsRequest.pools.length > 0) {
               (cluster, poolsRequest, request) => this.createCephPoolsCallBack(cluster, poolsRequest, request);
           }
        });
    }
    
    public addingOSDsCallBack(result: any, request: any, cluster: any, disks: any, pools: any)  {
        this.logService.info('Adding OSDs callback '+ result.data);
        this.requestService.get(result.data).then( () => {
            if(request.staus === 'FAILED'|| request.status === 'FAILURE')   {
                this.logService.info('Adding OSDs to cluster\'' +this.clusterName + '\' + is failed');
            }else if(request.status === 'SUCCESS')  {
                this.logService.info('Adding OSDs to cluster \'' + this.clusterName + '\' is completed successfully');
                this.createCephPools(cluster, disks, pools);
            }else {
                this.logService.info('Waiting for OSDs to be added to cluster \'' + this.clusterName + '\'');
                this.timeoutSerivice(this.addingOSDsCallBack, 5000);
            }
        });
    }
    
    public cephCallBack(osds: any, cluster: any, disks: any, pools: any) {
        this.osdService.create(osds).then((result: any) => {
            this.requestTrackingService.add(result.data, 'Adding OSDs to cluster \'' + cluster.clusterName + '\'');
            (result, request, cluster, disks, pools) => this.addingOSDsCallBack(result, request, cluster, disks, pools);
            this.timeoutSerivice(this.addingOSDsCallBack, 5000);
        });
    }

    public postCephClusterCreate(cluster: any, disks: any, pools: any) {
        var osdList: Array<any>;
        _.each(disks, (disk: any) => {
            var osd: any = {
                node: disk.node,
                sotrageDevice: disk.storageDeviceID
            };
            osdList.push(osd);
        });

        var osds: any = {
            osds: osdList
        };

        (osds, cluster, disks, pools) => this.cephCallBack(osds, cluster, disks, pools);
    }

    public postClusterCreate(cluster: any, disks: any, volumes, pools) {
        this.logService.info('Post Cluster Create');
        if (this.clusterType.type === 'Gluster') {
            this.postGlusterClusterCreate(cluster, volumes);
        } else {
            this.postCephClusterCreate(cluster, disks, pools);
        }
    }

    public clusterCreateSuccessCallBack(cluster: any) {
        var disks = this.getDisks();
        var volumes = this.volumes;
        var pools = this.pools;

        /*this.clusterSerivice.getByName(this.clusterName).then((result: any) => {
            cluster.clusterID = result.clusterID;
            this.postClusterCreate(cluster, disks, volumes, pools);
        });
        */
    }

    public clusterCreateCallBack(result: any, cluster: any) {
        this.logService.info("Cluster Create CallBack" + result.data);
        this.requestService.get(result.data).then((request: any) => {
            if (request.status === 'FAILED' || request.status === 'FAILURE') {
                this.logService.info('Creating cluster \'' + this.clusterName + '\' is failed');
            } else if (request.status === 'SUCCESS') {
                this.logService.info('Cluster \'' + this.clusterName + '\' is created successfully');
                (cluster) => this.clusterCreateSuccessCallBack(cluster);
            } else {
                this.logService.info('Waiting for Cluster \'' + this.clusterName + '\' to be ready');
                this.timeoutSerivice(this.clusterCreateCallBack, 5000);
            }
        })
    }

    /*public submitCallBack(cluster: any) {
        this.clusterSerivice.create(cluster).then((result: any) => {
            this.logService.log(result);
            if (result.status === 202) {
                this.requestTrackingService.add(result.data, 'Creating Cluster \'' + cluster.clusterName + '\'');
              
                //yet to be done.
                var modal = this.modalHelper.successfulRequest(this.modalService, {
                    title: 'Create Cluster Request is Successful',
                    container: '.usmClientApp'
                });
                modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide) => {
                    $hide();
                    this.locationService.path('/clusters');
                });
                
                (result, cluster) => this.clusterCreateCallBack(result, cluster);
                this.timeoutSerivice(this.clusterCreateCallBack, 5000);
            } else {
                this.logService.error('Unexpected response from Clusters.create', result);
            }
        });
    }*/

    public submit() {
        var hosts: Array<Host>;

        _.each(this.hosts, (host: any) => {
            if (host.selected) {
                var nodeType: number = this.clusterType.ID === 1 ? 4 : (host.isMon ? 1 : 2);
                var localHost: any = {
                    nodeName: host.hostName,
                    managementIP: host.ipAddress,
                    clusterIP: host.ipAddress,
                    publicIP: host.ipAddress,
                    nodeType: nodeType
                };
                hosts.push(localHost);
            }
        });

        var cluster = {
            clusterName: this.clusterName,
            clusterType: this.clusterType.ID,
            storageType: this.storageType.ID,
            nodes: hosts
        };

        //(cluster) => this.submitCallBack(cluster);
    }
}

