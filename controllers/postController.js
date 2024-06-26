const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const Post = require('../models/Post');
const { body, validationResult } = require('express-validator');
const { DateTime } = require('luxon')

async function createSlug(title) {
    try {
        const slug = slugify(title, {
            replacement: '-',
            lower: true,
            strict: true
        });
        return slug;
    } catch (error) {
        console.error('Error creating slug:', error);
        throw new Error('Slug creation failed');
    }
}

// posts routes
exports.postsGet = asyncHandler(async function (req, res, next) {

    const posts = await Post.find({}).populate('comments').exec();

    const postsWithFormattedTime = posts.map(post => {
        const { _id, title, content, comments, date, img, slug, description , published} = post;

        const postedTime = DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED);

        const formattedComments = comments.map(comment => {
            const { _id, username, text, date } = comment;
            const formattedDate = DateTime.fromJSDate(date).toLocaleString(DateTime.DATETIME_SHORT);
            return { _id, username, text, formattedDate };
        });

        return { _id, title, content, comments: formattedComments, postedTime , img, slug, description, published };
    });

    res.json(postsWithFormattedTime);
})

exports.postsGetId = asyncHandler(async function (req, res, next) {
    const slug = req.params.slug;
    try {
        const post = await Post.findOne({ slug }).populate('comments').exec();

        if (!post) {
            res.status(404).json('Post not found');
            return;
        }

        // Format the date for each comment
        const postWithFormattedComments = {
            ...post.toObject(),
            comments: post.comments.map(comment => ({
                ...comment.toObject(),
                formattedDate: DateTime.fromJSDate(comment.date).toLocaleString(DateTime.DATETIME_SHORT)
            }))
        };

        res.json(postWithFormattedComments);

    } catch (error) {
        console.error('Error in finding post by slug', error);
        res.status(500).json('Error in finding post by slug');
    }
})

exports.postsPost = [
    body('title').isLength({ min: 1 }).trim().withMessage('Title must be specified.'),
    body('content').isLength({ min: 1 }).trim().withMessage('Content must be specified.'),
    body('description').isLength({min: 1}).trim().withMessage('Description must be specified.'),
    asyncHandler(async function (req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const title = req.body.title;
        const content = req.body.content;
        const description = req.body.description;

        try {
            const slug = await createSlug(title);

            const newPost = new Post({
                title,
                content,
                slug,
                published: req.body.published,
                img: req.body.img,
                description,
            });

            await newPost.save();
            res.json({msg: 'Post created!', newPost });
        } catch (error) {
            console.error('Error in creating post', error);
            res.status(500).json('Error in creating post');
        }
    })
]

exports.postsPut = [
    body('title').isLength({ min: 1 }).trim().withMessage('Title must be specified.'),
    body('content').isLength({ min: 1 }).trim().withMessage('Content must be specified.'),
    body('description').isLength({ min: 1 }).trim().withMessage('Description must be specified.'),
    
    asyncHandler(async function (req, res, next) {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const id = req.params.id;
        const { published, content, title, img, description } = req.body;
    
        try {
            await Post.findByIdAndUpdate(id, { published, content, title, img, description }, {new: true});
            res.json({msg: 'Post Updated!'});
        } catch (err) {
            console.error('Error in finding post by slug', err);
            res.status(500).json('Error in updating ');
     }
    })
    
]
exports.postsDelete = asyncHandler(async function (req, res, next) {
    const id = req.params.id;
    await Post.findByIdAndDelete(id)
    res.json('Post deleted');
})

