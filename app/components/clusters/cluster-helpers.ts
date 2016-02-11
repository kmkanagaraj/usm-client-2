// <reference path="../typings/tsd.d.ts" />
// <reference path="./cluster-modal.ts" />

import {ServerService} from '../rest/server';
import {RequestService} from '../rest/request';
import {UtilService} from '../rest/util';
import {ClusterState} from './cluster-modals';
import {OpenstackService} from './cluster-modals';
import {KeyValue} from './cluster-modals';
import {Cluster} from './cluster-modals';
import {Node} from './cluster-modals';

export class ClusterHelper     {  
    public clusterTypes : Array<Cluster>;
    public openstackServices: Array<OpenstackService>;
    public clusterStates : Array<ClusterState>;
    public clusterSystemPerformance : Array<any>;
    
    constructor(private utilService : UtilService,
        private requestService : RequestService,
        private logService : ng.ILogService,
        private timeoutService : ng.ITimeoutService)    {

        //Different types of clusters.
        this.clusterTypes = [
            { ID: 1, type: 'gluster', desc: 'Gluster' },
            { ID: 2, type: 'ceph', desc: 'Ceph' }
        ];

        this.openstackServices = [
            { name: 'cinder', desc: 'Cinder (Block Volumes)' },
            { name: 'cinder-backup', desc: 'Cinder Backup (Block Volumes backup)' },
            { name: 'glance', desc: 'Glance (Images and Snapshots)' },
            { name: 'nova', desc: 'Nova (Ephemeral Storage)' },
        ];

        //This property indicates the states that a cluster can have.
        this.clusterStates = [
            { ID:1, state:'Inactive'},
            { ID:2, state:'Not Available'},
            { ID:3, state:'Active'},
            { ID:4, state:'Creating'},
            { ID:5, state:'Failed'}
        ];

        this.clusterSystemPerformance = [];
    }

    public getClusterSystemPerformance() : Array<any>{
        var today = new Date();
        var dates = [];
        dates.push("dates");
        for (var d = 20 - 1; d >= 0; d--) {
             dates.push(new Date(today.getTime() - (d * 24 * 60 * 60 * 1000)));
        }
        this.clusterSystemPerformance = [
            {
                title: "CPU utilization",
                data: {
                      dataAvailable: true,
                      total: 250,
                      xData: dates,
                      yData: ['used', 10, 20, 30, 20, 30, 10, 14, 20, 25, 68, 54, 56, 78, 56, 67, 88, 76, 65, 87, 76]
                },
                config: {
                    chartId      : 'exampleTrendsChart1',
                    title        : 'Network Utilization Trends',
                    layout       : 'inline',
                    valueType    : 'actual',
                    timeFrame    : 'Last 15 Minutes',
                    units        : 'MHz',
                    tooltipType  : 'percentage'
                }
            },
            {
                title: "Memory utilization",
                data: {
                      dataAvailable: true,
                      total: 250,
                      xData: dates,
                      yData: ['used', 30, 20, 30, 20, 10, 20, 44, 20, 25, 68, 5, 56, 78, 56, 50, 88, 16, 65, 87, 76]
                },
                config: {
                    chartId      : 'exampleTrendsChart2',
                    title        : 'Network Utilization Trends',
                    layout       : 'inline',
                    valueType    : 'actual',
                    timeFrame    : 'Last 15 Minutes',
                    units        : 'MHz',
                    tooltipType  : 'percentage'
                }
            },
            {
                title: "IOPS",
                data: {
                      dataAvailable: true,
                      total: 150,
                      xData: dates,
                      yData: ['used', 10, 20, 30, 20, 10, 30, 44, 20, 25, 68, 5, 56, 78, 56, 50, 88, 16, 65, 87, 76]
                },
                config: {
                    chartId      : 'exampleTrendsChart3',
                    title        : 'Network Utilization Trends',
                    layout       : 'inline',
                    valueType    : 'actual',
                    timeFrame    : 'Last 15 Minutes',
                    units        : 'MHz',
                    tooltipType  : 'percentage'
                }
            },
            {
                title: "Throughput",
                data: {
                      dataAvailable: true,
                      total: 450,
                      xData: dates,
                      yData: ['used', 30, 20, 30, 20, 10, 30, 44, 20, 25, 68, 5, 56, 78, 56, 50, 88, 16, 65, 87, 76]
                },
                config: {
                    chartId      : 'exampleTrendsChart4',
                    title        : 'Network Utilization Trends',
                    layout       : 'inline',
                    valueType    : 'actual',
                    timeFrame    : 'Last 15 Minutes',
                    units        : 'MHz',
                    tooltipType  : 'percentage'
                }
            },
            {
                title: "Latency",
                data: {
                      dataAvailable: true,
                      total: 300,
                      xData: dates,
                      yData: ['used', 30, 20, 30, 20, 10, 30, 44, 20, 15, 68, 5, 56, 78, 36, 50, 88, 16, 65, 87, 76]
                },
                config: {
                    chartId      : 'exampleTrendsChart5',
                    title        : 'Network Utilization Trends',
                    layout       : 'inline',
                    valueType    : 'actual',
                    timeFrame    : 'Last 15 Minutes',
                    units        : 'MHz',
                    tooltipType  : 'percentage'
                }
            }

        ];
        return this.clusterSystemPerformance;
    }

