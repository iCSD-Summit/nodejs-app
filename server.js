const express = require('express');
const app = express();
const port = process.env.port || 1337;
const path = require('path');
const fallback = require('express-history-api-fallback');
const nocache = require('nocache');
const root = path.join(__dirname, 'public');
const currentEvent = require('./data/event.json');

app.use(nocache());
app.use(express.static(root));

app.get('/api/event', function (req, res) {
    res.json(currentEvent);
});

app.get('/say-hello', function (req, res) {
    res.send('Hello World!');
});

app.use(fallback('index.html', {root: root}));

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
// app.post('/registerSubscription', (req, res) => {
//     subscriptions.push(req.body.subscription);
//     res.status(200).send({success: true});
// });
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
