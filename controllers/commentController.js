const asyncHandler = require('express-async-handler')
const Comment = require('../models/Comment')
const Post = require('../models/Post')
const { body, validationResult } = require('express-validator')
const luxon = require('luxon')

exports.comment_get = asyncHandler(async function (req, res, next) {
    const comments = await Comment.find({})
    res.json(comments)
})

exports.comment_get_id = asyncHandler(async function (req, res, next) {
    const id = req.params.id
    const comment = await Comment.findById(id)

    res.json(comment)
})

exports.comment_post = [
    body('username').isLength({ min: 1 }).trim().withMessage('Username must be specified.'),
    body('text').isLength({ min: 1 }).trim().withMessage('Text must be specified.'),

    asyncHandler(async function (req, res, next) {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const postId = req.body.postId
        const newComment = new Comment({
            username: req.body.username,
            text: req.body.text,
            post: postId,
            formattedDate: req.body.formattedDate,
        })


        await newComment.save()
        await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } })

        const newCommentObject = newComment.toObject();
        const formattedDate = luxon.DateTime.fromJSDate(newComment.date).toLocaleString(luxon.DateTime.DATETIME_SHORT);

        res.json({
            ...newCommentObject,
            formattedDate
        })
    })
]

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