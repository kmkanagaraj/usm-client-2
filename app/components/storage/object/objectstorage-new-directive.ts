// <reference path="../../../typings/tsd.d.ts" />

/**
 * @ngdoc directive
 * @name kitoon.storage.object.objectstorage-new
 * @scope
 * $restrict E
 *
 * @description
 * An AngularJS Directive for showing details of Task
 *
 * @example
 * <object-storage pool-with-rbd="blockdevice" prepare-rbd-summary="blockdevice.prepareSummary()" rbd-list="blockdevice.rbdlist[]" pool-name="blockdevice.name"></object-storage>
 */

import {ObjectStorageController} from "./objectstorage-new";

export class ObjectStorage implements ng.IDirective {
    scope= {
        poolWithRbd: "@",
        prepareRbdSummary: "&",
        rbdList: "=",
        poolName: "="
    };
    restrict = 'E';
    controller = ObjectStorageController;
    controllerAs = 'storage';
    bindToController = true;
    templateUrl = 'views/storage/object/objectstorage-new-directive.html';
}