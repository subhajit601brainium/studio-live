var joi = require('@hapi/joi');

module.exports = {
    getCategory: async (req, res, next) => {
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
    userPost: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            title: joi.string().required().error(new Error('Title is required')),
            categoryId: joi.string().required().error(new Error('Category id is required')),
            studioPrivacy: joi.string().required().error(new Error('Studio Privacy is required')),
            fileType: joi.string().required().error(new Error('File type is required')),
            location: joi.string().allow(''),
        });

        const fileRules = joi.object({
            file: joi.object().required().error(new Error('File is required'))
        });

        const value = await rules.validate(req.body);
        const filesValue = await fileRules.validate(req.files);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else if (filesValue.error) {
            // console.log('1');
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: 'File is required'
            })
        } else if (!["avi", "flv", "wmv", "mp4", "mov","mp3","m4a","3gpp","mpeg4"].includes(getExtension(req.files.file.name))) { 
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: 'Invalid file format.'
            })
        } else {
            next();
        }
    },
    myPost: async (req, res, next) => {
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
    updatePost: async (req, res, next) => {
        const rules = joi.object({
            musicId: joi.string().required().error(new Error('Music id is required')),
            customerId: joi.string().required().error(new Error('Customer id is required')),
            title: joi.string().required().error(new Error('Title is required')),
            categoryId: joi.string().required().error(new Error('Category id is required')),
            studioPrivacy: joi.string().required().error(new Error('Studio Privacy is required')),
            location: joi.string().allow(''),
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
    deletePost: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            musicId: joi.string().required().error(new Error('Music id is required'))
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
    musicLikeUnlike: async (req, res, next) => {
        const inputVal = ["YES", "NO"];
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            musicId: joi.string().required().error(new Error('Music id is required')),
            likeCustomerId: joi.string().required().error(new Error('Like customer id is required')),
            like: joi.string().required().valid(...inputVal).error(new Error('Like true false is required'))
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
    musicFavouriteUnfavourite: async (req, res, next) => {
        const inputVal = ["YES", "NO"];
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            musicId: joi.string().required().error(new Error('Music id is required')),
            favouriteCustomerId: joi.string().required().error(new Error('Like customer id is required')),
            favourite: joi.string().required().valid(...inputVal).error(new Error('Like true false is required'))
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
}


function getExtension(filename) {
    return filename.substring(filename.indexOf('.')+1); 
}