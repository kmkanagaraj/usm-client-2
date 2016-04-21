/// <reference path="../../../../typings/tsd.d.ts" />

/*
 * @ngdoc directive
 * @name host:host-osd
 * @scope
 * @restrict E
 *
 * @description
 * An AngularJS directive for showing the osd detail of the host.
 *
 * @example
 * <host-osd host-id="hostdetail.id"></host-osd>
 *
*/

import {HostOsdController} from './host-osd';

export class HostOsd implements ng.IDirective {
    restrict: string = "E";
    scope = {
        id: '=hostId'
    };
    controllerAs: string = 'hostosd';
    bindToController: boolean = true;
    controller = HostOsdController;
    templateUrl = 'views/hosts/host-osd/host-osd.html';
}
