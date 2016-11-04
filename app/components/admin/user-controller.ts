import {UserService} from '../rest/user';
import {I18N} from "../base/i18n";

export class UserController {
    private errorMsg;
    private userList : Array<any>;
    private currentUser : any;
    private updateActionUserLabel: any;
    private updateActionNotificationLabel: any;
    static $inject: Array<string> = [
        '$location',
        'UserService',
        'I18N',
    ];

    constructor(
        private $location: ng.ILocationService,
        private UserService: UserService,
        public i18n: I18N) {
        this.updateActionUserLabel = function(user) {
            user.actionuser = i18n.sprintf(i18n._("%s user"),
                                           user.status ?
                                           i18n._("Disable") :
                                           i18n._("Enable"));
        };
        this.updateActionNotificationLabel = function(user) {
            user.actionnotification = i18n.sprintf(i18n._("%s Notification"),
                                                   user.notificationenabled ?
                                                   i18n._("Disable") :
                                                   i18n._("Enable"));
        };
        this.getUsers();
        this.getCurrentUser();
    }

    public getUsers(){
        this.UserService.getUsers().then((users)=>{
            this.userList = users;
            var i18n = this.i18n;
            for (var i in this.userList) {
                if (this.userList[i] == null)
                    continue;
                if (this.userList[i].username == null)
                    continue;
                this.updateActionUserLabel(this.userList[i]);
                this.updateActionNotificationLabel(this.userList[i]);
            }
        });
    }

    public getCurrentUser(){
        this.UserService.getCurrentUser().then((user)=>{
            this.currentUser = user;
        });
    }

    public addUser(): void {
        this.$location.path('/admin/new');
    }

    public addLdapUser(): void {
        this.$location.path('/admin/newLdap');
    }

    public editUser(userId): void {
        this.$location.path('/admin/edit/'+userId);
    }

    public toggleEmailStatus(user): void {
        user.notificationenabled = !user.notificationenabled;
        this.updateActionNotificationLabel(user);
        this.UserService.updateUser(user.username,user).then((result) => {
            if(result.status === 200) {
                this.$location.path('/admin');
            }
        });
    }

    public toggleUserStatus(user): void {
        user.status = !user.status;
        this.updateActionUserLabel(user);
        this.UserService.updateUser(user.username,user).then((result) => {
            if(result.status === 200) {
                this.$location.path('/admin');
            }
        });
    }

    public deleteUser(userId):void {
        this.UserService.deleteUser(userId).then((result) => {
            if(result.status === 200) {
                this.getUsers();
            }
        });
    }

    public configureLdap(): void {
        this.$location.path('/admin/ldap');
    }
}
