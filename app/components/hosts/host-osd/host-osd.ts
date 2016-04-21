// <reference path="../typings/tsd.d.ts" />

import {ServerService} from '../../rest/server';
import {ClusterService} from '../../rest/clusters';
import {RequestService} from '../../rest/request';
import {RequestTrackingService} from '../../requests/request-tracking-svc';
import * as ModalHelpers from '../../modal/modal-helpers';
import {numeral} from '../../base/libs';

export class HostOsdController {
    private id: any;
    private osdList: Array<any>;
    private filterList: any;
    private selection: any;
    private activeFilter: string;
    private isLeftSidebarShow: boolean;
    private filteredOSD: any;
    private totalSelectedOSDs: Array<any>;
    private selectByStorageProfile: any;

    //Services that are used in this class.
    static $inject: Array<string> = [
        '$q',
        '$modal',
        '$scope',
        '$timeout',
        '$log',
        'ServerService',
        'ClusterService',
        'RequestService',
        'RequestTrackingService'
    ];

    constructor(private qService: ng.IQService,
        private $modal: any,
        private scopeService: ng.IScope,
        private timeoutService: ng.ITimeoutService,
        private logService: ng.ILogService,
        private serverService: ServerService,
        private clusterService: ClusterService,
        private requestSvc: RequestService,
        private requestTrackingSvc: RequestTrackingService) {

        this.filteredOSD = {};
        this.isLeftSidebarShow = true;
        this.selection = { activeOsd: {} ,allSelectedOsds: {} };
        this.activeFilter = 'osd_status';
        this.filterList = {};
        /* Note: This filterList is tightly coupled with status(osd,utilization,pg) order. if order
        of element will get change , it will break the filter features */
        this.filterList.OSDStatus = [
            {name: "Up-In", icon: "pficon pficon-ok", enabled: false, checked: false},
            {name: "Up-Out", icon: "pficon pficon-warning-triangle-o", enabled: false, checked: false},
            {name: "Down-In", icon: "pficon pficon-warning-triangle-o", enabled: false, checked: false},
            {name: "Down", icon: "fa fa-arrow-circle-o-down down-color", enabled: false, checked: false}
        ];
        this.filterList.PGStatus = [
            {name: "active", checked: false},
            {name: "clean", checked: false},
            {name: "creating", checked: false},
            {name: "replay", checked: false},
            {name: "splitting", checked: false},
            {name: "scrubbing", checked: false},
            {name: "degraded", checked: false},
            {name: "undersized", checked: false},
            {name: "repair", checked: false},
            {name: "recovery", checked: false},
            {name: "backfill", checked: false},
            {name: "remapped", checked: false},
            {name: "down", echecked: false},
            {name: "inconsistent", checked: false},
            {name: "peering", checked: false},
            {name: "incomplete", checked: false},
            {name: "stale", checked: false},
        ];
        this.filterList.Utilization = [
            {name: "Full (95% or more)", icon: "progress-bar-full", enabled: false, checked: false},
            {name: "Near Full (85% or more)", icon: "progress-bar-near-full", enabled: false, checked: false},
            {name: "50% - 85%", icon: "progress-bar-average", enabled: false, checked: false},
            {name: "Less than 50%", icon: "progress-bar-normal", enabled: false, checked: false}
        ];
        this.selectByStorageProfile = { storageprofile: '' };
        this.totalSelectedOSDs = [];
        this.getOSDs();
        /* Here , watching the filteredOSD(filtered osd list) variable for any changes .
        so that we can select first value as a selected OSD in UI . and if there is no
        any element inside array, than no osd will be selected in UI. */
        this.scopeService.$watch(() => { return this.filteredOSD; }, (newValue, oldValue) => {
            this.maintainTotalSelectedOsds();
            this.selection.activeOsd = null;
            _.forOwn(this.filteredOSD, (value, key) => {
                if ( value.length > 0 ) {
                    this.selection.activeOsd = value[0];
                    return false;
                }
            });
        },true);
    }

