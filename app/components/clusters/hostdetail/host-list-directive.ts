/// <reference path="../../../../typings/tsd.d.ts" />

/*
 * @ngdoc directive
 * @name cluster:HostListDirective
 * @scope
 * @restrict E
 *
 * @description
 * An AngularJS directive for showing the list of hosts in cluster.
 *
 * @example
 * <cluster-host-detail cluster-id="clusterid"></cluster-host-detail>
 *
*/

import {ClusterHostDetailController} from './host-detail';

export class HostListDirective implements ng.IDirective {
    restrict: string = "E";
    scope = {
        id: '=clusterId'
    };
    controllerAs: string = 'hosts';
    bindToController: boolean = true;
    controller = ClusterHostDetailController;
    templateUrl = 'views/hosts/host-list.html';
}
