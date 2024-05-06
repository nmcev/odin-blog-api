const asyncHandler = require('express-async-handler')
const Comment = require('../models/Comment')
const Post = require('../models/Post')


exports.comment_get = asyncHandler(async function (req, res, next) {
    const comments = await Comment.find({})
    res.json(comments)
})

exports.comment_get_id = asyncHandler(async function (req, res, next) {
    const id = req.body.id
    const comment = await Comment.findById(id)

    res.json(comment)
})

exports.comment_post = asyncHandler(async function (req, res, next) {
    const postId = req.body.postId
    const newComment = new Comment({
        username: req.body.username,
        text: req.body.text,
        post: postId
    })


    await newComment.save()
    await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } })
    res.json(newComment)
})

exports.comment_put = asyncHandler(async function (req, res, next) {
    const id = req.params.id
    const comment = await Comment.findById(id)

    comment.username = req.body.username
    comment.text = req.body.text

    await comment.save()
    res.json(comment)
})

exports.comment_delete = asyncHandler(async function (req, res, next) {
    const id = req.params.id

    await Comment.findByIdAndDelete(id)
    res.json('Comment deleted')
})