const async = require('async');
const cmsModel = require('../models/cms');

var cmsService = {
    getCms: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                if (!data.slug || typeof data.slug === undefined) {
                    nextCb(null, {"response_code": 5002, "response_message": "Slug is required", "response_data": {} });
                } else {
                    nextCb(null, {"response_code": 2000, "response_message": "Validation Success", "response_data": {} });
                }
            },
            function(arg1, nextCb) {
                if (arg1.response_code === 2000) {
                    /** Get Cms Pages */
                    cmsModel.getCmsPageBySlug(data, function(result) {
                        nextCb(null, result);
                    });
                } else {
                    nextCb(null, arg1);
                }
            }
        ], function(err, result) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": {}
                });
            } else {
                callBack(result)
            }
        })
    }
}

module.exports = cmsService;