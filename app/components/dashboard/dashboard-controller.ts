import {ClusterService} from '../rest/clusters';
import {ServerService} from '../rest/server';
import {VolumeService} from '../rest/volume';
import {PoolService} from '../rest/pool';

declare var require : any;
var numeral = require("numeral");

export class DashboardController {
    private self = this;
    private config;
    private clusters;
    private clustersWarning;
    private clustersCritical;
    private hosts;
    private hostsWarning;
    private hostsCritical;
    private volumes;
    private volumesWarning;
    private volumesCritical;
    private pools;
    private poolsWarning;
    private poolsCritical;
    private services;
    private servicesWarning;
    private servicesCritical;
    
    private clusterTypes;
    private storageTiers;
    private totalCapacity;
    private trendCapacity;


    static $inject: Array<string> = [
        '$scope',
        '$location',
        '$log',
        'ClusterService',
        'ServerService',
        'VolumeService',
        'PoolService',
    ];

    constructor(private $scope: ng.IScope,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private clusterService: ClusterService,
        private serverService: ServerService,
        private volumeService: VolumeService,
        private poolService: PoolService) {


         this.config = { capacityByType: true, capacityByTier: false };
         this.clusterTypes = [
            { id:1, name: 'Block', color: '#48b3ea', type: 'donut' },
            { id:2, name: 'File', color: '#0088ce' ,type: 'donut' },
            { id:3, name: 'Object', color: '#00659c', type: 'donut' },
            { id:9, name: 'Free', color: '#969696', type: 'donut' } ];
         this.storageTiers = [
            { id:1, name: 'Default', color: '#48b3ea', type: 'donut' },
            { id:2, name: 'Faster', color: '#0088ce', type: 'donut' },
            { id:3, name: 'Slower', color: '#00659c', type: 'donut' },
            { id:9, name: 'Free', color: '#969696', type: 'donut' } ];
         this.totalCapacity = {
                freeGB: 0, usedGB: 0, totalGB: 0,
                freeFormatted: '0 B', usedFormatted: '0 B', totalFormatted: '0 B'
            };

         this.totalCapacity.legends = this.clusterTypes;
         this.totalCapacity.values = [];
         this.totalCapacity.byType = [];
         this.totalCapacity.byTier = [];
         this.services = [];

         this.trendCapacity = {};
         this.trendCapacity.legends = [
                { id:1, name: 'Used', color: '#39a5dc', type: 'area-spline' }
         ];
         this.trendCapacity.values = [];
         this.trendCapacity.selected = { used: 0, isTotal: true, type: '' };

         
         this.serverService.getList().then(this.hostPromise);
         this.clusterService.getList().then(this.updateData);
         this.volumeService.getList().then(this.volumePromise);
         this.poolService.getList().then(this.poolPromise);
    }


    //This is to fix the 'this' problem with callbacks
    //Refer https://github.com/Microsoft/TypeScript/wiki/'this'-in-TypeScript#use-instance-functions
    updateData = (clusters: any) => {
        _.each(_.range(0, 10), function(index) {
            this.services.push({ id: index });
        });
        if (clusters.length === 0) {
            this.$location.path('/first');
        }else {
            
            this.clusters = clusters;
            var requests = [];
            _.each(this.clusters, function(cluster: any) {
                if(cluster.cluster_status === 1 || cluster.cluster_status === 2) {
                    this.clustersWarning.push(cluster);
                }
                else if(cluster.cluster_status === 5) {
                    this.clustersCritical.push(cluster);
                }

                cluster.capacity = { totalGB: 0, usedGB: 0, freeGB: 0 };
                this.clusterService.getCapacity(cluster.cluster_id).then(function(sizeGB) {
                    cluster.capacity.totalGB = sizeGB,
                    cluster.capacity.usedGB = cluster.used,
                    cluster.capacity.freeGB = cluster.capacity.totalGB - cluster.capacity.usedGB;
                    this.calculateTotalCapacity();
                });

                var iops = _.random(30000,60000);
                var iopsFormatted = numeral(iops).format('0,0');
                var bandwidth = _.random(500, 1500);
                var bandwidthFormatted = numeral(bandwidth).format('0,0');
                cluster.perf = {
                    iops: iops,
                    iopsFormatted: iopsFormatted,
                    bandwidth: bandwidth,
                    bandwidthFormatted: bandwidthFormatted
                };

                if(cluster.cluster_type === 1) {
                    this.volumeService.getListByCluster(cluster.cluster_id).then(function(volumes) {
                        cluster.volumes = volumes;
                        cluster.volumes.push({ id: 100, usage: 75 });
                        _.each(_.range(cluster.volumes.length, 15), function(index) {
                            cluster.volumes.push({id: _.random(0, 100), usage: _.random(0, 70)});
                        });
                        _.each(_.range(cluster.volumes.length, 25), function(index) {
                            cluster.volumes.push({id: _.random(0, 100), usage: _.random(0, 95)});
                        });
                    });
                }
                else {
                    this.poolService.getListByCluster(cluster.cluster_id).then(function(pools) {
                        cluster.pools = pools;
                        cluster.pools.push({ id: 100, usage: 75 });
                        _.each(_.range(cluster.pools.length, 15), function(index) {
                            cluster.pools.push({id: _.random(0, 100), usage: _.random(0, 70)});
                        });
                        _.each(_.range(cluster.pools.length, 25), function(index) {
                            cluster.pools.push({id: _.random(0, 100), usage: _.random(0, 95)});
                        });
                    });
                }
            });
            this.calculateTotalCapacity();

        }
    }

