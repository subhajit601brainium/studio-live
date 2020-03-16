var async = require('async');
var userModel = require('../models/user');

const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

var regiterService = {
    register: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                if (!data.name || typeof data.name === undefined) {
                    nextCb(null, {"response_code": 5002, "response_message": "Name is required", "response_data": {} });
                } else if (!data.email || typeof data.email === undefined) {
                    nextCb(null, {"response_code": 5002, "response_message": "Email is required", "response_data": {} });
                } else if (!emailReg.test(String(data.email).toLowerCase())) {
                    nextCb(null, {"response_code": 5002, "response_message": "Please Enter Valid Email Address", "response_data": {} });
                } else if (!data.dob || typeof data.dob === undefined) {
                    nextCb(null, {"response_code": 5002, "response_message": "Date of Birth is required", "response_data": {} });
                } else if (!data.password || typeof data.password === undefined) {
                    nextCb(null, {"response_code": 5002, "response_message": "Password is required", "response_data": {} });
                } else if (!data.confirmPassword || typeof data.confirmPassword === undefined) {
                    nextCb(null, {"response_code": 5002, "response_message": "Confirm Password is required", "response_data": {} });
                } else if (String(data.password).toLowerCase() !== String(data.confirmPassword).toLowerCase()) {
                    nextCb(null, {"response_code": 5002, "response_message": "Password and Confirm Password should match", "response_data": {} });
                } else {
                    nextCb(null, {"response_code": 2000, "response_message": "Validation Success", "response_data": {} });
                }
            },
            function(agr1, nextCb) {
                if (agr1.response_code === 2000) {
                    /** Save User to the db */
                    userModel.save(data, function(result) {
                        nextCb(null, result);
                    });

                } else {
                    nextCb(null, agr1);
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
        });
    },

    /** Account verification using OTP */
    accountVerification: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                if (!data.email || typeof data.email === undefined) {
                    nextCb(null, { "response_code": 5002, "response_message": "Email is required", "response_data": {} })
                } else if (!emailReg.test(String(data.email).toLowerCase())) {
                    nextCb(null, {"response_code": 5002, "response_message": "Please Enter Valid Email Address", "response_data": {} });
                } else if(!data.otp || typeof data.otp === undefined) {
                    nextCb(null, { "response_code": 5002, "response_message": "Otp is required", "response_data": {} })
                } else {
                    nextCb(null, { "response_code": 2000, "response_message": "Validation success", "response_data": {} })
                }
            },
            function(agr1, nextCb) {
                if (agr1.response_code === 2000) {
                    /** Verify Otp ang generate auth token */
                    userModel.verifyOtp(data, function(result) {
                        nextCb(null, result);
                    });
                } else {
                    nextCb(null, agr1);
                }
            },
            function(arg2, nextCb) {
                if (arg2.response_code === 2000) {
                    /** Generate JWT Token */
                    userModel.generateToken(arg2.response_data, 'verify', function(result) {
                        nextCb(null, result);
                    });
                } else {
                    nextCb(null, arg2);
                }
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": {}
                });
            } else {
                callBack(result);
            }
        });
    },

    /** Resend Otp */
    resendOtp: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                if (!data.email || typeof data.email === undefined) {
                    nextCb(null, {"response_code": 5002, "response_message": "Email is required", "response_data": {}});
                } else if (!emailReg.test(String(data.email).toLowerCase())) {
                    nextCb(null, {"response_code": 5002, "response_message": "Please Enter Valid Email Address", "response_data": {}});
                } else {
                    nextCb(null, {"response_code": 2000, "response_message": "Validation success", "response_data": {}});
                }
            },
            function(arg1, nextCb) {
                if (arg1.response_code === 2000) {
                    userModel.resendOtp(data, function(result) {
                        nextCb(null, result);
                    });
                } else {
                    nextCb(null, arg1);
                }
            },
        ], function(err, result) {
            if (err) {
                callBack({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": {}
                });
            } else {
                callBack(result);
            }
        });
    },

    /** User Login */
    login: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                if (!data.email || typeof data.email === undefined) {
                    nextCb(null, {"response_code": 5002, "response_message": "Email is required", "response_data": {}});
                } else if (!emailReg.test(String(data.email).toLowerCase())) {
                    nextCb(null, {"response_code": 5002, "response_message": "Please Enter Valid Email Address", "response_data": {} });
                } else if (!data.password || typeof data.email === undefined) {
                    nextCb(null, {"response_code": 5002, "response_message": "Password is required", "response_data": {}});
                } else {
                    nextCb(null, {"response_code": 2000, "response_message": "Validation success", "response_data": {}});
                }
            },
            function(arg1, nextCb) {
                if (arg1.response_code === 2000) {
                    userModel.login(data, function(result) {
                        nextCb(null, result);
                    });
                } else {
                    nextCb(null, arg1);
                }
            },
            function(arg2, nextCb) {
                if (arg2.response_code === 2000) {
                    userModel.generateToken(arg2.response_data, 'login', function(result) {
                        nextCb(null, result);
                    });
                } else {
                    nextCb(null, arg2);
                }
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": {}
                });
            } else {
                callBack(result);
            }
        });
    },

    /** Forgot Password */
    forgotPassword: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                if (!data.email || typeof data.email === undefined) {
                    nextCb(null, {"response_code": 5002, "response_message": "Email is required", "response_data": {}});
                } else if (!emailReg.test(String(data.email).toLowerCase())) {
                    nextCb(null, {"response_code": 5002, "response_message": "Please Enter Valid Email Address", "response_data": {} });
                } else {
                    nextCb(null, {"response_code": 2000, "response_message": "Validation success", "response_data": {}});
                }
            },
            function(arg1, nextCb) {
                if (arg1.response_code === 2000) {
                    userModel.forgotPassword(data, function(result) {
                        nextCb(null, result);
                    });
                } else {
                    nextCb(null, arg1);
                }
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": {}
                });
            } else {
                callBack(result);
            }
        });
    },

    /** Reset Password */
    resetPassword: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                if (!data.email || typeof data.email === undefined) {
                    nextCb(null, {"response_code": 5002, "response_message": "Email is required", "response_data": {}});
                } else if (!data.password || typeof data.password === undefined) {
                    nextCb(null, {"response_code": 5002, "response_message": "Password is required", "response_data": {}});
                } else if (!data.confirmPassword || typeof data.confirmPassword === undefined) {
                    nextCb(null, {"response_code": 5002, "response_message": "Confirm Password is required", "response_data": {}});
                } else if (String(data.password).toLowerCase() !== String(data.confirmPassword).toLowerCase()) {
                    nextCb(null, {"response_code": 5002, "response_message": "Password and Confirm Password should match", "response_data": {} });
                } else {
                    nextCb(null, {"response_code": 2000, "response_message": "Validation Success", "response_data": {} });
                }
            },
            function(arg1, nextCb) {
                if (arg1.response_code === 2000) {
                    userModel.resetPassword(data, function(result) {
                        nextCb(null, result);
                    });
                } else {
                    nextCb(null, arg1);
                }
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": {}
                });
            } else {
                callBack(result);
            }
        });
    },
    viewProfile: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                userModel.viewProfile(data, function(result) {
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
    editProfile: (data, callBack) => {
            async.waterfall([
                function(nextCb) {
                    userModel.editProfile(data, function(result) {
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
    changePassword: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                userModel.changePassword(data, function(result) {
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
    profileImageUpload: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                userModel.profileImageUpload(data, function(result) {
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
    changeEmail: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                userModel.changeEmail(data, function(result) {
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
    verifyEmail: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                userModel.verifyEmail(data, function(result) {
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

module.exports = regiterService;