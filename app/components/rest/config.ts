/// <reference path="../../../typings/tsd.d.ts" />

export class ConfigService {
    rest: restangular.IService;
    static $inject: Array<string> = ['Restangular'];
    constructor(rest: restangular.ICollection) {
        this.rest = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('/config/');
        });
    }

    getConfig(){
        return this.rest.all('config.json').customGET('');
    }
}
