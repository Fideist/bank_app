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

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));


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
          db.find_balance([user.id]).then(balance => {
            if(!balance[0]) {
              let initialBalance = Math.floor((Math.random() + 1) * 100);
              db.create_initial_balance([initialBalance, user.id]).then( createdBalance => {
                if(createdBalance) {
                  return done(null, { id: user.id })
                }
              })
            } else {
              return done(null, { id: user.id })
            }
          })
        } else {

            db.create_user({
                username: profile.displayName,
                email: profile.emails[0].value,
                img: profile.picture,
                auth_id: profile.identities[0].user_id
            }).then(users => {
              let user = users[0];
              let initialBalance = Math.floor((Math.random() + 1) * 100);
              db.create_initial_balance([initialBalance, user.id]).then( createdBalance => {
                if(createdBalance) {
                  return done(null, { id: user.id })
                }
              })
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
        var db = app.get('db');
        db.find_balance([user.id]).then(balance => {
          console.log('This is the balance from the database', balance)
          if(balance) {
            user.balance = balance[0].balance
            return done(null, user);
          }
        })
    });
});

app.get('/auth', passport.authenticate('auth0'));
app.get('/auth/callback', passport.authenticate('auth0', {
    successRedirect: 'http://localhost:3200/#/accounts',
    failureRedirect: 'http://localhost:3200/#/'
}))

app.get('/auth/me', (req, res) => {
    console.log('This is the req.user', req.user)
    if(req.user) {
       return res.send(req.user);
    } else {
      return res.status(400).send('Login required')
    }
})


app.post('/user/balance', (req, res) => {
  var db = app.get('db');
  switch(req.query.Action) {
    case 'deposit':
    let balanceToUpdate = Number(req.query.currentAmount) + Number(req.query.amount);
    console.log('balance to update', balanceToUpdate)

    db.deposit_100([balanceToUpdate, req.query.userId]).then(balance => {
      console.log('balance from database', balance)
      if(balance) {
        res.status(200).send(balance)
      }
    })
    break;

    case 'withdraw':
    db.check_balance([req.query.userID]).then(balance => {
      let currentBalance = balance[0].balance
      let balanceToUpdate = req.query.currentAmount - req.query.amount
      if(currentBalance >= 100) {
        db.withdraw_100([balanceToUpdate, req.query.userID]).then( balance => {
          if(balance) {
            res.status(200).send(balance)
          }
        })
      }
      else {
        res.status(200).send('Balance is too low');
      }
    })
    break;

    default:
    res.status(200).send('No action submitted')
    break;
  }
})

app.listen(port, () => {
    console.log(`listening on port ${port}`);
})
