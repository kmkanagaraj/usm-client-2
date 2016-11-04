// <reference path="../typings/tsd.d.ts" />

import {StorageProfile} from '../../rest/storage-profile';

import {ServerService} from '../../rest/server';
import {StorageProfileService} from '../../rest/storage-profile';
import {numeral} from '../../base/libs';
import {I18N} from "../../base/i18n";
import {BytesFilter} from '../../shared/filters/bytes';

export class StorageProfileDisksController {
    private hosts;
    private hostsCallback;
    private storageProfiles: StorageProfile[];
    private selectedProfile: StorageProfile;
    private add = false;
    private storageProfileDisks: {};
    private storageDisks: any[];
    private addingProfile = false;
    private bytes: any;

    static $inject: Array<string> = [
        '$q',
        'ServerService',
        'StorageProfileService',
        'I18N'
    ];
    public constructor(
        private $q: ng.IQService,
        private serverSvc: ServerService,
        private storageProfileSvc: StorageProfileService,
        private i18n: I18N) {
        this.bytes = BytesFilter();
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
            for (var host of this.hosts) {
                for (var disk of host.disks) {
                    if (disk.Type === 'disk' && disk.Used === false && disk.StorageProfile && disk.StorageProfile.length > 0) {
                        disk.nodeid = host.id;
                        disk.hostname = host.hostname.split('.')[0];
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

    public getDisksForStorageProfileLabel(storageProfile: StorageProfile): string {
        return this.i18n.sprintf(
                this.i18n._("%d Disks %s"),
                this.getDisksForStorageProfile(storageProfile).length,
                this.bytes(this.getStorageProfileSize(storageProfile)));
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
