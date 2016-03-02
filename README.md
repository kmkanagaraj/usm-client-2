# Kitoon [![Build Status](https://travis-ci.org/skyrings/kitoon.svg?branch=master)](https://travis-ci.org/skyrings/kitoon) [![Dependency Status](https://david-dm.org/skyrings/kitoon.svg)](https://david-dm.org/skyrings/kitoon) [![Issue Stats](http://issuestats.com/github/skyrings/kitoon/badge/pr?style=flat)](http://issuestats.com/github/skyrings/kitoon)

Graphical user interface for [SkyRing] (https://github.com/skyrings/skyring), a modern, extensible web-based storage management platform. Kitoon uses RESTFul API to communicate with SkyRing server. Optionally websockets are used to send instant notifcations from the SkyRing server to Kitoon UI.

## Features
### Management
1. Create a new storage cluster based on workload requirements (like OpenStack, Virtualization, Containers, etc)
2. Provisioning storage by creating gluster volumes and ceph pools
3. Support for creating gluster volumes of required size and cababilities like mirrored, erasure coded, tiered, etc.
4. Expanding a new cluster with aditional storage nodes
5. Expanding a gluster volume with extra space

### Monitoring
1. Dashboard to show overall system status and statistics
2. Alerts and notifications for critical events

### Miscellaneous
1. Asynchronous support long running operations
2. Responsive UI (Supports Desktop, Tab and Mobile)

### Upcoming
1. Support for instant notifications using WebSockets
2. Integration with provisioning tools like puppet/ansible
3. LDAP/AD authentication for the users
4. Support for extensions(plugins)


## How to build

### Building rpm package
1. install latest versions of nodejs and rpm-build `yum install nodejs npm rpm-build`
2. clone the repository `git clone https://review.gerrithub.io/skyrings/kitoon`
3. `cd kitoon`
4. run `make build-setup`
5. run `make rpm`
6. the generated rpm can be found in `${HOME}/rpmbuild/RPMS/noarch`

### Development setup in Fedora 21/22/23
1. install latest version of nodejs `yum install nodejs npm`
2. install `gulp` and `tsd` gloabally - `npm install -g gulp tsd`
3. clone the repository `git clone https://review.gerrithub.io/skyrings/kitoon`
4. `cd kitoon`
5. install node modules `npm install`
6. install typescript definition files `tsd install`
7. to build `gulp compile`

Build artificats can be found in the `dist` directory

More information about the development environment is available [here](./DEVELOPING.md)
