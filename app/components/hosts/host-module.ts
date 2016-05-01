// <reference path="../typings/tsd.d.ts" />
declare function require(name: string);

import {HostListController} from './host';
import {HostDetailController} from './host-details/host-detail';
import {HostOverview} from "./host-overview/host-overview-directive";
import {HostConfig} from "./host-config/host-config-directive";
import {HostOsd} from "./host-osd/host-osd-directive";
import {TimeSlot} from "./time-slot/time-slot-directive";

var angular: ng.IAngularStatic = require('angular');

var moduleName = 'usm-client.hosts';

angular.module(moduleName, [])
    .controller('HostListController', HostListController)
    .controller('HostDetailController', HostDetailController)
    .directive('hostOverview', () => new HostOverview())
    .directive('hostConfig', () => new HostConfig())
    .directive('hostOsd', () => new HostOsd())
    .directive('timeSlot', () => new TimeSlot());
    
export default moduleName;
