// <reference path="../typings/tsd.d.ts" />

import {ServerService} from '../rest/server';
import {numeral} from '../base/libs';

export class HostDetailController {
    private hostList: Array<any>;
    private host: any;
    private id: any;
    private tabList: any;
    private tabIndex: any;

    //Services that are used in this class.
    static $inject: Array<string> = [
        '$q',
        '$scope',
        '$location',
        '$interval',
        '$log',
        '$routeParams',
        'ServerService'
    ];

    constructor(private qService: ng.IQService,
        private scopeService: ng.IScope,
        private locationService: ng.ILocationService,
        private intervalSvc: ng.IIntervalService,
        private logService: ng.ILogService,
        private routeParamsSvc: ng.route.IRouteParamsService,
        private serverService: ServerService) {
            this.hostList = [];
            this.host = {};
            this.tabList = {
                Overview: 1,
                Configuration: 2,
                OSDs: 3
            }
            this.tabIndex = this.tabList.Overview;
            this.id = this.routeParamsSvc['id'];
            this.serverService.getList().then((hosts: Array<any>) => {
                this.hostList = hosts;
                this.host = _.find(hosts, (host) => {
                    return host.nodeid === this.id;
                });
            });
    }

    public setTab(newTab: number) {
        this.tabIndex = newTab;
    }

    public isSet(tabNum: number) {
        return this.tabIndex === tabNum;
    }

}
