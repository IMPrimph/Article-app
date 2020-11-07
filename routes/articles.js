const express = require('express')
const router = express.Router()

//bring in models
let Article = require('../models/article')

//bring user model
let User = require('../models/user')

//edit a article
router.get('/edit/:id', (req, res) => {
	Article.findById(req.params.id, (err, article) => {
		if(article.author != req.user._id){
			req.flash('danger', 'You are not authorized')
			return res.redirect("/")
		}
		res.render('edit', {
			article : article
		})
	})
})

//add articles
router.get("/add", ensureAuthenticated, (req, res) => {
	res.render('add', {
		title : "Add Article"
	})
})

//post route for articles
router.post('/add', (req, res) => {
	req.checkBody('title', 'Title is required').notEmpty() 
	//req.checkBody('author', 'Author is required').notEmpty() 
	req.checkBody('body', 'Body is required').notEmpty() 

	//get errors
	let errors = req.validationErrors()

	if(errors){
		res.render('add', {
			title : 'Add Article',
			errors: errors
		})
	}
	else
	{
		let article = new Article()
		article.title = req.body.title
		article.author = req.user._id
		article.body = req.body.body

		article.save((err) => {
			if(err){
				console.log(err)
			}
			else
			{
				req.flash('success', 'Article Added')
				res.redirect('/')
			}
		})
	}
})

//update articles
router.post('/edit/:id', ensureAuthenticated, (req, res) => {
	let article = {}
	article.title = req.body.title
	article.author = req.body.user._id
	article.body = req.body.body

	let query = {_id:req.params.id}

	Article.update(query, article, (err) => {
		if(err){
			console.log(err)
		}
		else
		{
			req.flash('success', 'Article Updated')
			res.redirect('/')
		}
	})
})

//delete request
router.delete('/:id', (req, res)=>{

	if(!req.user._id){
		res.status(500).send()
	}

	let query = {_id:req.params.id}

	Article.findById(req.params.id, (err, article) => {
		if(article.author != req.user._id){
			res.status(500).send()
		}
		else
		{
			Article.remove(query, (err) => {
				if(err){
					console.log(err)
				}
				res.send('Success')
			})	
		}
	})
})

//get single article
router.get('/:id', (req, res) => {
	Article.findById(req.params.id, (err, article) => {
		User.findById(article.author, (err, user) => {
			res.render('article', {
				article : article,
				author: user.name
			})			
		})
	})
})

//Access control
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next()
	}
	else
	{
		req.flash('danger', 'Please Login')
		res.redirect('/users/login')
	}
}

module.exports = router