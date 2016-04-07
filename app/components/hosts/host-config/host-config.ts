// <reference path="../typings/tsd.d.ts" />

import {ServerService} from '../../rest/server';
import {Node} from '../../rest/server';

export class HostConfigController {
    private id: string;
    private configData: Node;

    //Services that are used in this class.
    static $inject: Array<string> = [
        '$q',
        '$scope',
        '$log',
        'ServerService',
    ];

    constructor(private qService: ng.IQService,
        private scopeService: ng.IScope,
        private logService: ng.ILogService,
        private serverService: ServerService) {
            this.serverService.get(this.id).then((host:Node) => {
                this.configData = host;
            });
    }

}
