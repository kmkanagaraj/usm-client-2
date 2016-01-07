/// <reference path="../../../typings/tsd.d.ts" />

import {UserService} from '../rest/user';

export class ApplicationController {
    static $inject: Array<string> = ['$scope', '$location', 'UserService','cfpLoadingBar'];
    constructor($scope: any, locationService: ng.ILocationService, userService: UserService) {
        $scope.expandedView = true;

        $scope.$on( "$routeChangeStart", function(event, next, current) {
                userService.getCurrentUser().catch(() => {
                    locationService.path('/');
                });
        });
    }
}
