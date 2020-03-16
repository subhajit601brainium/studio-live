const async = require('async');
const cmsSchema = require('../schema/Cms');

var cmsModel = {
    getCmsPageBySlug: (data, callBack) => {
        if (data) {
            cmsSchema.findOne({slug: data.slug}, function(err, result) {
                if (err) {
                    callBack({
                        "response_code": 5005,
                        "response_message": err.message,
                        "response_data": {}
                    });
                } else {
                    if (result) {
                        callBack({
                            "response_code": 2000,
                            "response_message": "Success",
                            "response_data": result
                        });
                    } else {
                        callBack({
                            "response_code": 2008,
                            "response_message": 'No page found',
                            "response_data": {}
                        });
                    }
                }
            })
        } else {
            callBack({
                "response_code": 5005,
                "response_message": "Given Data Error",
                "response_data": {}
            });
        }
    }
}

module.exports = cmsModel;