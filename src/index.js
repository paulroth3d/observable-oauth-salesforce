/* eslint-disable no-console */
/*
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
*/

require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const mw = require('salesforce-oauth-express-middleware');

// configure app with session support
const app = express();
app.set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs');
app.use(session({ secret: process.env.SESSION_SECRET || 'keyboard cat', cookie: { maxAge: 60000 } }));

// setup oauth callback
app.use(mw.oauthCallback({
  clientId: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  redirectUri: process.env.OAUTH_REDIRECT_URI,
  // path: '/oauth/callback',
  // "loginUrl": "https://login.salesforce.com",
  // "requestKey": "sfoauth",
  // "verifyIdToken": true,
  callback: (req, res) => {
    // log
    const sfoauth = req.sfoauth || res.locals.sfoauth;
    const payload = sfoauth.payload;
    console.log(`received callback: ${JSON.stringify(payload)}`);
    
    // set data in session
    req.session.sfoauth = payload;
    req.session.secret = 'keyboard cat';
    req.session.save();

    // send redirect
    return res.redirect('/success');
  }
}));

// setup oauth dance initiation
app.use(mw.oauthInitiation({
  clientId: process.env.OAUTH_CLIENT_ID,
  redirectUri: process.env.OAUTH_REDIRECT_URI,
  // "loginUrl": "https://login.salesforce.com",
  // "prompt": "consent",
  callback: (req) => {
    // save session
    req.session.save();

    // log
    console.log('See if we have payload in session');
    if (process.env.SKIP_SESSION === 'true') {
      console.log('skipping the validation');
      req.session.sfoauth = {totallyFakeSession:true};
      req.session.secret = 'keyboard cat';
      req.session.save();
    } else if (!req.session || !req.session.sfoauth) {
      // we don't
      console.log('No payload found in session - returning false to initiate dance');
      return false;
    }
    console.log('We did - return true to continue middleware chain');
    return true;
  }
}));

// just show our payload data
app.get('/', (req, res, next) => {
  res.set('content-type', 'application/json');
  res.send(JSON.stringify(req.session.sfoauth, undefined, 2));
});

app.get('/success', (req, res, next) => {
  try {
    console.log('req.session.sfoauth', req.session.sfoauth);
    
    const jsonString = JSON.stringify(req.session.sfoauth);
    const observableDomain = process.env.OBSERVABLE_DOMAIN;
    res.render('./pages/success', {sfoauthJSON:jsonString, observableDomain});
  } catch (err){
    res.send(JSON.stringify({err: 'error occurred'}));
  }
});

// allow user to logout
app.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

// listen
app.listen(process.env.PORT || 3000);
