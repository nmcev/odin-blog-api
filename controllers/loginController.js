const passport = require('passport');
const passportJwt = require('passport-jwt');
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.ACCESS_TOKEN_SECRET
}, async (jwtPayload, done) => {
    try {
        const user = await User.findOne({ username: jwtPayload.username });
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));

exports.login_post = [
    body('username').isLength({ min: 1 }).trim().withMessage('Username must be specified.'),
    body('password').isLength({ min: 1 }).trim().withMessage('Password must be specified.'),

    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const username = req.body.username;
        const password = req.body.password;

        try {
            const user = await User.findOne({ username });

            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Username', path: 'username' }] });
            }

            const isMatch = bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Password', path: 'password' }] });
            }

            const accessToken = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h'});

            res.json({ accessToken, status: 'success' });
        } catch (error) {
            next(error);
        }
    }
];

exports.signup_post = [
    body('username').isLength({ min: 1 }).trim().withMessage('Username must be specified.'),
    body('password').isLength({ min: 1 }).trim().withMessage('Password must be specified.'),

    async (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const username = req.body.username;
        const password = req.body.password;

        try {
            const user = await User.findOne({ username });

            if (user) {
                return res.status(400).json('User already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({ username, password: hashedPassword });
            await newUser.save();

            res.json('User created');
        } catch (error) {
            next(error);
        }
    }];
