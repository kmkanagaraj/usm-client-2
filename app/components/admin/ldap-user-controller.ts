import {UserService} from '../rest/user';

export class LdapUserController {
    private errorMsg;
    private userList : Array<any>;
    private alluserList : Array<any>;
    static $inject: Array<string> = [
        '$location',
        'UserService',
    ];

    constructor(
        private $location: ng.ILocationService,
        private UserService: UserService) {
        this.getUsers();
        this.getLdapUsers();
    }

    public getLdapUsers(){
        this.UserService.getLdapUsers().then((users)=>{
            this.userList = users;
            var diff = _.difference(_.pluck(this.userList, "username"), _.pluck(this.alluserList, "username"));
            this.userList = _.filter(this.userList, function(obj) {
                var index = diff.indexOf(obj.username);
                if(index >= 0 ){
                    obj.imported = false;
                }
                   return true;
                 });
        });
    }

   public getUsers(){
        this.UserService.getUsers().then((users)=>{
            this.alluserList = users;
        });
    }

    public addLdapUser(user){
        this.UserService.addUser(user).then((user)=>{
            
        });
    }

    public cancel(){
        this.$location.path('/admin');
    }
}
