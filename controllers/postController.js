const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const Post = require('../models/Post');

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
    res.json(await Post.find({}));
})

exports.postsGetId = asyncHandler(async function (req, res, next) {
    const slug = req.body.slug;
    try {
        const post = await Post.findOne({ slug })

        if (!post) {
            res.status(404).json('Post not found');
            return;
        }
        res.json(post);

    } catch (error) {
        console.error('Error in finding post by slug', error);
        res.status(500).json('Error in finding post by slug');
    }
})

exports.postsPost = asyncHandler(async function (req, res, next) {
    const slug = await createSlug(req.body.title);

    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        slug: slug,
        date: new Date(),
    });

    await post.save();
    res.json(post);
})

exports.postsPut = asyncHandler(async function (req, res, next) {
    const id = req.params.id;

    const newPost = new Post({
        title: req.body.title,
        content: req.body.content,
    })

    await Post.findByIdAndUpdate(id, newPost);
    res.json('Post updated');
})

exports.postsDelete = asyncHandler(async function (req, res, next) {
    const id = req.params.id;
    await Post.findByIdAndDelete(id)
    res.json('Post deleted');
})

