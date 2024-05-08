var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')

const User = require('../models/User')


const postController = require('../controllers/postController')
const commentControllers = require('../controllers/commentController');
const loginController = require('../controllers/loginController');


function authenticateToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const token = bearer[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      req.token = token;

      next();
    });
  } else {
    res.sendStatus(401);
  }
}

express().use((req, res, next) => {

  console.log(req.user);
  next();
})

router.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
})


router.post('/login', loginController.login_post)

//logout routes
router.post('/logout', (req, res) => {
  res.send('Logout route')
})

//signup routes
router.post('/signup', loginController.signup_post)

// posts routes
router.get('/posts', postController.postsGet)

router.get('/posts/:slug', postController.postsGetId)

router.post('/posts', authenticateToken, postController.postsPost)

router.put('/posts/:id', authenticateToken, postController.postsPut)

router.delete('/posts/:id', authenticateToken, postController.postsDelete)

// comments routes
router.get('/comments', commentControllers.comment_get)

router.get('/comments/:id', commentControllers.comment_get_id)

router.post('/comments', authenticateToken, commentControllers.comment_post)

router.put('/comments/:id', authenticateToken, commentControllers.comment_put)

router.delete('/comments/:id', authenticateToken, commentControllers.comment_delete)


module.exports = router;
