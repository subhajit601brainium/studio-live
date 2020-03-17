const async = require('async');
const musicModel = require('../models/music');

var cmsService = {
    getAllCategory: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                musicModel.getAllCategory(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    },
    userPost: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                musicModel.userPost(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    }
}

module.exports = cmsService;