const express = require('express');
const fallback = require('express-history-api-fallback');
const nocache = require('nocache');
const path = require('path');
const webpush = require('web-push');
const file = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.port || 1337;
const root = path.join(__dirname, 'public');
const subscriptionsFile = path.join(__dirname, 'subscriptions', 'subscriptions.json');

const pushOptions = {
    vapidDetails: {
        subject: 'https://www.capgemini.com/pl-pl/',
        publicKey: 'BMjRh7QofnoNTHxNAoM8wrfsCdEJH39JNg-P-JMnvyIOcuybzJcvwQt8wM6yPJad-phACdKLoGocjCfs9tZ4dL4',
        privateKey: '03xK2AyoX_eZNyx7tJm8972okURODqimuTOln71v55A'
    },
    TTL: 60 * 60
}

app.use(nocache());
app.use(express.static(root));
app.use(bodyParser.json());

app.get('/say-hello', function (req, res) {
    res.send('Hello World!');
});

app.use(fallback('index.html', {root: root}));

// PUSH NOTIFICATION

// SUBSCRIBERS
app.post('/registerSubscription', (req, res) => { 
    getAllSubscriptions().then((data) => {
        let subscriptions = data;
        subscriptions.push(req.body.subscription);
        return saveSubscription(subscriptions);
    })
    .then(() => {
        res.status(200).send({success: true});
    })
    .catch(() => {
        res.sendStatus(500);
    });
});

app.post('/unregisterSubscription', (req, res) => {
    getAllSubscriptions().then((data) => {
        let subscriptionObject = req.body.subscription;
        let subscriptions = data;

        subscriptions = subscriptions.filter(el => el.endpoint !== subscriptionObject.endpoint);
        return saveSubscription(subscriptions);
    }).then(() => {
        res.status(200).send({success: true});
    })
    .catch(() => {
        res.sendStatus(500);
    });
});

function getAllSubscriptions() {
    return new Promise((resolve, reject) => { 
        file.readFile(subscriptionsFile, (err, data) => {
            let result;
            if (!err) {
                result = data && data.length > 0 ? JSON.parse(data) : [];            
            } else {
                result = [];
            }

            resolve(result);
        });
    });
}

function saveSubscription(subscriptions) {
    return new Promise((resolve, reject) => {
        file.writeFile(subscriptionsFile, JSON.stringify(subscriptions), {flag: 'w+' }, (err) => {
            if (err) {
                console.log('Cannot write subscriptions: ' + err.message);     
                reject();
            }
            
            resolve();                
        });
    });
}


// const webpush = require('web-push'),
//       bodyParser = require('body-parser'),
//       nodeSchedule = require('node-schedule'),
//       options = {
//           vapidDetails: {
//               subject: 'http://www.google.com',
//               publicKey: 'BPOOvDThOUuSxiC-DuMv-WXG0XbSCwKR6Jux0CkyeyZ86OMF2U64VYKksNCJKoJdq1ISzYKfCUUxB6hKM0zeNGA',
//               privateKey: 'UGU2kXUSbtRVFxDuqNpbSVfzU3C6RrRznJXi3e6G_tM'
//           },
//           TTL: 60 * 60
//       };
//
// var subscriptions = [];
//
// app.use(bodyParser.json());
//
// app.post('/push/:title/:msg', (req, res) => {
//     var title = req.params.title,
//         msg = req.params.msg;
//     push(title, msg);
//     res.send(`Sent ${title}: ${msg}.`);
// });
//
//
// function push(title, msg) {
//     subscriptions.forEach(subscriber => {
//         console.log(`Sending to ${subscriber.endpoint}...`);
//         webpush.sendNotification(
//             subscriber,
//             JSON.stringify({title: title,
//                             body: msg,
//                             icon: '/images/coffee.png',
//                             badge: '/images/coffee-beans.png',
//                             vibrate: [200, 100, 200, 100, 200, 100, 200]
//                            }),
//             options).catch((err) => {
//                 console.log('Error while pushing to [' + subscriber.endpoint + ']: ' + err.statusCode + ', ' + err.body);
//             });
//     });
// }
//

//
// app.post('/unregisterSubscription', (req, res) => {
//     var subscriptionObject = req.body.subscription;
//
//     subscriptions = subscriptions.filter(el =>
//         el.endpoint !== subscriptionObject.endpoint);
//     res.status(200).send({success: true});
// });
//
// function schedule(day, h, m, type) {
//     nodeSchedule.scheduleJob(new Date(2017, 2, day, h, m, 0), () => {
//         console.log(`Sending ${type}`);
//         push('Break', type);
//     });
// }
//
// schedule(23, 12, 15, 'Lunch');
// schedule(23, 15, 30, 'Coffee Break');
// schedule(24, 10, 30, 'Coffee Break');
// schedule(24, 12, 00, 'Lunch');
// schedule(24, 15, 45, 'Coffee Break');
// schedule(25, 10, 30, 'Coffee Break');
// schedule(25, 12, 30, 'Lunch');


const server = app.listen(port, function () {
    const address = server.address();
    const host = address.address;
    const port = address.port;

    console.log('Example app listening at http://%s:%s', host, port);
});
