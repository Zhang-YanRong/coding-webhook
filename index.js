const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const verifyWebhook = (req) => {
    if (!req.headers['user-agent'].includes('Coding.net Hook')) {
        return false;
    }
    const theirSignature = req.headers['x-coding-signature'];
    console.log(theirSignature);
    const payload = req.body;
    const secret = process.env.MYADMIN;
    console.log(secret)
    const ourSignature = `sha1=${crypto.createHmac('sha1', secret).update(payload).digest('hex')}`;
    console.log(ourSignature)
    return crypto.timingSafeEqual(Buffer.from(theirSignature), Buffer.from(ourSignature));
};


const app = express();
app.use(bodyParser.text({ type: '*/*' }));

const notAuthorized = (req, res) => {
    console.log('Someone who is NOT Coding is calling, redirect them');
    res.redirect(301, '/'); // Redirect to domain root
};

const authorizationSuccessful = () => {
    console.log('Coding is calling, do something here');
    // TODO: Do something here
};

app.post('/webhook', (req, res) => {
    if (verifyWebhook(req)) {
        // Coding calling
        authorizationSuccessful();
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Thanks Coding <3');
    } else {
        // Someone else calling
        notAuthorized(req, res);
    }
});

app.all('*', notAuthorized); // Only webhook requests allowed at this address

app.listen(6666);

console.log('Webhook service running at http://localhost:3000');
