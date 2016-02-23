/// <reference path="../../../typings/tsd.d.ts" />

export class RouteConfig {
	static $inject: Array<string> = ['$routeProvider'];
	constructor(private routeProvider: ng.route.IRouteProvider) {
		routeProvider.when('/', {
			templateUrl: 'views/login/login.html',
			name: '',
			controller: 'LoginController',
			controllerAs: 'login'
		}).when('/dashboard', {
			templateUrl: 'views/dashboard/dashboard.html',
			name: 'dashboard',
			controller: 'DashboardController',
			controllerAs: 'dash'
		}).when('/first', {
			templateUrl: 'views/first/first.html',
			name: '',
			controller: 'FirstController',
			controllerAs: 'first'
		}).when('/clusters', {
			templateUrl: 'views/clusters/clusters.html',
			name: 'clusters',
			controller: 'ClusterController',
            controllerAs: 'clusters'
		}).when('/clusters/new', {
			templateUrl: 'views/clusters/clusters-new.html',
			name: 'clusters',
			controller: 'ClusterNewController',
			controllerAs: 'cluster'
		}).when('/clusters/expand/:id', {
			templateUrl: 'views/clusters/clusters-expand.html',
			name: 'clusters',
			controller: 'ClusterExpandController',
			controllerAs: 'cluster'
		}).when('/clusters/:id', {
			templateUrl: 'views/clusters/clusters-detail.html',
			name: 'clusters',
			controller: 'ClusterDetailController',
			controllerAs: 'clusterdetail'
		}).when('/hosts', {
			templateUrl: 'views/hosts/hosts.html',
			name: 'hosts',
			controller: 'HostController',
			controllerAs: 'hosts'
		}).when('/hosts/detail/:id', {
			templateUrl: 'views/hosts/hosts-detail.html',
			name: 'hosts',
			controller: 'HostDetailController',
			controllerAs: 'hostdetail'
		}).when('/storage', {
			templateUrl: 'views/storage/storage-list.html',
			name: 'storage',
			controller: 'StorageListController',
			controllerAs: 'storages'
		}).when('/storage/new', {
			templateUrl: 'views/storage/storage-new.html',
			name: 'storage',
			controller: 'StorageNewController',
			controllerAs: 'storages'
		}).when('/storage/new/openstack/:cluster_id', {
			templateUrl: 'views/storage/storage-new-openstack.html',
			name: 'storage',
			controller: 'OpenStackStorageController',
			controllerAs: 'storage'
		}).when('/storage/new/object/:clusterid', {
			templateUrl: 'views/storage/object/storage-new-object.html',
			name: 'storage',
			controller: 'ObjectStorageController',
			controllerAs: 'storage'
		}).when('/volumes', {
			templateUrl: 'views/volumes/volumes.html',
			name: 'volumes',
			controller: 'VolumeController',
			controllerAs: 'volumes'
		}).when('/volumes/new', {
			templateUrl: 'views/volumes/volumes-new.html',
			name: 'volumes',
			controller: 'VolumeNewController',
			controllerAs: 'volume'
		}).when('/volumes/expand/:id', {
			templateUrl: 'views/volumes/volumes-expand.html',
			name: 'volumes',
			controller: 'VolumeExpandController',
			controllerAs: 'volume'
		}).when('/volumes/detail/:id', {
			templateUrl: 'views/volumes-detail.html',
			name: 'volumes',
			controller: 'VolumeDetailController',
			controllerAs: 'volumedetail'
		}).when('/pools', {
			templateUrl: 'views/pools/pools.html',
			name: 'pools',
			controller: 'PoolController',
			controllerAs: 'pools'
		}).when('/pools/new', {
			templateUrl: 'views/pools/pools-new.html',
			name: 'pools',
			controller: 'PoolNewController',
			controllerAs: 'pool'
		}).when('/admin', {
			templateUrl: 'views/admin/admin.html',
			controller: 'UserController',
			controllerAs: 'users',
			name: 'admin'
		}).when('/admin/new', {
			templateUrl: 'views/admin/add-user.html',
			controller: 'UserNewController',
			controllerAs: 'user',
		}).when('/admin/edit/:userid', {
			templateUrl: 'views/admin/edit-user.html',
			controller: 'UserEditController',
			controllerAs: 'userEdit',
		}).when('/admin/newLdap', {
			templateUrl: 'views/admin/add-ldap-user.html',
			controller: 'LdapUserController',
			controllerAs: 'ldapUsers',
		}).when('/admin/ldap', {
			templateUrl: 'views/admin/ldap-settings.html',
			controller: 'LdapConfigController',
			controllerAs: 'ldap',
			name: 'ldap'
		}).when('/admin/mailsettings', {
            templateUrl: 'views/admin/mail-settings.html',
            controller: 'MailSettingController',
            controllerAs: 'mail',
        }).when('/events', {
			templateUrl: 'views/events/event-list.html',
			controller: 'EventListController',
			controllerAs: 'events',
			name: 'events'
		}).when('/tasks/:taskId', {
			templateUrl: 'views/tasks/task-details.html',
			controller: 'TaskDetailController',
			controllerAs: 'task'
		}).otherwise({
			redirectTo: '/'
		});
	}
}
