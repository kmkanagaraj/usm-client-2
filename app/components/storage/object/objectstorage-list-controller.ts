/// <reference path="../../../../typings/tsd.d.ts" />

import {UtilService} from '../../rest/util';
import {ClusterService} from '../../rest/clusters';
import {StorageService} from '../../rest/storage';
import {RequestService} from '../../rest/request';
import {RequestTrackingService} from '../../requests/request-tracking-svc';
import {numeral} from '../../base/libs';
import * as ModalHelpers from '../../modal/modal-helpers';

export class ObjectStorageListController {
    private clusterId: string;
    private list: Array<any>;
    private clusterMap = {};
    private timer;
    private name;
    private replicas;
    private capacity;
    private ecprofile;
    private ecprofiles = [{ k: 2, m: 1, text: '2+1', value: 'default' }, { k: 4, m: 2, text: '4+2', value: 'k4m2' }, { k: 6, m: 3, text: '6+3', value: 'k6m3' }, { k: 8, m: 4, text: '8+4', value: 'k8m4' }];
    private quota = { enabled: false, objects: { enabled: false, value: undefined }, percentage: { enabled: false, value: undefined} };
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$location',
        '$log',
        '$timeout',
        '$q',
        '$modal',
        'ClusterService',
        'StorageService',
        'RequestService',
        'RequestTrackingService'
    ];
    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private $timeout: ng.ITimeoutService,
        private $q: ng.IQService,
        private $modal: any,
        private clusterSvc: ClusterService,
        private storageSvc: StorageService,
        private requestSvc: RequestService,
        private requestTrackingSvc: RequestTrackingService) {
        /*this.timer = this.$interval(() => this.refresh(), 5000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });*/
        this.refresh();
    }

    public refresh() {
        if (this.clusterId) {
            // Current storage resource doesn't have cluster name, so here
            // we are fetching the cluster(s) in the system
            // This code will be removed once the storage resource includes
            // cluster name
            this.clusterSvc.get(this.clusterId).then((cluster) => {
                this.clusterMap[cluster.clusterid] = cluster;
                return this.storageSvc.getListByCluster(this.clusterId);
            }).then(list => {
                this.loadData(list);
            });
        }
        else {
            this.clusterSvc.getList().then((clusters: Array<any>) => {
                var requests = [];
                _.each(clusters, (cluster) => {
                    this.clusterMap[cluster.clusterid] = cluster;
                });
                return this.storageSvc.getList();
            }).then(list => {
                this.loadData(list);
            });
        }
    }

    public loadData(storages) {
        this.list = storages;
    }

    public getClusterName(clusterid) {
        return this.clusterMap[clusterid].name;
    }

    public create() {
        this.$location.path('/storage/new');
    }

    public remove(storage) {
        var modal = ModalHelpers.RemoveConfirmation(this.$modal, {
        });
        modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide, confirmed: boolean) => {
            if (confirmed) {
                this.storageSvc.delete(storage.clusterid, storage.storageid).then((task) => {
                    this.requestSvc.get(task.data.taskid).then((result) => {
                        this.requestTrackingSvc.add(result.id, result.name);
                    });
                });
            }
            $hide();
        });
    }

    public update(storage): void {
            this.storageSvc.get(storage.clusterid, storage.storageid).then((result) => {
                this.capacity = numeral().unformat(result.size);
            });
            var poolName = {
                name: this.name
            };
            let pool;
            if (storage.type === 'Replicated') {
                 pool['replicas'] = this.replicas;
            }
            else {
                 pool.options['ecprofile'] = this.ecprofile.value;
            }

            if (this.quota.enabled) {
                pool['quota_enabled'] = true;
                pool['quota_params'] = {};
                if (this.quota.objects.enabled) {
                    pool['quota_params'].quota_max_objects = this.quota.objects.value.toString();
                }
                if (this.quota.percentage.enabled) {
                    pool['quota_params'].quota_max_bytes = Math.round((this.quota.percentage.value / 100) * this.capacity).toString();
                }
            }
            // PoolName should be update seperately... so that here making two different calls
             this.storageSvc.update(storage.clusterid, storage.storageid, poolName);
             this.storageSvc.update(storage.clusterid, storage.storageid, pool);
             this.name = this.capacity;
      }
}
