var config = require('../config');
var userPostSchema = require('../schema/UserPost');
var categorySchema = require('../schema/Category');

var userModel = {

    getAllCategory: (data, callBack) => {
        if (data) {
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
            var audioFormat = ["mp3"];

            var categoryId = reqBody.categoryId;

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

                        var fileExtension = getExtension(reqFiles.file.name);

                        console.log(fileExtension);


                        if (videoFormat.includes(getExtension(reqFiles.file.name))) {
                            var fileFormat = 'VIDEO';
                        } else if (audioFormat.includes(getExtension(reqFiles.file.name))) {
                            var fileFormat = 'AUDIO';
                        } else {
                            var fileFormat = '';
                        }

                        var respInfo = await uploadFile(reqFiles.file, 'music', 'music');

                        if (respInfo != 'error') {

                            var userPostData = {
                                title: reqBody.title,
                                categoryId: reqBody.categoryId,
                                file: respInfo,
                                fileType: fileFormat,
                                studioPrivacy: reqBody.studioPrivacy,
                                location: reqBody.location,

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
    }
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