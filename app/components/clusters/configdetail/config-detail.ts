// <reference path="../typings/tsd.d.ts" />

import {ClusterService} from '../../rest/clusters';

export class ConfigDetailController {
    private id: any;
    private configData: any;

    //Services that are used in this class.
    static $inject: Array<string> = [
        '$q',
        '$scope',
        '$log',
        'ClusterService',
    ];

    constructor(private qService: ng.IQService,
        private scopeService: ng.IScope,
        private logService: ng.ILogService,
        private clusterService: ClusterService) {
            this.configData = {};
            this.clusterService.getClusterConfig(this.id).then((cluster_config: any) => {
               this.configData = cluster_config;
            });
    }
}
