if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const cors = require("cors");
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    // email => users.find(user => user.email === email),
    // _id => users.find(user => user._id === _id),
    email => MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
        if (err) throw err;
        const dbo = db.db('reactchat');
        const collection = dbo.collection('users');
        const query = { email: email };
        collection.find(query).toArray((err, result) => {
            if (err) throw err;
            console.log(result);
            db.close();
            return result.email;
        })

    }),
    _id => MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
        if (err) throw err;
        const dbo = db.db('reactchat');
        const collection = dbo.collection('users');
        const query = { _id: _id };
        collection.find(query).toArray((err, result) => {
            if (err) throw err;
            db.close();
            return result._id;
        })

    }),
);

const users = [];

app.set('view-engine', 'ejs');
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: false }))
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name });
});

app.get('/name', (req, res) => {
    res.send(users[0].name);
});


app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/user',
    failureRedirect: '/',
    failureFlash: true,
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // users.push({
        //     id: Date.now().toString(),
        //     name: req.body.name,
        //     email: req.body.email,
        //     password: hashedPassword,
        // })
        MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
            if (err) throw err;
            const dbo = db.db('reactchat');
            const user = {
                _id: Date.now().toString(),
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
            };
            dbo.collection('users').insertOne(user, (err, result) => {
                if (err) throw err;
                console.log('Created user: ' + result);
                db.close();
            });
        });
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
    console.log(users);
})

app.delete('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
})

app.get('/welcome', (req, res) => {
    res.send('Welcome!');
});


// app.post('/world', (req, res) => {
//     console.log(req.body);
//     res.send(
//         `I received your POST request. This is what you sent me: ${req.body.post}`,
//     );
// });

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/user');
    }
    next();
}


app.listen(8080);
