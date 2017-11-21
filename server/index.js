const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const massive = require('massive');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
require('dotenv').config();

const app = express();
const port = 3005;



massive(process.env.DB_CONNECTION_STRING).then( db => {
    app.set('db', db);
}).catch(err => console.log('err', err))

app.use(cors());

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false

}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new Auth0Strategy({
    domain: process.env.AUTH_DOMAIN,
    clientID: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    callbackURL: process.env.AUTH_CALLBACK
}, (accessToken, refreshToken, extraParams, profile, done) => {
    const db = app.get('db');
    db.find_user({auth_id: profile.identities[0].user_id}).then(users => {
        let user = users[0];
        if (user) {
            return done(null, { id: user.id })
        } else {
            db.create_user({
                username: profile.displayName,
                email: profile.emails[0].vaule,
                img: profile.picture,
                auth_id: profile.identities[0].user_id
            }).then(users => {
                let user = users[0];
                return done(null, { id: user.id })
            });
        }
    })
}));

passport.serializeUser((user, done) => {
    return done(null, user);
});

passport.deserializeUser((user, done) => {
    app.get('db').find_session_user({id: user.id}).then(users => {
        let user = users[0];
        return done(null, user);
    });
});

app.get('/auth', passport.authenticate('auth0'));
app.get('/auth/callback', passport.authenticate('auth0', {
    successRedirect: 'http://localhost:3000/#/accounts',
    failureRedirect: 'http://localhost:3000/#/'
}))

app.get('/auth/me', (req, res) => {
    if(req.user) {
        return res.send(req.user);
    }
})

app.listen(port, () => {
    console.log(`listening on port ${port}`);
})