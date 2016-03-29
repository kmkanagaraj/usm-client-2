/// <reference path="../../../../typings/tsd.d.ts" />

/*
 * @ngdoc directive
 * @name cluster:clusterConfigDetail
 * @scope
 * @restrict E
 *
 * @description
 * An AngularJS directive for showing the configuration of cluster.
 *
 * @example
 * <cluster-config-detail cluster-id="clusterid"></cluster-config-detail>
 *
*/

import {ConfigDetailController} from './config-detail';

export class ClusterConfigDetail implements ng.IDirective {
    restrict: string = "E";
    scope = {
        id: '=clusterId'
    };
    controllerAs: string = 'configdetail';
    bindToController: boolean = true;
    controller = ConfigDetailController;
    templateUrl = 'views/clusters/configdetail/config-detail.html';
}
