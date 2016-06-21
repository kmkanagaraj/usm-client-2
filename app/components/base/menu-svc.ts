/// <reference path="../../../typings/tsd.d.ts" />
import {I18N} from '../base/i18n';

export class MenuService {
    private menus: Array<any>;

    static $inject: Array<string> = [
        'I18N'
    ];

    constructor(private i18n: I18N) {
        this.menus = [{
            label: this.i18n.N_('Dashboard'),
            id: 'dashboard',
            href: '/dashboard',
            icon: 'fa fa-dashboard',
            active: true
        }, {
            label: this.i18n.N_('Clusters'),
            id: 'clusters',
            href: '/clusters',
            icon: 'pficon pficon-cluster',
            active: false
        }, {
            label: this.i18n.N_('Hosts'),
            id: 'hosts',
            href: '/hosts',
            icon: 'pficon pficon-container-node',
            active: false
        },{
            label: this.i18n.N_('Storage'),
            id: 'storage',
            href: '/storage',
            icon: 'fa fa-database',
            hasSubMenus: true,
            subMenus: [
                {
                    title: this.i18n.N_('Pools'),
                    id: 'pools',
                    href: '#/storage'
                },
                {
                    title: this.i18n.N_('RBDs'),
                    id: 'rbds',
                    href: '#/rbds'
                }
            ],
            active: false
        },{
            label: this.i18n.N_('Admin'),
            id: 'admin',
            href: '/events',
            icon: 'fa fa-cog',
            hasSubMenus: true,
            subMenus: [
                {
                    title: this.i18n.N_('Events'),
                    id: 'events',
                    href: '#/events'
                },
                {
                    title: this.i18n.N_('Tasks'),
                    id: 'tasks',
                    href: '#/tasks'
                },
                {
                    title: this.i18n.N_('Users'),
                    id: 'users',
                    href: '#/admin'
                },
                {
                    title: this.i18n.N_('LDAP/AD Settings'),
                    id: 'ldap',
                    href: '#/admin/ldap'
                },
                {
                    title: this.i18n.N_('Mail Settings'),
                    id: 'mail',
                    href: '#/admin/email'
                }
                ],
            active: false
        }];
    }

    public setTranslation() {
        if (!this.i18n.hasTranslation())
            return;

        for (var i in this.menus) {
            this.menus[i].label = this.i18n._(this.menus[i].label);
            if (this.menus[i].subMenus) {
                for (var j in this.menus[i].subMenus) {
                    this.menus[i].subMenus[j].title = this.i18n._(this.menus[i].subMenus[j].title);
                }
            }
        }

        this.i18n.setDateTimePickerTranslation();
    }

    public setActive(menuId: string) {
        this.menus = _.map(this.menus, (menu) => {
            menu.active = menu.id === menuId;
            return menu;
        });
    }

    public getMenus() {
        this.setTranslation();
        return this.menus;
    }
}
