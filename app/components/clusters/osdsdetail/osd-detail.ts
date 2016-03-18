// <reference path="../typings/tsd.d.ts" />

import {ClusterService} from '../../rest/clusters';
import {RequestService} from '../../rest/request';
import {RequestTrackingService} from '../../requests/request-tracking-svc';
import * as ModalHelpers from '../../modal/modal-helpers';
import {numeral} from '../../base/libs';

export class OsdDetailController {
    private id: any;
    private osdList: Array<any>;
    private osdListGroupBy: any;
    private filterList: any;
    private selection: any;
    private filterBy: any;
    private utils: any;
    private isLeftSidebarShow: boolean;
    private flags: any;
    private filteredOSD: any;

    //Services that are used in this class.
    static $inject: Array<string> = [
        '$q',
        '$modal',
        '$scope',
        '$timeout',
        '$log',
        'ClusterService',
        'RequestService',
        'RequestTrackingService'
    ];

    constructor(private qService: ng.IQService,
        private $modal: any,
        private scopeService: ng.IScope,
        private timeoutService: ng.ITimeoutService,
        private logService: ng.ILogService,
        private clusterService: ClusterService,
        private requestSvc: RequestService,
        private requestTrackingSvc: RequestTrackingService) {

        this.filteredOSD = {};
        this.isLeftSidebarShow = true;
        this.selection = { activeOsd: {} ,allSelectedOsds: {} };
        this.filterBy = { osdStatus: {} ,utilization: {}, active: 'osd_status' };
        this.utils = { keys: Object.keys, numeral: numeral};
        this.filterList = {};
        this.flags = { showAll: false, activeOsdFlag: false };
        this.filterList.OSDStatus = [
            {name: "Up-In", icon: "pficon pficon-ok", enabled: false},
            {name: "Up-Out", icon: "pficon pficon-warning-triangle-o", enabled: false},
            {name: "Down-In", icon: "pficon pficon-warning-triangle-o", enabled: false},
            {name: "Down", icon: "fa fa-arrow-circle-o-down down-color", enabled: false}
        ];
        this.filterList.PGStatus = [
            {name: "active", enabled: false},
            {name: "clean", enabled: false},
            {name: "creating", enabled: false},
            {name: "replay", enabled: false},
            {name: "splitting", enabled: false},
            {name: "scrubbing", enabled: false},
            {name: "degraded", enabled: false},
            {name: "undersized", enabled: false},
            {name: "repair", enabled: false},
            {name: "recovery", enabled: false},
            {name: "backfill", enabled: false},
            {name: "remapped", enabled: false},
            {name: "down", enabled: false},
            {name: "inconsistent", enabled: false},
            {name: "peering", enabled: false},
            {name: "incomplete", enabled: false},
            {name: "stale", enabled: false},
        ];
        this.filterList.Utilization = [
            {name: "Full (95% or more)", icon: "progress-bar-full", enabled: false},
            {name: "Near Full (85% or more)", icon: "progress-bar-near-full", enabled: false},
            {name: "50% - 85%", icon: "progress-bar-average", enabled: false},
            {name: "Less than 50%", icon: "progress-bar-normal", enabled: false}
        ];
        this.getOSDs();
        this.scopeService.$watch(() => { return this.filteredOSD; }, (newValue, oldValue) => {
            this.flags.activeOsdFlag = false;
            _.forOwn(this.filteredOSD, (value, key) => {
                if ( value.length > 0 && !this.flags.activeOsdFlag ) {
                    this.selection.activeOsd = value[0];
                    this.flags.activeOsdFlag = true;
                }
            });
        },true);
    }

