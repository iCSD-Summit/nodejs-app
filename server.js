const express = require('express');
const fallback = require('express-history-api-fallback');
const nocache = require('nocache');
const path = require('path');
const webPush = require('web-push');
const file = require('fs');
const bodyParser = require('body-parser');
const scheduler = require('./scheduler');
const basicAuth = require('express-basic-auth');

const app = express();
const port = process.env.port || 5555;
const root = path.join(__dirname, 'public');

const currentEvent = require('./data/event.json');

app.use(nocache());
app.use(express.static(root));
app.use(bodyParser.json());

app.get('/api/event', function(req, res) {
    res.json(currentEvent);
});

// diagnostic
app.post('/api/say-hello', function(req, res) {
    res.send('Hello World!');
});

app.post('/api/what-time-is-it', function(req, res) {
    res.send(new Date(Date.now()).toString());
});

const vapidKeys = {
    publicKey: 'BK8kQcsdYJxxwtx7Uc3uj5Nbu0-_9cTsaqNZy3ir8h5aq4tm8EwnPuxINuTnGCl146XGY9XVd_IunCkHslfOL_E',
    privateKey: '77neImcUY-JX9NbMeUiwg4HEsnd6JGxzoK8-bLvwXZI'
};

webPush.setVapidDetails(
    'https://github.com/devonfw-ng-adv-training',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const subscriptions = function() {
    const currentSubscriptions = [];

    return {
        add(subscription) {
            const index = currentSubscriptions.findIndex(sub => sub.endpoint === subscription.endpoint);
            if (index === -1) {
                currentSubscriptions.push(subscription);
            }
        },

        remove(endpointKey) {
            const indexToDelete = currentSubscriptions.findIndex(sub => sub.endpoint.indexOf(endpointKey) !== -1);
            if (indexToDelete > -1) {
                currentSubscriptions.splice(indexToDelete, 1);
            }
        },

        pushAll(title, msg, type) {
            let icon = getIcon(type);

            Promise.all(currentSubscriptions.map(sub => webPush.sendNotification(
                sub, JSON.stringify({
                    notification: {
                        title: title,
                        body: msg,
                        icon: icon,
                        vibrate: [100, 50, 100],
                        data: {
                            dateOfArrival: Date.now(),
                            primaryKey: 1
                        }
                    }
                }))))
                .then(() => res.sendStatus(200))
                .catch(err => {
                    console.error('Error sending notification, reason: ', err);
                    res.sendStatus(500);
                });

        }
    };
}();

app.post('/api/subscription', (req, res) => {
        subscriptions.add(req.body);
        res.sendStatus(200);
    }
);

app.delete('/api/subscription/:endpointKey', (req, res) => {
        subscriptions.remove(req.params.endpointKey);
        res.sendStatus(200);
    }
);

app.use('/api/message/:title/:msg/:type', basicAuth({users: {admin: 'secret'}}));

app.post('/api/message/:title/:msg/:type', (req, res) => {
    const title = req.params.title || '';
    const msg = req.params.msg || '';
    const type = req.params.type || '';

    subscriptions.pushAll(title, msg, type);
    res.send(`Sent ${title}: ${msg}.`);
});

// REMOTE SCHEDULER
app.get('/schedule/:year/:month/:day/:hour/:min/:sec/:title/:msg/:type', function(req, res) {
    scheduler.schedule(req.params.year, req.params.month, req.params.day, req.params.hour, req.params.min, req.params.sec,
        () => subscriptions.pushAll(req.params.title, req.params.msg, req.params.type));
    res.send('Task scheduled');
});

app.use(fallback('index.html', {root: root}));

function getIcon(type) {
    switch (type.toLowerCase()) {
        case "coffee":
            return "./assets/coffee.png";
        case "lunch":
            return "./assets/lunch.png";
        case "alert":
            return "./assets/alert.png";
        default:
            return "./assets/logo.png";
    }
}

const server = app.listen(port, function() {
    const address = server.address();
    const host = address.address;
    const port = address.port;

    // schedule meals
    scheduler.schedule(2018, 9, 18, 11, 0, 0, () => subscriptions.pushAll('Community Summit 2018', 'Time for lunch!', 'lunch'));

    console.log('Example app listening at http://%s:%s', host, port);
});
