# USM Client

[![Join the chat at https://gitter.im/kmkanagaraj/usm-client-2](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/kmkanagaraj/usm-client-2?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
USM Client is a user interface for Unified Storage Manager

This uses following frameworks and tools
* AngularJS
* Typescript
* SASS
* Gulp
* Browserify
* Bower

## How to build
### Fedora 20/21/22
1. install latest version of nodejs `yum install nodejs npm`
2. install `gulp`, `bower` and `tsd` gloabally - `npm install -g gulp bower tsd`
3. clone the repository `git clone git@github.com:kmkanagaraj/usm-client-2.git`
4. `cd usm-client-2`
5. install node modules `npm install`
6. install bower dependencies `bower install`
7. install typescript definition files `tsd install`
8. to build `gulp compile`

Build artificats can be found in the `dist` directory

More information about the development is available [here](./DEVELOPING.md)
