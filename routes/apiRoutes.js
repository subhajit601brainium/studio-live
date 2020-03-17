'use strict';

var express = require('express');
var config = require('../config');
const customerValidator = require('../middlewares/validators/customer/customer-validator');
const musicValidator = require('../middlewares/validators/customer/music-validator');
const jwtTokenValidator = require('../middlewares/jwt-validation-middlewares');

/** Import Services */
var registerService = require('../services/registerService');
var cmsService = require('../services/cmsService');
var musicService = require('../services/musicService');

var api = express.Router();
api.use(express.json());
api.use(express.urlencoded({extended: false}));

/** Registration */
api.post('/register', function(req, res) {
    registerService.register(req.body, function(result) {
        res.send(result);
    });
});

/** Verify account using otp */
api.post('/verifyAccount', function(req, res) {
    registerService.accountVerification(req.body, function(result) {
        res.send(result);
    })
});

/** Resend Otp */
api.post('/resendOtp', function(req, res) {
    registerService.resendOtp(req.body, function(result) {
        res.send(result);
    });
});

/** User Login */
api.post('/login', function(req, res) {
    registerService.login(req.body, function(result) {
        res.send(result);
    });
});

/** Forgot Password */
api.post('/forgotPassword', function(req, res) {
    registerService.forgotPassword(req.body, function(result) {
        res.send(result);
    });
});

/** Reset Password */
api.post('/resetPassword', function(req, res) {
    registerService.resetPassword(req.body, function(result) {
        res.send(result);
    });
});

/** View Profile */
api.post('/viewProfile',jwtTokenValidator.validateToken, customerValidator.viewProfile, function(req, res) {
    registerService.viewProfile(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Edit Profile */
api.post('/editProfile',jwtTokenValidator.validateToken, customerValidator.editProfile, function(req, res) {
    registerService.editProfile(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Change password */
api.post('/changePassword',jwtTokenValidator.validateToken, customerValidator.changePassword, function(req, res) {
    registerService.changePassword(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Profile image upload */
api.post('/profileImageUpload',jwtTokenValidator.validateToken,customerValidator.profileImageUpload, function(req, res) {
    registerService.profileImageUpload(req, function(result) {
        res.status(200).send(result);
    });
})

/** Change Email Rquest */
api.post('/changeEmail',jwtTokenValidator.validateToken,customerValidator.changeEmail, function(req, res) {
    registerService.changeEmail(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Profile image upload */
api.post('/verifyEmail',jwtTokenValidator.validateToken,customerValidator.verifyEmail, function(req, res) {
    registerService.verifyEmail(req.body, function(result) {
        res.status(200).send(result);
    });
})


/** Get CMS Pages */
api.post('/getCmsPages', function(req, res) {
    cmsService.getCms(req.body, function(result) {
        res.send(result);
    });
});

/** Get All Categories */
api.post('/getAllCategories',jwtTokenValidator.validateToken,musicValidator.getCategory, function(req, res) {
    musicService.getAllCategory(req.body, function(result) {
        res.send(result);
    });
});

/** User Post */
api.post('/userPost',jwtTokenValidator.validateToken,musicValidator.userPost, function(req, res) {
    musicService.userPost(req, function(result) {
        res.send(result);
    });
});


module.exports = api;