var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});

router.post('/posts', function(req, res, next) {
  var post = new Post(req.body);

  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});

router.get('/posts/:post', function(req, res) {

  var query = Post.findById(req.params.post); 

  query.exec(function (err, post){
    if (err) { return res.json(err); }
    if (!post) { return res.json(new Error('can\'t find post')); }

    post.populate('comments', function(err, post) {
      if (err) { return next(err); }

      return res.json(post);
    });

  });

});

router.put('/posts/:post/upvote', function(req, res, next) {

  // Cara document

  // var query = Post.findById(req.params.post); 
  
  // query.exec(function (err, post){
  //   if (err) { return res.json(err); }
  //   if (!post) { return res.json(new Error('can\'t find post')); }

  //   post.upvote(function(err,post){

  //     if (err) { return res.json(err); }

  //     return res.json(post);

  //   });
  // });

  // Cara tradisional (no filtering yet :D)

  var conditions = { _id: req.params.post };
  var update = { $inc:{upvotes: 1 }};
  var options = { multi: true };

  Post.update(conditions, update, options, function(err,numAffected){

    if (err) { return res.json(err); }

    return res.json(numAffected);
  });

});


router.post('/posts/:post/comments', function(req, res, next) {

  var comment = new Comment(req.body);

  var ObjectId = require('mongoose').Types.ObjectId; 

  var query = Post.findById(req.params.post)
  
  query.exec(function(err,post){

    // console.log(post)
    
    comment.post = post;

    comment.save(function(err, comment){
        if(err){ return res.json(err); }

        post.comments.push(comment);
        post.save(function(err, post) {
            if(err){ return res.json(err); }

            res.json(comment);
        });
    });
  })  
});

router.put('/comments/:comment/upvote', function(req, res, next) {

  var conditions = { _id: req.params.comment };
  var update = { $inc:{upvotes: 1 }};
  var options = { multi: true };

  Comment.update(conditions, update, options, function(err,numAffected){

    if (err) { return res.json(err); }

    return res.json(numAffected);
  });

});