    public  getClusterTypes() : Array<Cluster>{
        return this.clusterTypes;
    }
    
    public getClusterType(type: string) {
        return _.find(this.clusterTypes, function(clusterType) {
            return clusterType.type === type;
        });
    }

    public getOpenStackServices(): Array<OpenstackService> {
        return this.openstackServices;
    }

    public getClusterStatus(id : number)  : ClusterState{
        return _.find(this.clusterStates, function(type) {
            return type.ID === id;
        });
    }

    public callBack(cluster :any,  host : any, result : any) {
        this.requestService.get(result).then((request) => {
            if(request.status === "FAILED" || request.status === "FAILURE")    {
                this.logService.info('Failed  to accept host ' + host.hostname);
                host.state = "FAILED";
                host.task = undefined;
            } else if(request.status === "SUCCESS")    {
                this.logService.info('Accepted Host ' + host.hostname);
                host.state = "ACCEPTED";
                host.task = undefined;
                    cluster.postAcceptHost(host);
            } else {
                this.logService.info('Accepting Host ' + host.hostname);
                this.timeoutService(()=>this.callBack(cluster,host,result), 5000);
            }
        });
    }
    
    /**
     * This function helps in accepting a host that already exsist.
     */
    public acceptHost(cluster : any, host : any)    {
       
        var saltfingerprint = {
            saltfingerprint: host.saltfingerprint
        };
        
        this.utilService.acceptHost(host.hostname, saltfingerprint).then((result) => {
            this.logService.info(result);
            host.state = "ACCEPTING";
            host.task = result;
            this.callBack(cluster, host, result);
            this.timeoutService(()=>this.callBack(cluster,host,result), 5000);  
        });
    }
    
    /**
     * This function helps in accepting a new host that comes in.
     */
    public acceptNewHost(cluster : any,  host : any)    {
        var hosts : any;
        hosts = {
            nodes:[
               {
                    "node_name" : host.hostname,
                    "management_ip" : host.ipaddress,
                    "ssh_username" : host.username,
                    "ssh_password" : host.password,
                    "ssh_key_fingerprint" : host.fingerprint,
                    "ssh_port" :22
               }
            ]
        };     
        // this.utilService.acceptHosts(hosts).then((result) => {
        //     this.logService.info(result);
        //     host.state = "ACCEPTING";
        //     host.task = result;
        //     this.callBack(cluster, host, result);
        //     this.timeoutService(()=>this.callBack(cluster,host,result), 5000);
        // });
    }    
    
    /**
     * This function helps in adding a  new host with all its properties.
    */
    public addNewHost(cluster : any, severService: ServerService, $timeout: ng.ITimeoutService, requestSvc: RequestService)    {
         var newHost = cluster.newHost;
         newHost.isVerifyingHost = true;
         newHost.errorMessage = "";    
         newHost.cautionMessage = "";
         var hostObject = {
             "hostname": newHost.hostname,
             "sshfingerprint": newHost.sshfingerprint,
             "user": newHost.username,
             "password": newHost.password
         };
        //This called on success[promise].
        severService.add(hostObject).then((result) => {
            var taskid = result.data.taskid;
            var callback = function() {
                requestSvc.get(taskid).then((task) => {
                    if (task.completed) {
                        console.log('Added host ' + hostObject.hostname);
                        cluster.newHost = {}
                        cluster.fetchFreeHosts();
                    }
                    else {
                        console.log('Adding host ' + hostObject.hostname);
                        $timeout(callback, 5000);
                    }
                });
            }
            $timeout(callback, 5000);
        },
        //This a called on failure[promise].
         () => {
            cluster.newHost.cautionMessage = 'Authentication Error!.';
            cluster.newHost.errorMessage = " The username and password is incorrect.";
            cluster.newHost.isVerifyingHost = false;
        });
    }
}
