/// <reference path="../../../../typings/tsd.d.ts" />

/*
 * @ngdoc directive
 * @name cluster:clusterHostDetail
 * @scope
 * @restrict E
 *
 * @description
 * An AngularJS directive for showing the details of hosts in cluster.
 *
 * @example
 * <cluster-host-detail cluster-id="clusterid"></cluster-host-detail>
 *
*/

import {ClusterHostDetailController} from './host-detail';

export class ClusterHostDetail implements ng.IDirective {
    restrict: string = "E";
    scope = {
        id: '=clusterId'
    };
    controllerAs: string = 'clusterhostdetail';
    bindToController: boolean = true;
    controller = ClusterHostDetailController;
    templateUrl = 'views/clusters/hostdetail/host-detail.html';
}
