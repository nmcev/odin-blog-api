var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const s3 = require('../controllers/s3')
const User = require('../models/User')


const postController = require('../controllers/postController')
const commentControllers = require('../controllers/commentController');
const loginController = require('../controllers/loginController');


function authenticateToken(req, res, next) {
  const { token } = req.cookies;

  if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Token missing' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
          return res.status(401).json({ error: 'Unauthorized - Invalid token' });
      }

      req.user = decoded;
      next(); 
  });
}



router.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
})


router.post('/login', loginController.login_post)

//logout routes
router.post('/logout', (req, res) => {
  res.clearCookie('token').json({message: 'logout successfully!'})
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

router.post('/comments', commentControllers.comment_post)

router.put('/comments/:id', authenticateToken, commentControllers.comment_put)

router.delete('/comments/:id', authenticateToken, commentControllers.comment_delete)


// validate token
router.get('/auth', authenticateToken, (req, res) => {
  res.json({ valid: true })
})

router.get('/upload', async(req, res) => {
  const url = await s3.generateUploadURL()
  
  res.json({url})
})


module.exports = router;