    /* Getting OSD list here */
    public getOSDs() {
        this.serverService.getNodeSlus(this.id).then((slus: Array<any>) => {
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
                /* Adding the usage status for each osd , so that easily can find color code as well
                as filter for percentused in UI */
                osd.usage.status = (osd.usage.percentused>=95? 0 :(osd.usage.percentused>=85? 1 :(osd.usage.percentused>=50? 2 : 3 )));
                /* By default , we have disabled all filter . and Just here we are enabling the filters
                which are present in OSD list */
                if(!this.filterList.OSDStatus[osd.status].enabled) {
                    this.filterList.OSDStatus[osd.status].enabled = true;
                }
                if(!this.filterList.Utilization[osd.usage.status].enabled) {
                    this.filterList.Utilization[osd.usage.status].enabled = true;
                }
                /* we have pg summary in object format with '+' sign . example - "pgsummary":{"active+undersized+degraded":128} .
                Here , we want to each key after spliting with '+' sign , should be array elements
                so that easily can apply filter  */
                Object.keys(osd.options1.pgsummary).forEach((element) => {
                    pgArray = pgArray.concat(element.split("+"));
                });
                osd.options1.pgsummary.pgarray = pgArray;
                osd.node = osd.options1.node;
            });
        });
    }

    /* Calling on osd action changed and performing actions on selected osds */
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

    /* Performing the Actions on selected osds */
    public performOsdAction(actionObject) {
        if(this.totalSelectedOSDs.length === 0 ) {
            this.clusterService.slusAction(this.id,this.selection.activeOsd.sluid,actionObject).then((result) => {
                this.requestSvc.get(result.data.taskid).then((task) => {
                    this.requestTrackingSvc.add(task.id, task.name);
                });
            });
        }else {
            _.each(this.totalSelectedOSDs, (osd: any) => {
                this.clusterService.slusAction(this.id,osd.sluid,actionObject).then((result) => {
                    this.requestSvc.get(result.data.taskid).then((task) => {
                        this.requestTrackingSvc.add(task.id, task.name);
                    });
                });
            });
        }
        this.selection.allSelectedOsds= {};
        this.totalSelectedOSDs = [];
        this.timeoutService(() => this.getOSDs(), 10000);
    }

    /* Maintaining the total selected osds by checkbox for Action */
    public maintainTotalSelectedOsds() {
        this.totalSelectedOSDs = [];
        _.forOwn(this.filteredOSD, (value, key) => {
            _.each(value, (osd: any) => {
                if (this.selection.allSelectedOsds[osd.sluid] === true ) {
                    this.totalSelectedOSDs.push(osd);
                }
            });
        });
    }

    /* Applying filter on OSD list from the ng-repeat in UI. here we have 3 set of filters based on
    1)osd status 2)utilization 3) pg_status . and at a time only one set of filter can be applied .
    so that why here i have if condition to check the set of filter . */
    public applyFilter = (osd) => {
        if(this.activeFilter === 'osd_status') {
            return this.filterList.OSDStatus[osd.status].checked || this.isNoFilterSelected(this.filterList.OSDStatus);
        }else if(this.activeFilter === 'utilization') {
            return this.filterList.Utilization[osd.usage.status].checked || this.isNoFilterSelected(this.filterList.Utilization);
        }else if(this.activeFilter === 'pg_status') {
            if(this.isNoFilterSelected(this.filterList.PGStatus)) { return true; }
            var result = false;
            _.each(this.filterList.PGStatus, (element: any) => {
                if(element.checked){
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

    /* It will return true/false based on given filter group.
    If there is no filter applied for this , than it will return true
    otherwise it will return false.*/
    public isNoFilterSelected(filterObj) {
        for (var key in filterObj) {
            if (filterObj[key].checked) {
                return false;
            }
        }
        return true;
    }

    public selectBy(storageprofile) {
        this.selectByStorageProfile.storageprofile = storageprofile;
    }

}
