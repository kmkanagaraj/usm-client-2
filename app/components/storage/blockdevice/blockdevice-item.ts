/// <reference path="../../../../typings/tsd.d.ts" />

/*
 * @ngdoc directive
 * @name kitoon.storage:blockDeviceItem
 * @scope
 * @restrict E
 *
 * @param {function} onRemove. The function which needs to be called when an item is removed.
 *
 * @description
 * An AngularJS directive for showing the details of a block device.
 *
 * @example
 * <blockdevice-item details="blockdevice" remove="remove(blockdevice)" resize="resize(blockdevice)"></blockdevice-item>
 *
*/

export class BlockDeviceItem implements ng.IDirective {
    restrict = 'AE';
    scope = {
        blockdevice: '=details',
        remove: '&',
        resize: '&'
    };
    controller = function() {
        this.onRemove = function() {
            this.remove();
        }
        this.onResize = function() {
            this.resize();
        };
    };
    controllerAs = 'vm';
    bindToController = true;
    templateUrl = 'views/storage/blockdevice/blockdevice-item.html';
}
