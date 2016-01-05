// <reference path="../typings/tsd.d.ts" />

import {StorageProfile} from '../../rest/storage-profile';

import {ServerService} from '../../rest/server';
import {StorageProfileService} from '../../rest/storage-profile';
import {numeral} from '../../base/libs';

export class StorageProfileDisksController {
    private storageProfiles: StorageProfile[];
    private selectedProfile: StorageProfile;
    private storageProfileDisks: {};
    private storageDisks: any[];
    static $inject: Array<string> = [
        '$q',
        'ServerService',
        'StorageProfileService'
    ];
    public constructor(
        private $q: ng.IQService,
        private serverSvc: ServerService,
        private storageProfileSvc: StorageProfileService) {
        this.storageProfileDisks = {};
        this.storageProfileSvc.getList().then((list) => {
            this.storageProfiles = list;
            this.selectedProfile = this.storageProfiles[0];
            for (var storageProfile of this.storageProfiles) {
                this.storageProfileDisks[storageProfile.name] = [];
            }
            return this.serverSvc.getList();
        }).then((nodes) => {
            for (var node of nodes) {
                for (var disk of node.storage_disks) {
                    disk.nodeid = node.nodeid;
                    disk.hostname = node.hostname;
                }
            }
            var disks = _.reduce(nodes, function(arr: any[], node) {
                return arr.concat(node.storage_disks);
            }, []);
            this.storageDisks = disks;
            for (var storageDisk of this.storageDisks) {
                if (storageDisk.Type === 'disk' && storageDisk.StorageProfile && storageDisk.StorageProfile.length > 0) {
                    this.storageProfileDisks[storageDisk.StorageProfile].push(storageDisk);
                }
            }
        });
        //this.populateDummyData();
    }

    public selectStorageProfile(selectedProfile: StorageProfile) {
        this.selectedProfile = selectedProfile;
    }

    public getDisksForStorageProfile(storageProfile: StorageProfile): any[] {
        return this.storageProfileDisks[storageProfile.name];
    }

    public getStorageProfileSize(storageProfile: StorageProfile): string {
        var size = _.reduce(this.storageProfileDisks[storageProfile.name], function(size, disk: any) {
            return size + disk.Size;
        }, 0)
        return numeral(size).format('0.0 b');;
    }

    public getDiskSize(disk): string {
        return numeral(disk.Size).format('0.0 b');
    }

    public diskMoved(storageProfile: StorageProfile, disk) {
        console.log(disk);
        var prevProfile = disk['StorageProfile'];
        disk['StorageProfile'] = storageProfile.name;
        _.remove(this.storageProfileDisks[prevProfile], function(d) {
            return disk.nodeid === d.nodeid && disk.DevName === d.DevName;
        });
        this.storageProfileDisks[storageProfile.name].push(disk);
    }

    public submit() {
        var requests = [];
        for (var storageProfile of this.storageProfiles) {
            var disks = this.storageProfileDisks[storageProfile.name];
            for (var disk of disks) {
                requests.push(this.serverSvc.updateDiskStorageProfile(disk.nodeid, disk.DiskId, disk.StorageProfile));
            }
        }
        this.$q.all(requests).then((results) => {
            console.log(results);
        });
    }

    private populateDummyData() {
        this.storageProfiles = [
            { "name": "sas", "rule": { "disktype": 0, "speed": 0 }, "priority": 100, "default": true },
            { "name": "ssd", "rule": { "disktype": 0, "speed": 0 }, "priority": 100, "default": true },
            { "name": "general", "rule": { "disktype": 0, "speed": 0 }, "priority": 100, "default": true }
        ];
        this.selectedProfile = this.storageProfiles[0];
        this.storageDisks = [{ "DevName": "/dev/sr0", "FSType": "", "FSUUID": "00000000-0000-0000-0000-000000000000", "Model": "QEMU\\x20DVD-ROM\\x20\\x20\\x20\\x20", "MountPoint": [""], "Name": "/dev/sr0", "Parent": "", "Size": 1073741312, "Type": "rom", "Used": false, "Vendor": "QEMU\\x20\\x20\\x20\\x20", "StorageProfile": "general" }, { "DevName": "/dev/vdb", "FSType": "", "FSUUID": "00000000-0000-0000-0000-000000000000", "Model": "", "MountPoint": [""], "Name": "/dev/vdb", "Parent": "", "Size": 5368709120, "Type": "disk", "Used": false, "Vendor": "0x1af4", "StorageProfile": "general" }, { "DevName": "/dev/dm-0", "FSType": "xfs", "FSUUID": "1140a66f-3fa3-46e5-86b0-766dc94b7bb3", "Model": "", "MountPoint": ["/"], "Name": "/dev/mapper/fedora_dhcp42--88-root", "Parent": "/dev/vda2", "Size": 13967032320, "Type": "lvm", "Used": true, "Vendor": "", "StorageProfile": "" }, { "DevName": "/dev/dm-1", "FSType": "swap", "FSUUID": "8e156bbf-9e12-4111-9f6e-4d5b13af9d3c", "Model": "", "MountPoint": ["[SWAP]"], "Name": "/dev/mapper/fedora_dhcp42--88-swap", "Parent": "/dev/vda2", "Size": 1610612736, "Type": "lvm", "Used": true, "Vendor": "", "StorageProfile": "" }, { "DevName": "/dev/vda2", "FSType": "LVM2_member", "FSUUID": "00000000-0000-0000-0000-000000000000", "Model": "", "MountPoint": [""], "Name": "/dev/vda2", "Parent": "/dev/vda", "Size": 15580790784, "Type": "part", "Used": true, "Vendor": "", "StorageProfile": "" }, { "DevName": "/dev/vda1", "FSType": "ext4", "FSUUID": "707eaffc-928c-41c8-ad70-92a53b86a407", "Model": "", "MountPoint": ["/boot"], "Name": "/dev/vda1", "Parent": "/dev/vda", "Size": 524288000, "Type": "part", "Used": true, "Vendor": "", "StorageProfile": "" }];

    }
}
