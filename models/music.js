var config = require('../config');
var userPostSchema = require('../schema/UserPost');
var categorySchema = require('../schema/Category');
var userLikeSchema = require('../schema/UserLike');
var userFavouriteSchema = require('../schema/UserFavourite');

var userModel = {

    getAllCategory: (data, callBack) => {
        if (data) {

            var category = ['Blues', 'Children Music',
                'Classical',
                'Country',
                'Dance',
                'Easy Listening',
                'Electronic',
                'Pop',
                'Folk',
                'Holiday',
                'Industrial',
                'Gospel',
                'Jazz',
                'Latin',
                'Metal',
                'New Age',
                'Opera',
                'R&B',
                'Soul',
                'Reggae',
                'Rock',
                'Rap',
                'Hip Hop',
                'Vocal',
                'Africa',
                'Asia']

            // for(let cat of category) {
            //     cat = cat.replace(/\s/g,'')
            //     var categoryNameObj = {
            //         categoryName: cat,
            //         isActive: true
            //     }
            //     new categorySchema(categoryNameObj).save(function (err, result) {
            //         if (err) {
            //             callBack({
            //                 success: false,
            //                 STATUSCODE: 500,
            //                 message: 'Something went wrong.',
            //                 response_data: {}
            //             });
            //         } else {
            //         }
            //     })
            // }

            // console.log(data);
            categorySchema.find({ isActive: true })
                .then(function (res) {
                    // console.log(res);
                    callBack({
                        success: true,
                        STATUSCODE: 200,
                        message: 'Category fetch successfully.',
                        response_data: res
                    });
                })
                .catch(function (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Something went wrong.',
                        response_data: {}
                    });
                });
        }
    },
    userPost: (data, callBack) => {
        if (data) {
            var reqBody = data.body;
            var reqFiles = data.files;
            console.log(reqFiles.file.name);

            var videoFormat = ["avi", "flv", "wmv", "mp4", "mov"];
            var audioFormat = ["mp3", "m4a"];

            var categoryId = reqBody.categoryId;

            var fileType = reqBody.fileType;

            categorySchema.findOne({ isActive: true, _id: categoryId })
                .then(async function (res) {
                    // console.log(res);

                    if (res == null) {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'Category mismatch, please try again.',
                            response_data: {}
                        });
                    } else {

                        var fileFormat = fileType;


                        var respInfo = await uploadFile(reqFiles.file, 'music', 'music');

                        if (respInfo != 'error') {

                            var userPostData = {
                                title: reqBody.title,
                                categoryId: reqBody.categoryId,
                                file: respInfo,
                                fileType: fileFormat,
                                studioPrivacy: reqBody.studioPrivacy,
                                location: reqBody.location,
                                customerId: reqBody.customerId

                            }
                            new userPostSchema(userPostData).save(function (err, result) {
                                if (err) {
                                    callBack({
                                        success: false,
                                        STATUSCODE: 500,
                                        message: 'Something went wrong.',
                                        response_data: {}
                                    });
                                } else {
                                    callBack({
                                        success: true,
                                        STATUSCODE: 200,
                                        message: 'Post Updated successfully.',
                                        response_data: {}
                                    });
                                }

                            })

                        } else {
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Something went wrong.',
                                response_data: {}
                            });
                        }
                    }

                })
                .catch(function (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Something went wrong.',
                        response_data: {}
                    });
                });
        }
    },
    updatePost: (data, callBack) => {
        if (data) {
            var reqBody = data.body;


            var categoryId = reqBody.categoryId;
            var musicId = reqBody.musicId;

            var fileType = reqBody.fileType;

            categorySchema.findOne({ isActive: true, _id: categoryId })
                .then(async function (res) {
                    // console.log(res);

                    if (res == null) {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'Category mismatch, please try again.',
                            response_data: {}
                        });
                    } else {
                        userPostSchema.findOne({ _id: musicId })
                            .then(async function (userPost) {
                                if (userPost != null) {

                                    var userPostData = {
                                        title: reqBody.title,
                                        categoryId: reqBody.categoryId,
                                        studioPrivacy: reqBody.studioPrivacy,
                                        location: reqBody.location,
                                        customerId: reqBody.customerId

                                    }

                                    userPostSchema.updateOne({ _id: musicId },
                                        { $set: userPostData }, function (err, updateResult) {
                                            if (err) {
                                                callBack({
                                                    success: false,
                                                    STATUSCODE: 500,
                                                    message: 'Something went wrong.',
                                                    response_data: {}
                                                });
                                            } else {

                                                if (updateResult.nModified == 1) {
                                                    callBack({
                                                        success: true,
                                                        STATUSCODE: 200,
                                                        message: 'Music updated successfully.',
                                                        response_data: {}
                                                    });
                                                } else {
                                                    callBack({
                                                        success: false,
                                                        STATUSCODE: 422,
                                                        message: 'Something went wrong.',
                                                        response_data: {}
                                                    });
                                                }


                                            }
                                        });
                                } else {
                                    callBack({
                                        success: false,
                                        STATUSCODE: 500,
                                        message: 'Something went wrong.',
                                        response_data: {}
                                    });
                                }



                            })


                    }

                })
                .catch(function (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Something went wrong.',
                        response_data: {}
                    });
                });
        }
    },
    myPost: (data, callBack) => {
        if (data) {
            var reqBody = data.body;
            // console.log(data);
            userPostSchema.find({ customerId: reqBody.customerId })
                .then(async function (myMusic) {
                    // console.log(res);
                    var myMusicArr = [];
                    if (myMusic.length > 0) {
                        for (let myMc of myMusic) {
                            var myMusicAobj = {
                                title: myMc.title,
                                file: myMc.file,
                                location: myMc.location,
                                musicId: myMc._id,
                                fileType: myMc.fileType,
                                studioPrivacy: myMc.studioPrivacy,
                                createdAt: myMc.createdAt,
                                updatedAt: myMc.updatedAt
                            }

                            //Category
                            var musicCategory = await categorySchema.findOne({ _id: myMc.categoryId, isActive: true });
                            myMusicAobj.musicCategory = musicCategory.categoryName;

                            //Like
                            myMusicAobj.likeNo = await userLikeSchema.countDocuments({ postId: myMc._id});

                            //Comment
                            myMusicAobj.commentNo = 0;

                            //Favourite
                            myMusicAobj.isFavourite = await userFavouriteSchema.countDocuments({ postId: myMc._id});;

                            //Customer
                            myMusicAobj.customerName = '';
                            myMusicAobj.profileImage = '';

                            myMusicArr.push(myMusicAobj);
                        }
                    }

                    var respObj = {
                        path: `${config.serverhost}:${config.port}/music/`,
                        post: myMusicArr
                    }
                    callBack({
                        success: true,
                        STATUSCODE: 200,
                        message: 'My post fetched successfully.',
                        response_data: respObj
                    });
                })
                .catch(function (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Something went wrong.',
                        response_data: {}
                    });
                });
        }
    },
    deletePost: (data, callBack) => {
        if (data) {
            var reqBody = data.body;
            // console.log(data);
            userPostSchema.findOne({ customerId: reqBody.customerId, _id: reqBody.musicId })
                .then(async function (myMusic) {

                    if (myMusic != null) {

                        userPostSchema.deleteOne({ _id: reqBody.musicId }, function (err) {

                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 422,
                                    message: 'Something went wrong.',
                                    response_data: respObj
                                });
                            } else {

                                if (myMusic.file != '') {
                                    var fs = require('fs');
                                    var filePath = `public/music/${myMusic.file}`;
                                    fs.unlink(filePath, (err) => { });
                                }

                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Post deleted successfully.',
                                    response_data: {}
                                });
                            }

                        })
                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'Something went wrong.',
                            response_data: respObj
                        });
                    }

                })
                .catch(function (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Something went wrong.',
                        response_data: {}
                    });
                });
        }
    },
    musicLikeUnlike: (data, callBack) => {
        if (data) {
            var reqBody = data.body;
            // console.log(data);
            userPostSchema.findOne({ customerId: reqBody.customerId, _id: reqBody.musicId })
                .then(async function (myMusic) {

                    if (myMusic != null) {

                        var userLikes = await userLikeSchema.findOne({ postId: reqBody.musicId, likeCustomerId: reqBody.likeCustomerId });
                        if (reqBody.like == 'YES') {

                            var userLikeObj = {
                                likeCustomerId: reqBody.likeCustomerId,
                                postId: reqBody.musicId,
                                addedOn: new Date()
                            }

                            if (userLikes == null) {



                                new userLikeSchema(userLikeObj).save(function (err, result) {
                                    if (err) {
                                        callBack({
                                            success: false,
                                            STATUSCODE: 500,
                                            message: 'Something went wrong.',
                                            response_data: {}
                                        });
                                    } else {
                                        callBack({
                                            success: true,
                                            STATUSCODE: 200,
                                            message: 'Post liked successfully.',
                                            response_data: {}
                                        });
                                    }

                                })

                            } else {
                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Post liked successfully.',
                                    response_data: {}
                                });
                            }

                        } else {

                            if (userLikes != null) {
                                userLikeSchema.deleteOne({ postId: reqBody.musicId, likeCustomerId: reqBody.likeCustomerId }, function (err) {

                                    if (err) {
                                        callBack({
                                            success: false,
                                            STATUSCODE: 422,
                                            message: 'Something went wrong.',
                                            response_data: {}
                                        });
                                    } else {

                                        callBack({
                                            success: true,
                                            STATUSCODE: 200,
                                            message: 'Post unliked successfully.',
                                            response_data: {}
                                        });
                                    }

                                })

                            } else {
                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Post unliked successfully.',
                                    response_data: {}
                                });
                            }

                        }


                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'Something went wrong.',
                            response_data: {}
                        });
                    }

                })
                .catch(function (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Something went wrong.',
                        response_data: {}
                    });
                });
        }
    },
    musicFavouriteUnfavourite: (data, callBack) => {
        if (data) {
            var reqBody = data.body;
            // console.log(data);
            userPostSchema.findOne({ customerId: reqBody.customerId, _id: reqBody.musicId })
                .then(async function (myMusic) {

                    if (myMusic != null) {

                        var userLikes = await userFavouriteSchema.findOne({ postId: reqBody.musicId, likeCustomerId: reqBody.likeCustomerId });
                        if (reqBody.favourite == 'YES') {

                            var userLikeObj = {
                                favouriteCustomerId: reqBody.favouriteCustomerId,
                                postId: reqBody.musicId,
                                addedOn: new Date()
                            }

                            if (userLikes == null) {



                                new userFavouriteSchema(userLikeObj).save(function (err, result) {
                                    if (err) {
                                        callBack({
                                            success: false,
                                            STATUSCODE: 500,
                                            message: 'Something went wrong.',
                                            response_data: {}
                                        });
                                    } else {
                                        callBack({
                                            success: true,
                                            STATUSCODE: 200,
                                            message: 'Post favourited successfully.',
                                            response_data: {}
                                        });
                                    }

                                })

                            } else {
                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Post favourited successfully.',
                                    response_data: {}
                                });
                            }

                        } else {

                            if (userLikes != null) {
                                userFavouriteSchema.deleteOne({ postId: reqBody.musicId, favouriteCustomerId: reqBody.favouriteCustomerId }, function (err) {

                                    if (err) {
                                        callBack({
                                            success: false,
                                            STATUSCODE: 422,
                                            message: 'Something went wrong.',
                                            response_data: {}
                                        });
                                    } else {

                                        callBack({
                                            success: true,
                                            STATUSCODE: 200,
                                            message: 'Post unfavourited successfully.',
                                            response_data: {}
                                        });
                                    }

                                })

                            } else {
                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Post unfavourited successfully.',
                                    response_data: {}
                                });
                            }

                        }


                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'Something went wrong.',
                            response_data: {}
                        });
                    }

                })
                .catch(function (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Something went wrong.',
                        response_data: {}
                    });
                });
        }
    },

};


function getExtension(filename) {
    return filename.substring(filename.indexOf('.') + 1);
}

//File upload
function uploadFile(file, folder, name) {
    return new Promise(function (resolve, reject) {

        //Get image extension
        var ext = getExtension(file.name);

        // The name of the input field (i.e. "image") is used to retrieve the uploaded file
        let sampleFile = file;

        var file_name = `${name}-${Math.floor(Math.random() * 1000)}-${Math.floor(Date.now() / 1000)}.${ext}`;

        // Use the mv() method to place the file somewhere on your server
        sampleFile.mv(`public/${folder}/${file_name}`, function (err) {
            if (err) {
                console.log('err', err);
                return reject('error');
            } else {
                return resolve(file_name);
            }
        });
    });
}

module.exports = userModel;