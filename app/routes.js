const isAuthenticated = (req, res, next) => {
		if (req.isAuthenticated()) return next();
		res.redirect('/');
	},
	isUnauthenticated = (req, res, next) =>{
		if (!req.isAuthenticated()) return next();
		res.redirect('/');
	},
	app = require('./resources').app,
	User = require('../models/user'),
	lobby = require('../controllers/lobby');

module.exports = () => {

	app
		.get('/', (req, res) => {
			if(!req.isAuthenticated()){
				res.render('login.html');
			} else {
				res.render('home-new.html', {
					isRadio: true
				});
			}
		})
		.get('/register', isUnauthenticated, (req, res) => {
			res.render('register.html', {
				message: req.flash('message')
			});
		})
		.get('/login', isUnauthenticated, (req, res) => {
			res.render('login.html', {
				message: req.flash('message')
			});
		})
		.get('/forgot-password', isUnauthenticated, (req, res) => {
			res.render('forgot-password.html', {
				user: req.user,
				message: req.flash('message')
			});
		})
		.get('/settings', isAuthenticated, (req, res) => {
			res.render('settings.html', {
				message: req.flash('message'),
				user: req.user
			});
		})
		.get('/lobby/:roomId', isAuthenticated, lobby.index)
		.get('/reset/:token', isUnauthenticated, (req, res) => {
			// Get user from database by token, flash error if not found 
			// Create some form of fallback for the user
			// Update user by token - auto update password? then email pasword
			// Update inline with password form field, needs another api endpoint - emailing might be easier and cleaners
			res.send(true);
		});
		// .get('/reset/:token', isUnauthenticated, function(req, res) {
		// User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
		// if (!user) {
		// req.flash('error', 'Password reset token is invalid or has expired.');
		// return res.redirect('/forgot');
		// }
		// res.render('reset', {
		// user: req.user
		// });
		// });
		// });

	return app;

};