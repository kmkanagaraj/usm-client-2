// <reference path="../../../typings/tsd.d.ts" />

import {Cluster} from '../../rest/resources';
import {StorageProfile} from '../../rest/storage-profile';

import {ClusterService} from '../../rest/clusters';
import {StorageProfileService} from '../../rest/storage-profile';
import {StorageService} from '../../rest/storage';
import {RequestService} from '../../rest/request';
import {RequestTrackingService} from '../../requests/request-tracking-svc';
import * as ModalHelpers from '../../modal/modal-helpers';
import {GetCephPGsForOSD} from '../storage-util';

export class ObjectStorageController {
    private cluster: Cluster;
    private slus: any[];
    private name: string;
    private count: number = 1;
    private types = ['Replicated', 'Erasure Coded'];
    private type = 'Replicated';
    private replicas: number = 3;
    private sizeUnits = ['GB', 'TB'];
    private targetSize = { value: 0, unit: 'GB' };
    private profiles: StorageProfile[];
    private profile: StorageProfile;
    private pgs: number = 0;
    private pgSlider = {};
    private pools = [];

    static $inject: Array<string> = [
        '$routeParams',
        '$location',
        '$log',
        '$q',
        '$modal',
        'ClusterService',
        'StorageProfileService',
        'StorageService',
        'RequestTrackingService',
        'RequestService'
    ];
    constructor(private $routeParams: ng.route.IRouteParamsService,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private $q: ng.IQService,
        private $modal,
        private clusterSvc: ClusterService,
        private storageProfileSvc: StorageProfileService,
        private storageSvc: StorageService,
        private requestTrackingSvc: RequestTrackingService,
        private requestSvc: RequestService) {
        let clusterId = $routeParams['clusterid'];
        this.clusterSvc.get(clusterId).then(cluster => {
            this.cluster = cluster;
        });
        this.clusterSvc.getSlus(clusterId).then(slus => {
            var list = [];
            for (var i = 0; i < 60; i++) {
                list.push(slus[0]);
            }
            this.slus = list;
            this.pgs = GetCephPGsForOSD(list, 1024 * 1024 * 1024 * 5, 3);
        });
        this.storageProfileSvc.getList().then((profiles) => {
            this.profiles = profiles;
            this.profile = profiles[0];
        });
        this.pgSlider = {
            value: 12,
            options: {
                floor: 10,
                ceil: 100,
                step: 5,
                showTicks: true
            }
        };
    }

    public changeStorageProfile(selectedProfile: StorageProfile) {
        this.clusterSvc.getSlus(this.cluster.clusterid).then(slus => {
            this.slus = slus;
            this.pgs = GetCephPGsForOSD(slus, 100, 3);
        });
    }

    public prepareSummary(): void {
        for (let index = 0; index < this.count; index++) {
            let pool = {
                name: this.name + index,
                type: this.type,
                profile: this.profile,
                replicas: this.replicas,
                capacity: this.targetSize,
            }
            this.pools.push(angular.copy(pool));
        }
    }

    public cancel(): void {
        this.$location.path('/storage');
    }

    public submit(): void {
        var list = [];
        for (let pool of this.pools) {
            let storage = {
                name: pool.name,
                type: 'replicated',
                replicas: pool.replicas,
                size: pool.capacity.value + pool.capacity.unit,
            };
            console.log(storage);
            list.push(this.storageSvc.create(this.cluster.clusterid, storage));
        }
        this.$q.all(list).then((tasks) => {
            for (var task of tasks) {
                this.requestSvc.get(task.data.taskid).then((result) => {
                    this.requestTrackingSvc.add(result.id, result.name);
                });
            }
        });
        var modal = ModalHelpers.SuccessfulRequest(this.$modal, {
            title: 'Add Object Storage Request is Submitted',
            container: '.usmClientApp'
        });
        modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide) => {
            $hide();
            this.$location.path('/storage');
        });
    }
}