    public getOSDs() {
        this.clusterService.getSlus(this.id).then((slus: Array<any>) => {
            this.osdList = [{"sluid":"820osdgsd4119-3756-4ae9-a8a7-f8b9918c339b","name":"osd.0","type":1,"clusterid":"7bc97289-9d10-4763-b563-82d6053a38d6"
,"nodeid":"c3fe5fb6-62bf-45ec-ba84-db3d42440966","storageid":"00000000-0000-0000-0000-000000000000","storagedeviceid"
:"34a61ddf-5b9e-4e48-b994-3054cdb475fd","storagedevicesize":322122547200,"status":1,"options1":{"clusterip4"
:"10.70.46.27","device":"/dev/vdc","fstype":"xfs","in":"false","node":"dhcp46-28.lab.eng.blr.redhat.com"
,"pgsummary":{"active+undersized+degraded":102,"creating+incomplete":37},"publicip4":"10.70.46.27","up"
:"true"},"storageprofile":"general","state":"Out","almstatus":5,"almcount":0,"usage":{"used":23,"total"
:100,"percentused":23}},{"sluid":"820dsd4svg-3756-4ae9-a8a7-f8b9918c339b","name":"osd.0","type":1,"clusterid":"7bc97289-9d10-4763-b563-82d6053a38d6"
,"nodeid":"c3fe5fb6-62bf-45ec-ba84-db3d42440966","storageid":"00000000-0000-0000-0000-000000000000","storagedeviceid"
:"34a61ddf-5b9e-4e48-b994-3054cdb475fd","storagedevicesize":322122547200,"status":1,"options1":{"clusterip4"
:"10.70.46.27","device":"/dev/vdc","fstype":"xfs","in":"false","node":"dhcp46-28.lab.eng.blr.redhat.com"
,"pgsummary":{"active+undersized+degraded":102,"creating+incomplete":37},"publicip4":"10.70.46.27","up"
:"true"},"storageprofile":"general","state":"Out","almstatus":5,"almcount":0,"usage":{"used":23,"total"
:100,"percentused":23}},{"sluid":"8rse20dsd4119-3756-4ae9-a8a7-f8b9918c339b","name":"osd.0","type":1,"clusterid":"7bc97289-9d10-4763-b563-82d6053a38d6"
,"nodeid":"c3fe5fb6-62bf-45ec-ba84-db3d42440966","storageid":"00000000-0000-0000-0000-000000000000","storagedeviceid"
:"34a61ddf-5b9e-4e48-b994-3054cdb475fd","storagedevicesize":322122547200,"status":1,"options1":{"clusterip4"
:"10.70.46.27","device":"/dev/vdc","fstype":"xfs","in":"false","node":"dhcp46-28.lab.eng.blr.redhat.com"
,"pgsummary":{"active+undersized+degraded":102,"creating+incomplete":37},"publicip4":"10.70.46.27","up"
:"true"},"storageprofile":"general","state":"Out","almstatus":5,"almcount":0,"usage":{"used":23,"total"
:100,"percentused":23}},{"sluid":"820dsd4119-3756-4ae9-a8a7-f8b9918c339b","name":"osd.0","type":1,"clusterid":"7bc97289-9d10-4763-b563-82d6053a38d6"
,"nodeid":"c3fe5fb6-62bf-45ec-ba84-db3d42440966","storageid":"00000000-0000-0000-0000-000000000000","storagedeviceid"
:"34a61ddf-5b9e-4e48-b994-3054cdb475fd","storagedevicesize":322122547200,"status":1,"options1":{"clusterip4"
:"10.70.46.27","device":"/dev/vdc","fstype":"xfs","in":"false","node":"dhcp46-28.lab.eng.blr.redhat.com"
,"pgsummary":{"active+undersized+degraded":102,"creating+incomplete":37},"publicip4":"10.70.46.27","up"
:"true"},"storageprofile":"general","state":"Out","almstatus":5,"almcount":0,"usage":{"used":23,"total"
:100,"percentused":23}},{"sluid":"c6aagfghbe05-4d03-499e-ac41-411cbf9fb54f","name":"osd.1","type":1,"clusterid"
:"7bc97289-9d10-4763-b563-82d6053a38d6","nodeid":"c3fe5fb6-62bf-45ec-ba84-db3d42440966","storageid":"00000000-0000-0000-0000-000000000000"
,"storagedeviceid":"a5acb4e0-56ca-4513-8840-892135cbabfd","storagedevicesize":322122547200,"status":1
,"options1":{"clusterip4":"10.70.46.27","device":"/dev/vdb","fstype":"xfs","in":"false","node":"dhcp46-27.lab.eng.blr.redhat.com","pgsummary":{"active+undersized+degraded":82,"creating+incomplete":42},"publicip4"
:"10.70.46.27","up":"true"},"storageprofile":"general","state":"Out","almstatus":5,"almcount":0,"usage"
:{"used":65,"total":100,"percentused":65}},{"sluid":"15a4daff-dsfdsf4fd-435e-b688-5e6345a13b92","name":"osd.2"
,"type":1,"clusterid":"7bc97289-9d10-4763-b563-82d6053a38d6","nodeid":"c3fe5fb6-62bf-45ec-ba84-db3d42440966"
,"storageid":"00000000-0000-0000-0000-000000000000","storagedeviceid":"83c969d4-1143-4a22-b946-7bb7e7b0d53d"
,"storagedevicesize":322122547200,"status":1,"options1":{"clusterip4":"10.70.46.27","device":"/dev/vdd"
,"fstype":"xfs","in":"true","node":"dhcp46-28.lab.eng.blr.redhat.com","pgsummary":{"active+undersized+degraded":72,"creating+incomplete":49},"publicip4":"10.70.46.27","up":"true"},"storageprofile":"general"
,"state":"In","almstatus":5,"almcount":0,"usage":{"used":95,"total":100,"percentused":95}},{"sluid":"82cxc0d4119-3756-4ae9-a8a7-f8b9918c339b","name":"osd.3","type":1,"clusterid":"7bc97289-9d10-4763-b563-82d6053a38d6"
,"nodeid":"c3fe5fb6-62bf-45ec-ba84-db3d42440966","storageid":"00000000-0000-0000-0000-000000000000","storagedeviceid"
:"34a61ddf-5b9e-4e48-b994-3054cdb475fd","storagedevicesize":322122547200,"status":1,"options1":{"clusterip4"
:"10.70.46.27","device":"/dev/vdc","fstype":"xfs","in":"false","node":"dhcp46-27.lab.eng.blr.redhat.com"
,"pgsummary":{"active+undersized+degraded":102,"creating+incomplete":37},"publicip4":"10.70.46.27","up"
:"true"},"storageprofile":"ssd","state":"Out","almstatus":5,"almcount":0,"usage":{"used":80,"total"
:100,"percentused":80}},{"sluid":"c6aabe0xcxc5-4d03-499e-ac41-411cbf9fb54f","name":"osd.4","type":1,"clusterid"
:"7bc97289-9d10-4763-b563-82d6053a38d6","nodeid":"c3fe5fb6-62bf-45ec-ba84-db3d42440966","storageid":"00000000-0000-0000-0000-000000000000"
,"storagedeviceid":"a5acb4e0-56ca-4513-8840-892135cbabfd","storagedevicesize":322122547200,"status":1
,"options1":{"clusterip4":"10.70.46.27","device":"/dev/vdb","fstype":"xfs","in":"false","node":"dhcp46-28.lab.eng.blr.redhat.com","pgsummary":{"active+undersized+degraded":82,"creating+incomplete":42},"publicip4"
:"10.70.46.27","up":"true"},"storageprofile":"sas","state":"Out","almstatus":5,"almcount":0,"usage"
:{"used":67,"total":100,"percentused":67}},{"sluid":"15a4cxcxcsadaff-d4fd-435e-b688-5e6345a13b92","name":"osd.5"
,"type":1,"clusterid":"7bc97289-9d10-4763-b563-82d6053a38d6","nodeid":"c3fe5fb6-62bf-45ec-ba84-db3d42440966"
,"storageid":"00000000-0000-0000-0000-000000000000","storagedeviceid":"83c969d4-1143-4a22-b946-7bb7e7b0d53d"
,"storagedevicesize":322122547200,"status":0,"options1":{"clusterip4":"10.70.46.27","device":"/dev/vdd"
,"fstype":"xfs","in":"true","node":"dhcp46-27.lab.eng.blr.redhat.com","pgsummary":{"active+undersized+degraded":72,"creating+incomplete":49},"publicip4":"10.70.46.27","up":"true"},"storageprofile":"general"
,"state":"In","almstatus":5,"almcount":0,"usage":{"used":76,"total":100,"percentused":76}},{"sluid":"6tf820d4119-3756-4ae9-a8a7-f8b9918c339b","name":"osd.6","type":1,"clusterid":"7bc97289-9d10-4763-b563-82d6053a38d6"
,"nodeid":"c3fe5fb6-62bf-45ec-ba84-db3d42440966","storageid":"00000000-0000-0000-0000-000000000000","storagedeviceid"
:"34a61ddf-5b9e-4e48-b994-3054cdb475fd","storagedevicesize":322122547200,"status":1,"options1":{"clusterip4"
:"10.70.46.27","device":"/dev/vdc","fstype":"xfs","in":"false","node":"dhcp46-28.lab.eng.blr.redhat.com"
,"pgsummary":{"active+undersized+degraded":102,"creating+incomplete":37},"publicip4":"10.70.46.27","up"
:"true"},"storageprofile":"sas","state":"Out","almstatus":5,"almcount":0,"usage":{"used":78,"total"
:100,"percentused":78}},{"sluid":"c6aabe05-4d0fgds3-499e-ac41-411cbf9fb54f","name":"osd.7","type":1,"clusterid"
:"7bc97289-9d10-4763-b563-82d6053a38d6","nodeid":"c3fe5fb6-62bf-45ec-ba84-db3d42440966","storageid":"00000000-0000-0000-0000-000000000000"
,"storagedeviceid":"a5acb4e0-56ca-4513-8840-892135cbabfd","storagedevicesize":322122547200,"status":1
,"options1":{"clusterip4":"10.70.46.27","device":"/dev/vdb","fstype":"xfs","in":"false","node":"dhcp46-28.lab.eng.blr.redhat.com","pgsummary":{"active+undersized+degraded":82,"creating+incomplete":42},"publicip4"
:"10.70.46.27","up":"true"},"storageprofile":"general","state":"Out","almstatus":5,"almcount":0,"usage"
:{"used":99,"total":100,"percentused":99}},{"sluid":"15avvcvxx4daff-d4fd-435e-b688-5e6345a13b92","name":"osd.8"
,"type":1,"clusterid":"7bc97289-9d10-4763-b563-82d6053a38d6","nodeid":"c3fe5fb6-62bf-45ec-ba84-db3d42440966"
,"storageid":"00000000-0000-0000-0000-000000000000","storagedeviceid":"83c969d4-1143-4a22-b946-7bb7e7b0d53d"
,"storagedevicesize":322122547200,"status":0,"options1":{"clusterip4":"10.70.46.27","device":"/dev/vdd"
,"fstype":"xfs","in":"true","node":"dhcp46-27.lab.eng.blr.redhat.com","pgsummary":{"active+undersized+degraded":72,"creating+incomplete":49},"publicip4":"10.70.46.27","up":"true"},"storageprofile":"sas"
,"state":"In","almstatus":5,"almcount":0,"usage":{"used":23,"total":100,"percentused":23}}];
            (this.osdList || []).map( (osd) => {
                var pgArray = [];
                osd.usage.status = (osd.usage.percentused>=95? 0 :(osd.usage.percentused>=85? 1 :(osd.usage.percentused>=50? 2 : 3 )));
                if(!this.filterList.OSDStatus[osd.status].enabled) {
                    this.filterList.OSDStatus[osd.status].enabled = true;
                }
                if(!this.filterList.Utilization[osd.usage.status].enabled) {
                    this.filterList.Utilization[osd.usage.status].enabled = true;
                }
                Object.keys(osd.options1.pgsummary).forEach((element) => {
                    pgArray = pgArray.concat(element.split("+"));
                });
                osd.options1.pgsummary.pgarray = pgArray;
                osd.node = osd.options1.node;
            });
            this.selection.activeOsd = this.osdList[0];
            this.pgStatusFilterChange();
            this.performGroupBy('node');
        });
    }

