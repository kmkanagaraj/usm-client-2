import {LdapService} from '../rest/ldap';

export class LdapConfigController {
    private errorMsg: boolean;
    private authStateErr: boolean;
    private ldapServer: string;
    private port: string;
    private base: string;
    private domainAdmin: string;
    private password:string;
    private configFound: boolean;
    private ldapAuthState: boolean;

    static $inject: Array<string> = [
        '$location',
        'LdapService',
    ];

    constructor(
        private $location: ng.ILocationService,
        private LdapService: LdapService) {
            this.getConfig();
            this.getLdapAuthState();
    }

    public save():void {
        var config = {
            ldapserver: this.ldapServer,
            port: parseInt(this.port),
            base: this.base,
            domainadmin: this.domainAdmin,
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
                this.configFound = (config.ldapserver.length === 0 || !config.ldapserver.trim())
                this.ldapAuthState = true;
                this.setLdapAuthState();
            }else{
                this.errorMsg = true;
            }
        });
     }

     public setLdapAuthState(){
        alert(this.ldapAuthState);
        var config = {
            providername: "ldapauthprovider",
            confpath: "",
            status: this.ldapAuthState
        };

        this.LdapService.setLdapProvider(config).then((result) => {
            if(result.status === 200) {
                this.authStateErr = false;
            }else{
                this.authStateErr = true;
            }
        });
     }

     public getLdapAuthState(){
         this.LdapService.getLdapProvider().then((config)=>{
            this.ldapAuthState = config.status
        });
     }

     public getConfig(){
         this.LdapService.getLdapConfig().then((config)=>{
            this.ldapServer = config.ldapserver,
            this.port = config.port,
            this.base =  config.base,
            this.domainAdmin = config.domainadmin,
            this.configFound = (config.ldapserver.length === 0 || !config.ldapserver.trim())
        });
     }

}
