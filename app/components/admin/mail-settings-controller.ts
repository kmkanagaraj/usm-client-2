import {MailSettingsService} from '../rest/mail-settings';

export class MailSettingsController {
    private mailNotification:boolean;
    private smtpServer:string;
    private port:number;
    private useSsl:boolean;
    private useTls:boolean;
    private encryption:string;
    private mailId:string;
    private password:string;
    private from:string;
    private subPrefix:string;
    private recipent:any;
    private skipVerify:boolean;
    private errorMsg:boolean;

     static $inject: Array<string> = [
        '$location',
        'MailSettingsService',
    ];
    constructor(
        private $location: ng.ILocationService,
        private MailSettingsService:MailSettingsService) {
            this.getMailNotificationSettings();
    }

    public save():void {
        if(this.useSsl == true){
            this.encryption='ssl';
        }    
        else if(this.useTls == true){
            this.encryption='tls';
        }
        var notifier = {
            mailnotification: this.mailNotification,
            smtpserver : this.smtpServer,
            port : this.port,
            encryption : this.encryption,
            mailid : this.mailId,
            password : this.password,
            subprefix : this.subPrefix,
            skipverify :this.skipVerify
        };
        this.MailSettingsService.saveMailSettings(notifier).catch((result) => {
            if(result.status === 200) {
                this.$location.path('/admin');
            }
            else {
                this.errorMsg = true;
            }
        });
     }

      public getMailNotificationSettings(){
         this.MailSettingsService.getMailNotifier().then((notifier)=>{
            this.mailId = notifier.mailid;
            this.port = notifier.port;
            this.skipVerify = notifier.skipverify;
            this.smtpServer = notifier.smtpserver;
            this.encryption = notifier.encryption;
            this.mailNotification = notifier.mailnotification;
            this.subPrefix = notifier.subprefix;
        });
     }
}