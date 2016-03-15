// <reference path="../typings/tsd.d.ts" />

import {ServerService} from '../rest/server';
import {RequestService} from '../rest/request';
import {UtilService} from '../rest/util'
import {RequestTrackingService} from '../requests/request-tracking-svc';

export class AcceptHostsController {
    private discoveredHosts: Array<any>;
    private hostsBeingAccepted: Array<any>;
    private hostsAccepted: number;
    private hostsFailed: number;
    private timer;
    static $inject: Array<string> = ['$location', '$scope', '$interval', '$log', '$timeout', 'ServerService', 'RequestService', 'UtilService', 'RequestTrackingService'];
    constructor(
        private $location: ng.ILocationService,
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $log: ng.ILogService,
        private $timeout: ng.ITimeoutService,
        private serverSvc: ServerService,
        private requestSvc: RequestService,
        private utilSvc: UtilService,
        private requestTrackingSvc: RequestTrackingService) {
        this.discoveredHosts = [];
        this.hostsBeingAccepted = [];
        this.hostsAccepted = 0;
        this.hostsFailed = 0;
        this.timer = this.$interval(() => this.refreshHostsStatus(), 5000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.serverSvc.getDiscoveredHosts().then((discoverdHosts) => {
            _.each(discoverdHosts, (discoverdHost: any) => {
                var host = {
                    hostname: discoverdHost.hostname,
                    fingerPrint: discoverdHost.saltfingerprint,
                    state: "UNACCEPTED",
                    progress: 0
                };
                this.discoveredHosts.push(host);
            })
        })
    }

    public refreshHostsStatus() {
        _.each(this.hostsBeingAccepted, (host) => {
            if (host.state === "ACCEPTING") {
                this.requestSvc.get(host.taskid).then((task) => {
                    if (task.completed && task.status === 1) {
                        this.requestSvc.getList(undefined, undefined, undefined, undefined, undefined, 'Initialize Node: ' + host.hostname).then((data) => {
                            //Getting the initializing task for the particular host. Even if there are many failed initializing tasks for a given host, first one should be 
                            //either in progress task and last updated task.
                            host.taskid = data.tasks[0].id;
                            this.$log.info('Accepted host in Accept Hosts Controller ' + host.hostname);
                            host.state = "INITIALIZING";
                            host.progress = 2;
                        });
                    }
                    else if (task.completed && task.status === 2) {
                        this.$log.info('Failed to accept host in Accept Hosts Controller ' + host.hostname);
                        host.state = "FAILED";
                        this.hostsFailed++;
                    }
                });
            }
            else if (host.state === "INITIALIZING") {
                this.requestSvc.get(host.taskid).then((task) => {
                    if (task.completed && task.status === 1) {
                        this.$log.info('Initialized host in Accept Hosts Controller ' + host.hostname);
                        host.state = "INITIALIZED";
                        host.progress = 3;
                        host.lastupdated = task.statuslist[task.statuslist.length - 1].Timestamp;
                        this.hostsAccepted++;
                    }
                    else if (task.completed && task.status === 2) {
                        this.$log.info('Failed to accept host in Accept Hosts Controller ' + host.hostname);
                        host.state = "FAILED";
                        host.progress = 3;
                        host.lastupdated = task.statuslist[task.statuslist.length - 1].Timestamp;
                        this.hostsFailed++;
                    }
                });
            }
        });
    }

    public acceptAllHosts() {
        _.each(this.discoveredHosts, (host) => {
            if (host.state === 'UNACCEPTED') {
                this.acceptHost(host);
            }
        })
    }

    public acceptHost(host) {
        var saltfingerprint = {
            saltfingerprint: host.fingerPrint
        };

        this.utilSvc.acceptHost(host.hostname, saltfingerprint).then((result) => {
            this.$log.info(result);
            this.hostsBeingAccepted.push(host);
            host.state = "ACCEPTING";
            host.progress = 1;
            host.taskid = result.data.taskid;
        });
    }

    public showAcceptTaskDetails(host) {
        this.$location.path('/tasks/' + host.taskid);
    }

    public reinitialize(host) {
        var reinit = {
            action: "reinitialize"
        };
        this.serverSvc.reinitialize(reinit, host.hostname).then((result) => {
            if (result.status === 200) {
                host.taskid = result.data.taskid;
                host.state = "INITIALIZING";
                this.hostsFailed--;
            }
        });
    }

    public continue() {
        this.$location.path('/clusters/new');
    }

    public cancel() {
        this.$location.path('/clusters');
    }
}