/// <reference path="../../../typings/tsd.d.ts" />

export class PoolService {
    rest: restangular.IService;
    restFull: restangular.IService;
    static $inject: Array<string> = ['Restangular'];
    constructor(rest:restangular.ICollection) {
        this.rest = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('/api/v1/ceph/');
        });
        this.restFull = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('/api/v1/ceph/');
            RestangularConfigurer.setFullResponse(true);
        });
    }

    // **getList**
    // **@returns** a promise with all pools.
    getList() {
        return this.rest.all('pools').getList().then(function(osds) {
            return osds;
        });
    }

    // **getListByCluster
    // **@returns** a promise with all pools of the cluster.
    getListByCluster(clusterId) {
        return this.rest.all('pools').getList().then(function(pools) {
            return _.filter(pools, function(pool) {
                return pool.cluster === clusterId;
            });
        });
    }

    // **get**
    // **@returns** a promise with pool metadata.
    get(id) {
        return this.rest.one('pools', id).get().then(function(pool) {
            return pool;
        });
    }

    // **create**
    // **@param** osds - Information about the list of pools.
    // **@returns** a promise which returns a request id to track the task.
    create(pools) {
        return this.rest.all('pools').post(pools);
    }
}