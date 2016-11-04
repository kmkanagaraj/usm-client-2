import {UserService} from '../rest/user';
import {I18N} from '../base/i18n';

export class LoginController {
    private errorMsg;
    static $inject: Array<string> = [
        '$location',
        'UserService',
        'I18N',
    ];

    constructor(
        private $location: ng.ILocationService,
        private UserService: UserService,
        private i18n: I18N) {
    }

    public login(user) {
        if (user && user.username && user.password) {
            this.errorMsg = "";
            var userObject = {
                "username": user.username,
                "password": user.password
            }
            this.UserService.login(userObject)
                .then(() => {
                    this.$location.path('/dashboard');
                }).catch(() => {
                    this.errorMsg = this.i18n._("The username or password is incorrect.");
                });
        } else {
            this.errorMsg = this.i18n._("The username and password cannot be blank.");
        }
    }
}
