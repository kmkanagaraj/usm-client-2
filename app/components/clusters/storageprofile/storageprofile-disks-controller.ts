// <reference path="../typings/tsd.d.ts" />

import {StorageProfile} from '../../rest/storage-profile';

import {ServerService} from '../../rest/server';
import {StorageProfileService} from '../../rest/storage-profile';
import {numeral} from '../../base/libs';

export class StorageProfileDisksController {
    private hosts;
    private hostsCallback;
    private storageProfiles: StorageProfile[];
    private selectedProfile: StorageProfile;
    private add = false;
    private storageProfileDisks: {};
    private storageDisks: any[];
    private addingProfile = false;
    static $inject: Array<string> = [
        '$q',
        'ServerService',
        'StorageProfileService'
    ];
    public constructor(
        private $q: ng.IQService,
        private serverSvc: ServerService,
        private storageProfileSvc: StorageProfileService) {
        this.loadData();
    }

    public loadData() {
        if(!this.hosts) {
            this.hosts = this.hostsCallback();
        }
        this.storageProfileDisks = {};
        this.storageProfileSvc.getList().then((list) => {
            this.storageProfiles = list;
            this.selectedProfile = this.storageProfiles[0];
            for (var storageProfile of this.storageProfiles) {
                this.storageProfileDisks[storageProfile.name] = [];
            }
            var requests = [];
            for (var hostId of this.hosts) {
                requests.push(this.serverSvc.get(hostId));
            }
            return this.$q.all(requests);
        }).then((nodes) => {
            for (var node of nodes) {
                for (var disk of node.storage_disks) {
                    if (disk.Type === 'disk' && disk.Used === false && disk.StorageProfile && disk.StorageProfile.length > 0) {
                        disk.nodeid = node.nodeid;
                        disk.hostname = node.hostname.split('.')[0];
                        this.storageProfileDisks[disk.StorageProfile].push(disk);
                    }
                }
            }
        });
    }

    public selectStorageProfile(selectedProfile: StorageProfile) {
        this.selectedProfile = selectedProfile;
    }

    public getDisksForStorageProfile(storageProfile: StorageProfile): any[] {
        return storageProfile && this.storageProfileDisks[storageProfile.name];
    }

    public getStorageProfileSize(storageProfile: StorageProfile): number {
        var size = _.reduce(this.storageProfileDisks[storageProfile.name], function(size, disk: any) {
            return size + disk.Size;
        }, 0)
        return size;
    }

    public diskMoved(storageProfile: StorageProfile, disk) {
        console.log(disk);
        this.serverSvc.updateDiskStorageProfile(disk.nodeid, disk.DiskId, storageProfile.name).then(result => {
            if (result.status === 200) {
                var prevProfile = disk['StorageProfile'];
                disk['StorageProfile'] = storageProfile.name;
                _.remove(this.storageProfileDisks[prevProfile], function(d) {
                    return disk.nodeid === d.nodeid && disk.DevName === d.DevName;
                });
                this.storageProfileDisks[storageProfile.name].push(disk);
            }
        });
    }

    public addProfile(profileName: string) {
        this.storageProfileSvc.add({ name: profileName }).then((result) => {
            if (result.status === 200) {
                this.add = false;
                return this.storageProfileSvc.getByName(profileName);
            }
        }).then((storageProfile: StorageProfile) => {
            this.storageProfiles.push(storageProfile);
            this.storageProfileDisks[profileName] = [];
        });
    }
}
