# iCSD Community Summit Event Progressive Web Application

## Hosting

This application is hosted on Azure under: [https://icsd-summit.azurewebsites.net/](https://icsd-summit.azurewebsites.net/) 

## Deployment to Azure

In order to (re)deploy the application to Azure you need to follow these steps:

### Build the client

Go to the [ng-client](https://github.com/iCSD-Summit/ng-client) repository, and build it for production with a service worker:
```
npm run sw-build-live
```

### Copy the client's web content to the Node.js app

The best approach is to clear the [nodejs-app](https://github.com/iCSD-Summit/nodejs-app)'s `public` folder first and copy the web content
from the [ng-client](https://github.com/iCSD-Summit/ng-client)'s `dist` folder to the
[nodejs-app](https://github.com/iCSD-Summit/nodejs-app)'s `public` folder after that.

### Push the changes to the [nodejs-app](https://github.com/iCSD-Summit/nodejs-app) repository

After pushing your changes to the [nodejs-app](https://github.com/iCSD-Summit/nodejs-app) repository
on the `master` branch the (re)deploy to Azure is triggered automatically.
