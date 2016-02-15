import {LdapService} from '../rest/ldap';

export class LdapConfigController {
    private errorMsg: boolean;
    private ldapserver : string;
    private port: string;
    private base: string;
    private domainadmin: string;
    private password:string;

    static $inject: Array<string> = [
        '$location',
        'LdapService',
    ];

    constructor(
        private $location: ng.ILocationService,
        private LdapService: LdapService) {
            this.getConfig();
    }

    public save():void {
        var config = {
            ldapserver: this.ldapserver,
            port: parseInt(this.port),
            base: this.base,
            domainadmin: this.domainadmin,
            password: this.password,
            uid: "cn",
            firstname: "displayName",
            lastname: "sn",
            displayname: "",
            email: "mail"
        };

        this.LdapService.saveLdapConfig(config).then((result) => {
            if(result.status === 200) {
                this.errorMsg = false;
            }else{
                this.errorMsg = true;
            }
        });
     }

     public getConfig(){
         this.LdapService.getLdapConfig().then((config)=>{
            this.ldapserver = config.ldapserver,
            this.port = config.port,
            this.base =  config.base,
            this.domainadmin = config.domainadmin
        });
     }

}