    public performGroupBy(group_by) {
        if(group_by === 'node') {
            this.osdListGroupBy = _.groupBy(this.osdList, function(osd){ return osd.options1.node });
        }else {
            this.osdListGroupBy = _.groupBy(this.osdList, function(osd){ return osd.storageprofile });
        }
    }

    public osdActionChange(osdAction) {
        let actionObject = (osdAction==='mark_up'?{up:true}:(osdAction==='mark_in'?{in:true}:{in:false}));
        if(osdAction === 'mark_out') {
            var modal = ModalHelpers.OsdActionConfirmation(this.$modal, {}, 'Are you sure you want to move the selected OSDs out of the cluster?');
            modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide, confirmed: boolean) => {
                if (confirmed) {
                       this.performOsdAction(actionObject);
                }
                $hide();
            });
        }else {
            this.performOsdAction(actionObject);
        }
    }

    public performOsdAction(actionObject) {
        if(Object.keys(this.selection.allSelectedOsds).length === 0 ) {
            this.clusterService.slusAction(this.id,this.selection.activeOsd.sluid,actionObject).then((result) => {
                this.requestSvc.get(result.data.taskid).then((task) => {
                    this.requestTrackingSvc.add(task.id, task.name);
                });
            });
        }else {
            _.forOwn(this.selection.allSelectedOsds, (value, key) => {
                this.clusterService.slusAction(this.id,key,actionObject).then((result) => {
                    this.requestSvc.get(result.data.taskid).then((task) => {
                        this.requestTrackingSvc.add(task.id, task.name);
                    });
                });
            });
        }
        this.selection.allSelectedOsds= {};
        this.timeoutService(() => this.getOSDs(), 10000);
    }

    public filterSelectedOsd(selectedOSDs) {
        _.forOwn(selectedOSDs, function(value, key) {
            if (value === false) {
                delete selectedOSDs[key];
            }
        });
    }

    public applyFilter = (osd) => {
        if(this.filterBy.active === 'osd_status') {
            return this.filterBy.osdStatus[osd.status] || this.noFilter(this.filterBy.osdStatus);
        }else if(this.filterBy.active === 'utilization') {
            return this.filterBy.utilization[osd.usage.status] || this.noFilter(this.filterBy.utilization);
        }else if(this.filterBy.active === 'pg_status') {
            if(this.flags.showAll) { return true; }
            var result = false;
            _.each(this.filterList.PGStatus, (element: any) => {
                if(element.enabled){
                    if(osd.options1.pgsummary.pgarray.indexOf(element.name) === -1){
                        return false;
                    }else{
                        result = true;
                    }
                }
            });
            return result;
        }
    }

    public pgStatusFilterChange() {
        for(var index in this.filterList.PGStatus){
            if(this.filterList.PGStatus[index].enabled){
                this.flags.showAll = false;
                return;
            }
        }
        this.flags.showAll = true;
    };

    public noFilter(filterObj) {
        for (var key in filterObj) {
            if (filterObj[key]) {
                return false;
            }
        }
        return true;
    }

}