    /**
     *This is the callback function called after getting hosts list. 
    */
    hostPromise = (hosts: any) => {
       this.hosts = hosts;
        _.each(this.hosts, function(host: any) {
            if(host.node_status === 1) {
                this.hostsWarning.push(host);
            }
            var cpu = _.random(70, 85);
            var memory = _.random(70, 85);
            host.perf = { cpu: cpu, memory: memory };
        });
    }

    /**
     *This is the callback function called after getting volumes list. 
    */
    volumePromise = (volumes: any) => {
       this.volumes = volumes;
        _.each(this.volumes, function(volume: any) {
            if(volume.volume_status === 1) {
                this.volumesWarning.push(volume);
            }
            else if(volume.volume_status === 2) {
                this.volumesCritical.push(volume);
            }
        });
    }

    /**
     *This is the callback function called after getting pools list. 
    */
    poolPromise = (pools: any) => {
       this.pools = pools;
    }




    public getRandomList(key: string , count: number, min: number, max: number) {
        var list = [];
        min = min > 0 ? min : 0;
        _.each(_.range(count), function(index) {
            var value = {};
            value[key] = _.random(min, max, true);
            list.push(value);
        });
        return list;
    }


    /**
     * calculateTotalCapacity function
     */
     public calculateTotalCapacity() {
        var byType = [0, 0, 0]; // block, file, object
        var byTier = [0, 0, 0]; // default, fast, slower
        var totalFreeGB = 0;
        var totalUsedGB = 0;

        _.each(this.clusters, function(cluster: any) {
            var used = byType[cluster.storage_type-1];
            used = used + cluster.capacity.usedGB;
            byType[cluster.storage_type-1] = used;
            byTier[0] = byTier[0] + used;
            totalFreeGB = totalFreeGB + cluster.capacity.freeGB;
            totalUsedGB = totalUsedGB + cluster.capacity.usedGB;
        });

         this.totalCapacity.byType = [
            { '1': byType[0] },
            { '2': byType[1] },
            { '3': byType[2] },
            { '9': totalFreeGB }
        ];

         this.totalCapacity.byTier = [
            { '1': byTier[0] },
            { '2': byTier[1] },
            { '3': byTier[2] },
            { '9': totalFreeGB }
        ];

        this.totalCapacity.freeGB = totalFreeGB;
        this.totalCapacity.usedGB = totalUsedGB;
        this.totalCapacity.totalGB = totalFreeGB + totalUsedGB;
        //this.totalCapacity.usedPercentage = ((totalFreeGB * 100) / (totalUsedGB + totalFreeGB)).toFixed(0);
        this.totalCapacity.freeFormatted = numeral(totalFreeGB * 1073741824).format('0.0 b');
        this.totalCapacity.usedFormatted = numeral(totalUsedGB * 1073741824).format('0.0 b');
        this.totalCapacity.totalFormatted = numeral((totalFreeGB + totalUsedGB) * 1073741824).format('0.0 b');


        if(this.config.capacityByType) {
            this.totalCapacity.legends = this.clusterTypes;
            this.totalCapacity.values = this.totalCapacity.byType;
        }
        else {
            this.totalCapacity.legends = this.storageTiers;
            this.totalCapacity.values = this.totalCapacity.byTier;
        }
        this.trendCapacity.values = this.getRandomList('1', 50, totalUsedGB-(totalUsedGB * 0.1), totalUsedGB);
        this.trendCapacity.selected.used = totalUsedGB;
        this.trendCapacity.selected.usedFormatted = numeral(totalUsedGB * 1073741824).format('0.0 b');
    }    

    public switchCapacityCategory(execute: any) {
        if(execute) {
            this.config.capacityByType = !this.config.capacityByType;
            this.config.capacityByTier = !this.config.capacityByTier;
            if(this.config.capacityByType) {
                this.totalCapacity.legends = this.clusterTypes;
                this.totalCapacity.values = this.totalCapacity.byType;
            }
            else {
                this.totalCapacity.legends = this.storageTiers;
                this.totalCapacity.values = this.totalCapacity.byTier;
            }
        }
    }

    public selectClusterCapacityLegend(data: any) {
        var isFreeSelected = data.id === '9';
        var usedGB = isFreeSelected ? this.totalCapacity.usedGB : data.value;
        this.trendCapacity.values = this.getRandomList('1', 50, usedGB-(usedGB * 0.1), usedGB);
        this.trendCapacity.selected.used = usedGB;
        this.trendCapacity.selected.usedFormatted = numeral(usedGB * 1073741824).format('0 b');
        this.trendCapacity.selected.isTotal = isFreeSelected;
        this.trendCapacity.selected.type = data.name;
    }

    public getHeatLevel(usage: number) {
        if(usage > 90) {
            return 'heat-l0';
        }
        else if (usage > 80) {
            return 'heat-l1';
        }
        else if (usage > 70) {
            return 'heat-l2';
        }
        else {
            return 'heat-l3';
        }
    }


}
