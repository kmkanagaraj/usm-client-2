// <reference path="../typings/tsd.d.ts" />
declare function require(name: string);

import {default as RequestsModule} from "./components/requests/module";
import {default as RestModule} from "./components/rest/rest-module";
import {default as HostModule} from "./components/hosts/host-module";
import {default as StorageModule} from "./components/storage/storage-module";
import {default as EventModule} from "./components/events/event-module";
import {RouteConfig} from "./components/router/route-config";
import {MenuService} from "./components/base/menu-svc";
import {LoginController} from "./components/login/login";
import {ApplicationController} from "./components/base/application-controller";
import {MenuController} from "./components/base/menu-controller";
import {FirstController} from "./components/first/first-controller";
import {DashboardController} from "./components/dashboard/dashboard-controller";
import {ClustersController} from "./components/clusters/clusters-controller";
import {ClusterExpandController} from "./components/clusters/cluster-expand";
import {ClusterNewController} from "./components/clusters/cluster-new";
import {ClusterDetailController} from "./components/clusters/cluster-detail";
import {StorageProfileDisksController} from './components/clusters/storageprofile/storage-profile-disks';
import {VolumeController} from "./components/volumes/volume-controller";
import {VolumeNewController} from "./components/volumes/volume-new";
import {VolumeExpandController} from "./components/volumes/volume-expand";
import {UserController} from "./components/admin/user-controller";
import {UserNewController} from "./components/admin/user-new";
import {UserEditController} from "./components/admin/user-edit";
import {LdapUserController} from "./components/admin/ldap-user-controller";
import {TaskDetailController} from "./components/tasks/task-detail-controller";


import {KTDraggable} from "./components/shared/directives/kt-draggable";
import {KTDroppable} from "./components/shared/directives/kt-droppable";

var es6shim = require("es6-shim");
var angular: ng.IAngularStatic = require("angular");
var ngRoute = require("angular-route");
var ngAnimate = require("angular-animate");
var ngCookies = require("angular-cookies");
var ngResource = require("angular-resource");
var ngSanitize = require("angular-sanitize");
var restangular = require("restangular");
var ngStrap = require("angular-strap");
var ngStrapTpl = require("angular-strap-tpl");
var idbWrapper = require("idb-wrapper");
var c3 = require("c3");
var d3 = require("d3");
var c3Angular = require("c3-angular");
var jquery = $ = require("jquery");
var patternfly = require("patternfly");
var angularPatternfly = require("angular-patternfly");
var angularSlider = require("angularjs-slider");

class USMApp {
    initialize() {
        console.log('Initializing...');
        angular.module('usm-client', [
            'ngAnimate',
            'ngCookies',
            'ngResource',
            'ngSanitize',
            'ngRoute',
            'mgcrea.ngStrap',
            'gridshore.c3js.chart',
            'restangular',
            'patternfly.charts',
            RequestsModule,
            RestModule,
            HostModule,
            StorageModule,
            EventModule
        ])
            .controller('LoginController', LoginController)
            .controller('ApplicationController', ApplicationController)
            .controller('MenuController', MenuController)
            .controller('FirstController', FirstController)
            .controller('DashboardController', DashboardController)
            .controller('ClusterController', ClustersController)
            .controller('ClusterExpandController', ClusterExpandController)
            .controller('ClusterNewController', ClusterNewController)
            .controller('ClusterDetailController', ClusterDetailController)
            .controller('StorageProfileDisksController', StorageProfileDisksController)
            .controller('VolumeController', VolumeController)
            .controller('VolumeNewController', VolumeNewController)
            .controller('VolumeExpandController', VolumeExpandController)
            .controller('UserController',UserController)
            .controller('UserNewController',UserNewController)
            .controller('UserEditController',UserEditController)
            .controller('LdapUserController',LdapUserController)
            .directive('ktDraggable', () => new KTDraggable())
            .directive('ktDroppable', () => new KTDroppable())
            .controller('TaskDetailController',TaskDetailController)
            .service('MenuService', MenuService)
            .run( function($rootScope, $location) {
               $rootScope.$watch(function() {
                  return $location.path();
                },
                function(a){
                  console.log('url has changed: ' + a);
                  $rootScope.currentURI = a;
                  // show loading div, etc...
                });
            })
            .config(RouteConfig)
            .config(['$httpProvider', function($httpProvider) {
                $httpProvider.defaults.xsrfCookieName = 'csrftoken';
                $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
            }])
            .config(['$logProvider', function($logProvider) {
                $logProvider.debugEnabled(true);
            }])
            .config(['RestangularProvider', function(RestangularProvider) {
                RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
                    if (operation === 'getList' && what === 'nodes') {
                        _.each(data, (node: any) => {
                            node.options1 = node.options;
                        });
                    }
                    return data;
                });
            }]);
        angular.element(document).ready(function() {
            angular.bootstrap(document, ['usm-client']);
        });
    }
}

var app = new USMApp();
app.initialize();
