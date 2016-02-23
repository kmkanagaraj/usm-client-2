import {MailSettingsService} from '../rest/mail-setting';

export class MailSettingController {
    private mailnotification:boolean;
    private smtpserver:string;
    private port:number;
    private usessl:boolean;
    private usetls:boolean;
    private encryption:string;
    private mailid:string;
    private password:string;
    private from:string;
    private subprefix:string;
    private recipent:any;
    private skipverify:boolean;
    
     static $inject: Array<string> = [
        '$location',
        'MailSettingsService',
    ];
    constructor(
        private $location: ng.ILocationService,
        private MailSettingsService:MailSettingsService) {
            this.getNotify();
    }
    
    public save():void {
        if(this.usessl == true)
            this.encryption='ssl';
        if(this.usetls == true)
            this.encryption='tls';
        var notifier = {
            mailnotification: this.mailnotification,
            smtpserver : this.smtpserver,
            port : this.port,
            encryption : this.encryption,
            mailid : this.mailid,
            password : this.password,
            subprefix : this.subprefix,
            skipverify :this.skipverify
        };
        this.MailSettingsService.saveMailSettings(notifier).then((result) => {
            if(result.status === 200) {
                this.$location.path('/admin');
            }
        });
        
     }
    
      public getNotify(){
         this.MailSettingsService.getMailNotifier().then((notifier)=>{
            this.mailid = notifier.mailid;
            this.port = notifier.port;
            this.skipverify = notifier.skipverify;
            this.smtpserver = notifier.smtpserver;
            this.encryption = notifier.encryption;
        });
     }
}