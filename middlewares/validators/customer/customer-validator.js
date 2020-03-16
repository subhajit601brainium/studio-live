var joi = require('@hapi/joi');

module.exports = {
    viewProfile: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        }
    },
    editProfile: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            firstName: joi.string().required().error(new Error('First name is required')),
            lastName: joi.string().required().error(new Error('Last name is required')),
            email: joi.string().required().email().error((err) => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Email is required');
                } else {
                    return new Error('Please enter valid email');
                }
            }),
            phone: joi.number().required().error((err) => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Phone is required');
                } else if (typeof err[0].value === 'string') {
                    return new Error('Please enter valid phone');
                }
            })
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        }
    },
    changePassword: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            oldPassword: joi.string().required().error(new Error('Old password is required')),
            newPassword: joi.string().required().error(err => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('New password is required');
                } else if (err[0].value == req.body.oldPassword) {
                    return new Error('New password and new password must not match');
                }
            }),
            confirmPassword: joi.string().valid(joi.ref('newPassword')).required().error(err => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Confirm password is required');
                } else if (err[0].value !== req.body.newPassword) {
                    return new Error('New password and confirm password must match');
                }
            })
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        }
    },
    profileImageUpload: async (req, res, next) => {
        //console.log(req.files);
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required'))
        });
        const imageRules = joi.object({
            image: joi.object().required().error(new Error('Image is required')),
        });

        const value = await rules.validate(req.body);
        const imagevalue = await imageRules.validate(req.files);
        // console.log(req.body);
        if (value.error) {
            // console.log('1');
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else if (imagevalue.error) {
            // console.log('1');
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: 'Image is required'
            })
        } else if (!["jpg", "jpeg", "bmp", "gif", "png"].includes(getExtension(req.files.image.name))) { 
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: 'Invalid image format.'
            })
        } else {
            next();
        }
    },
    changeEmail: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            newEmail: joi.string().required().email().error((err) => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Email is required');
                } else {
                    return new Error('Please enter valid email');
                }
            }),
            confirmEmail: joi.string().required().email().error(err => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Please confirm your new email.');
                } else if (err[0].value != req.body.newEmail) {
                    return new Error('New email and confirm email must match.');
                }
            })
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        }
    },
    verifyEmail: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            email: joi.string().required().email().error((err) => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Email is required');
                } else {
                    return new Error('Please enter valid email');
                }
            }),
            newEmail: joi.string().required().email().error((err) => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Email is required');
                } else {
                    return new Error('Please enter valid email');
                }
            })
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        }
    }
}

function getExtension(filename) {
    return filename.substring(filename.indexOf('.')+1); 
}