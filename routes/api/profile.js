const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current user profie
// @access  Private
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.user.id,
		}).populate('user', ['name', 'avatar']);

		if (!profile) {
			return res.status(400).json('There is no profile for this user.');
		}

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route   POST api/profile
// @desc    Create/Update user profie
// @access  Private

router.post('/', auth, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty) {
		return res.status(400).json({
			errors: errors.array(),
		});
	}

	const {
		company,
		website,
		location,
		bio,
		status,
		githubusername,
		skills,
		youtube,
		facebook,
		twitter,
		instagram,
		linkedin,
		handle,
	} = req.body;

	const profileFields = {};
	profileFields.user = req.user.id;
	if (handle) profileFields.handle = handle;
	if (company) profileFields.company = company;
	if (website) profileFields.website = website;
	if (location) profileFields.location = location;
	if (bio) profileFields.bio = bio;
	if (status) profileFields.status = status;
	if (githubusername) profileFields.githubusername = githubusername;
	// Skills - Spilt into array
	if (typeof skills !== 'undefined') {
		profileFields.skills = skills.split(',');
	}

	// Social
	profileFields.social = {};
	if (youtube) profileFields.social.youtube = youtube;
	if (twitter) profileFields.social.twitter = twitter;
	if (facebook) profileFields.social.facebook = facebook;
	if (linkedin) profileFields.social.linkedin = linkedin;
	if (instagram) profileFields.social.instagram = instagram;

	try {
		let profile = await Profile.findOne({ user: req.user.id });

		if (profile) {
			profile = await Profile.findOneAndUpdate(
				{ user: req.user.id },
				{ $set: profileFields },
				{ new: true }
			);

			return res.json(profile);
		}

		profile = new Profile(profileFields);
		await profile.save();

		return res.json(profile);
	} catch (err) {
		console.error(err.message);
	}
});

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public

router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar']);
		res.json(profiles);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server error');
	}
});
module.exports = router;
