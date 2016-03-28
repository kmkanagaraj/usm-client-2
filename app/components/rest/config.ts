/// <reference path="../../../typings/tsd.d.ts" />

interface AppConfig {
    ceph_min_monitors: number;
}

export class ConfigService {
    private config: AppConfig;
    static $inject: Array<string> = ['$q','Restangular'];
    constructor(
        private $q: ng.IQService,
        private rest: restangular.ICollection) {
    }

    public initConfig() {
        return this.rest.all('config').customGET('config.json').then((config) => {
            this.config = config || {};
        });
    }

    public getConfig(): ng.IPromise<{}> {
        var defered = this.$q.defer();
        if(this.config) {
            defered.resolve(this.config);
        }
        else {
            this.initConfig().then(() => {
                defered.resolve(this.config);
            });
        }
        return defered.promise;
    }

    public getValue(key: string): ng.IPromise<number|string|boolean> {
        var defered = this.$q.defer();
        if(this.config) {
            defered.resolve(this.config[key]);
        }
        else {
            this.initConfig().then(() => {
                defered.resolve(this.config[key]);
            });
        }
        return defered.promise;
    }
}
