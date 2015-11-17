/// <reference path="../../../typings/tsd.d.ts" />
declare function require(name: string);

var idbWrapper = require('idb-wrapper');

import {UserService} from '../rest/user';
import {ServerService} from '../rest/server';
import {RequestTrackingService} from './request-tracking-svc';
import {UtilService} from '../rest/util';
import {RequestService} from '../rest/request';

export class RequestsController {
   private tasks;
   private events : Array<any>;
   private discoveredHosts : Array<any>;
   private discoveredHostsLength: number;
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$timeout',
        '$log',
        'ServerService',
        'UtilService',
        'RequestService',
        'RequestTrackingService',
        'UserService'];

    constructor(private $scope: any,
        private $interval: ng.IIntervalService,
        private $timeout: ng.ITimeoutService,
        private $log: ng.ILogService,
        private serverSvc: ServerService,
        private utilSvc: UtilService,
        private requestSvc: RequestService,
        private requestTrackingService: RequestTrackingService,
        private userSvc: UserService) {
        this.events = [];
        this.tasks = {};
        this.discoveredHostsLength = 0;
        this.discoveredHosts = [];
        this.$interval(() => this.reloadEvents(), 5000);
        this.$interval(() => this.reloadDiscoveredHosts(), 5000);
    }

    public reloadEvents() {
        this.serverSvc.getEvents().then((events) => {
            this.events = [];
            _.each(events, (event: any) => {
                var tempEvent = {
                    message: event.message,
                    nodeName: event.tag.split("/")[2]
                };
                this.events.push(tempEvent);
            });
        });
    }

    public reloadTasks() {
        this.requestTrackingService.getTrackedRequests().then((tasks) => {
            this.tasks = tasks;
        });
    }


    public logoutUser() {
        this.userSvc.logout().then((logout) => {
            document.location.href = '';
        });
    }

    public reloadDiscoveredHosts() {

        this.discoveredHosts = _.filter(this.discoveredHosts, (host: any) => {
            return host.state !== "ACCEPTED" && host.state !== "UNACCEPTED";
        });

        this.serverSvc.getDiscoveredHosts().then((freeHosts) => {

            this.discoveredHostsLength = freeHosts.length;

            _.each(freeHosts, (freeHost: any) => {
                var host = {
                    hostname: freeHost.hostname,
                    saltfingerprint: freeHost.saltfingerprint,
                    state: "UNACCEPTED",
                    selected: false
                };

                var isPresent = false;

                isPresent = _.some(this.discoveredHosts, (dHost: any) => {
                    return dHost.hostname === host.hostname;
                });

                if (!isPresent) {
                    this.discoveredHosts.push(host);
                }
            });
        });
    }

    public acceptHost(host) {
        var saltfingerprint = {
            saltfingerprint: host.saltfingerprint
        };

        this.utilSvc.acceptHost(host.hostname, saltfingerprint).then((result) => {
            this.$log.info(result);
            host.state = "ACCEPTING";
            host.task = result;
            var callback = () => {
                this.requestSvc.get(result).then((request) => {
                    if (request.status === 'FAILED' || request.status === 'FAILURE') {
                        this.$log.info('Failed to accept host in requests controller' + host.hostname);
                        host.state = "FAILED";
                        host.task = undefined;
                    }
                    else if (request.status === 'SUCCESS') {
                        this.$log.info('Accepted host in requests controller ' + host.hostname);
                        host.state = "ACCEPTED";
                        host.task = undefined;
                    }
                    else {
                        this.$log.info('Accepting host in requests controller' + host.hostname);
                        this.$timeout(callback, 5000);
                    }
                });
            }
            this.$timeout(callback, 5000);
        });
    }

    public openDiscoveredHostsModel() {
        document.getElementById("openDiscoveredHosts").click();
    }

    public acceptAllHosts() {
        _.each(this.discoveredHosts, (host: any) => {
            if (host.state === "UNACCEPTED") {
                this.acceptHost(host);
            }
        });
    }
}
    