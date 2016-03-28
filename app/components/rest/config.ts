/// <reference path="../../../typings/tsd.d.ts" />

export class ConfigService {
    private rest: restangular.IService;
    static $inject: Array<string> = ['Restangular'];
    constructor(rest: restangular.ICollection) {
        this.rest = rest;
    }

    getConfig(){
        return this.rest.all('config').customGET('config.json');
    }
}
