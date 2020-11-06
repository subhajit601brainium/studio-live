var async = require('async');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var config = require('../config');
var userSchema = require('../schema/User');
var connectedUserSchema = require('../schema/ConnectUser');
var sendRequestSchema = require('../schema/SendRequest');
var userNotificationSchema = require('../schema/UserNotification');
var mail = require('../modules/sendEmail');

var userModel = {
    /** User Registration */
    save: (data, callBack) => {
        if (data) {
            async.waterfall([
                function (nextCb) {
                    /** check user is already exists or not */
                    userSchema.countDocuments({
                        email: data.email
                    }).exec(function (err, countUser) {
                        if (err) {
                            nextCb(null, { "response_code": 5005, "response_message": err.message, "response_data": {} });
                        } else {
                            if (countUser) {
                                /** check if user verify the otp or not */
                                userSchema.findOne({ email: data.email }, function (err, result) {
                                    if (err) {
                                        nextCb(null, { "response_code": 5005, "response_message": err.message, "response_data": {} });
                                    } else {
                                        let userData = result;
                                        if (userData.otpVerify === '0') {
                                            nextCb(null, { "response_code": 2008, "response_message": "User is already registered. Please verify the account", "response_data": { name: userData.name, email: userData.email, otp: userData.otp, otpVerify: userData.otpVerify } });
                                        } else {
                                            nextCb(null, { "response_code": 2008, "response_message": "Couldn't register as user already exists", "response_data": userData });
                                        }

                                    }
                                });
                            } else {
                                /** Create new User */
                                nextCb(null, { "response_code": 2000, "response_message": "Create new user", "response_data": {} });
                            }

                        }
                    });
                },
                function (arg1, nextCb) {
                    if (arg1.response_code === 2000) {
                        /** Store user in the db */
                        data.otp = Math.random().toString().replace('0.', '').substr(0, 4);
                        data.dateOfBirth = new Date(data.dob);
                        new userSchema(data).save(function (err, result) {
                            if (err) {
                                callBack({
                                    "response_code": 5005,
                                    "response_message": "INTERNAL DB ERROR",
                                    "response_data": err
                                });
                            } else {

                                /** Sending Otp to the email of the user */
                                nextCb(null, { "response_code": 2000, "response_message": "Success", "response_data": result });
                            }
                        })
                    } else {
                        nextCb(null, arg1);
                    }
                },
                function (arg2, nextCb) {
                    if (arg2.response_code === 2000) {
                        /** Code to send Email */
                        mail('userRegistrationMail')(arg2.response_data.email, arg2.response_data).send();
                        callBack({
                            "response_code": 2000,
                            "response_message": "Registration successful. Verification code sent to your registered email address. Please verify your account.",
                            "response_data": {
                                "id": arg2.response_data._id,
                                "email": arg2.response_data.email,
                                "otp": arg2.response_data.otp,
                                "otpVerify": arg2.response_data.otpVerify
                            }
                        });
                    } else {
                        nextCb(null, arg2);
                    }
                }

            ], function (err, result) {
                if (err) {
                    callBack({
                        "response_code": 5005,
                        "response_message": "internal DB Error",
                        "response_data": err
                    });
                } else {
                    callBack(result);
                }
            });

        } else {
            callBack({
                "response_code": 5005,
                "response_message": "Given Data Error",
                "response_data": {}
            });
        }
    },

    /** OTP Verification */
    verifyOtp: (data, callBack) => {
        if (data) {
            async.waterfall([
                function (nextCb) {
                    /** Check for email existance */
                    userSchema.findOne({ email: data.email }, function (err, user) {
                        if (err) {
                            nextCb(null, { "response_code": 5005, "response_message": err.message, "response_data": {} });
                        } else {
                            if (user) {
                                nextCb(null, { "response_code": 2000, "response_message": "Success", "response_data": user });

                            } else {
                                nextCb(null, { "response_code": 5005, "response_message": "Email not exists", "response_data": {} });
                            }
                        }
                    })
                },
                function (arg1, nextCb) {
                    if (arg1.response_code === 2000) {
                        /** check account is already verified or not */
                        if (arg1.response_data.otpVerify === '1') {
                            nextCb(null, { "response_code": 2008, "response_message": "Account is already verified. Please proceed to login.", "response_data": {} });
                        } else if (arg1.response_data.otp !== data.otp) {
                            /** Check for OTP match */
                            nextCb(null, { "response_code": 2008, "response_message": "Otp is incorrect. Please provide correct otp or regenerate it.", "response_data": {} });
                        } else {
                            /** Proceed with generate JWT token */
                            nextCb(null, { "response_code": 2000, "response_message": "OK", "response_data": arg1.response_data });
                        }
                    } else {
                        nextCb(null, arg1);
                    }
                }
            ], function (err, result) {
                if (err) {
                    callBack({
                        "response_code": 5005,
                        "response_message": "internal DB Error",
                        "response_data": err
                    });
                } else {
                    callBack(result);
                }
            });
        } else {
            callBack({
                "response_code": 5005,
                "response_message": "Given Data Error",
                "response_data": {}
            });
        }
    },

    /** Generate Json Web Token */
    generateToken: (userData, type, callBack) => {
        if (userData) {
            async.waterfall([
                function (nextCb) {
                    let payload = { subject: userData._id };
                    let token = jwt.sign(payload, config.secretKey, { expiresIn: '24h' });
                    userSchema.update(
                        {
                            _id: userData._id
                        },
                        {
                            $set: {
                                otp: '',
                                otpVerify: '1'
                            }
                        }, function (err, result) {
                            if (err) {
                                nextCb(null, { "response_code": 5005, "response_message": "internal DB Error", "response_data": err });
                            } else {
                                let responseData = {
                                    userDetails: userData,
                                    authToken: token,
                                    imageUrl: `${config.serverhost}:${config.port}/img/profile-pic/` + userData.profileImage,
                                }
                                let responseMessage = '';
                                if (type === 'verify') {
                                    responseMessage = 'Account verification successfull';
                                } else {
                                    responseMessage = 'Login successfull';
                                }
                                nextCb(null, { "response_code": 2000, "response_message": responseMessage, "response_data": responseData });
                            }
                        });
                }
            ], function (err, result) {
                if (err) {
                    callBack({
                        "response_code": 5005,
                        "response_message": "internal DB Error",
                        "response_data": err
                    });
                } else {
                    callBack(result);
                }
            })
        } else {
            callBack({
                "response_code": 5005,
                "response_message": "Given Data Error",
                "response_data": {}
            });
        }
    },

    /** Resend Otp */
    resendOtp: (data, callBack) => {
        if (data) {
            userSchema.findOne({ email: data.email }, function (err, user) {
                if (err) {
                    callBack({
                        "response_code": 5005,
                        "response_message": "internal DB Error",
                        "response_data": err
                    });
                } else {
                    if (user) {
                        const otp = Math.random().toString().replace('0.', '').substr(0, 4);
                        /** Update otp */
                        userSchema.updateOne({ _id: user._id }, { $set: { otp: otp } }, function (err, result) {
                            if (err) {
                                callBack({
                                    "response_code": 5005,
                                    "response_message": "internal DB Error",
                                    "response_data": err
                                });
                            } else {
                                /** Send Email */
                                try {
                                    const emailData = { name: user.name, otp: otp }
                                    mail('resendOtpMail')(user.email, emailData).send();
                                    callBack({
                                        "response_code": 2000,
                                        "response_message": "Please check your email. We have sent a code to be used to verify your account.",
                                        "response_data": {
                                            "email": user.email,
                                            "otp": otp
                                        }
                                    });
                                } catch (Error) {
                                    console.log('Something went wrong while sending email');
                                }

                            }
                        })
                    } else {
                        callBack({
                            "response_code": 2008,
                            "response_message": "Email not exists",
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
    },

    /** User Login */
    login: (data, callBack) => {
        if (data) {
            userSchema.findOne({ email: data.email }, function (err, result) {
                if (err) {
                    callBack({
                        "response_code": 5005,
                        "response_message": err.message,
                        "response_data": {}
                    });
                } else {
                    if (result) {
                        if (result.otpVerify === '1') {
                            const comparePass = bcrypt.compareSync(data.password, result.password);
                            if (comparePass) {
                                callBack({
                                    "response_code": 2000,
                                    "response_message": 'OK',
                                    "response_data": result
                                });
                            } else {
                                callBack({
                                    "response_code": 2008,
                                    "response_message": 'Invalid email or password',
                                    "response_data": {}
                                });
                            }
                        } else {
                            callBack({
                                "response_code": 2008,
                                "response_message": 'Please verify your account before login',
                                "response_data": { otp: result.otp, otpVerify: result.otpVerify }
                            });
                        }

                    } else {
                        callBack({
                            "response_code": 2008,
                            "response_message": 'Invalid email or password',
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
    },

    /** Forgot Password */
    forgotPassword: (data, callBack) => {
        if (data) {
            userSchema.findOne({ email: data.email }, function (err, user) {
                if (err) {
                    callBack({
                        "response_code": 5005,
                        "response_message": err.message,
                        "response_data": {}
                    });
                } else {
                    if (user) {
                        let forgotPasswordOtp = Math.random().toString().replace('0.', '').substr(0, 4);
                        user = user.toObject();
                        user.forgotPasswordOtp = forgotPasswordOtp;
                        try {
                            mail('forgotPasswordMail')(user.email, user).send();
                            callBack({
                                "response_code": 2000,
                                "response_message": "Please check your email. We have sent a code to be used to reset password.",
                                "response_data": {
                                    "email": user.email,
                                    "forgotPassOtp": user.forgotPasswordOtp
                                }
                            });
                        } catch (Error) {
                            console.log('Something went wrong while sending email');
                        }

                    } else {
                        callBack({
                            "response_code": 2008,
                            "response_message": 'User not exists with this email address',
                            "response_data": {}
                        });
                    }
                }
            });
        } else {
            callBack({
                "response_code": 5005,
                "response_message": "Given Data Error",
                "response_data": {}
            });
        }
    },

    resetPassword: (data, callBack) => {
        if (data) {
            userSchema.findOne({ email: data.email }, {
                _id: 1
            }, function (err, user) {
                if (err) {
                    callBack({
                        "response_code": 5005,
                        "response_message": err.message,
                        "response_data": {}
                    });
                } else {
                    if (user) {
                        bcrypt.hash(data.password, 8, function (err, hash) {
                            if (err) {
                                callBack({
                                    "response_code": 5005,
                                    "response_message": "Something went wrong while storing password ",
                                    "response_data": err
                                });
                            } else {
                                userSchema.update({
                                    _id: user._id
                                },
                                    {
                                        $set: {
                                            password: hash
                                        }
                                    }, function (err, result) {
                                        if (err) {
                                            callBack({
                                                "response_code": 5005,
                                                "response_message": "Internal DB Error",
                                                "response_data": err
                                            });
                                        } else {
                                            callBack({
                                                "response_code": 2000,
                                                "response_message": "Password updated successfully.",
                                                "response_data": {}
                                            });
                                        }
                                    })
                            }
                        })
                    } else {
                        callBack({
                            "response_code": 5005,
                            "response_message": 'User not exists.',
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
    },
    viewProfile: (data, callBack) => {
        if (data) {
            var customerId = data.customerId;
            userSchema.findOne({ _id: data.customerId }, async function (err, customer) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (customer) {

                        //CONNECTED_USER
                        var connectedFromUserArr = [{ fromCustomerId: customerId }, { toCustomerId: customerId }]
                        var connectedFromUserObj = {
                            $or: connectedFromUserArr
                        }
                        var connectedUserCount = await connectedUserSchema.countDocuments(connectedFromUserObj);


                        let response = {
                            name: customer.name,
                            firstName: customer.firstName,
                            lastName: customer.lastName,
                            email: customer.email,
                            phone: Number(customer.phone),
                            connectedUser: connectedUserCount
                        }

                        if (customer.profileImage != '') {
                            response.profileImage = `${config.serverhost}:${config.port}/img/profile-pic/` + customer.profileImage
                        } else {
                            response.profileImage = ''
                        }
                        callBack({
                            success: true,
                            STATUSCODE: 200,
                            message: 'User profile fetched successfully',
                            response_data: response
                        })

                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'User not found',
                            response_data: {}
                        });
                    }
                }
            });

        }
    },
    editProfile: (data, callBack) => {
        if (data) {
            /** Check for customer existence */
            //  console.log(data);
            userSchema.countDocuments({ email: data.email, _id: { $ne: data.customerId } }).exec(function (err, count) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (count) {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'User already exists for this email',
                            response_data: {}
                        });
                    } else {
                        userSchema.countDocuments({ phone: data.phone, _id: { $ne: data.customerId } }).exec(function (err, count) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });

                            } if (count) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 422,
                                    message: 'User already exists for this phone no.',
                                    response_data: {}
                                });
                            } else {

                                let updateData = {
                                    name: `${data.firstName} ${data.lastName}`,
                                    firstName: data.firstName,
                                    lastName: data.lastName,
                                    //email: data.email,
                                    phone: data.phone
                                }

                                updateUser(updateData, { _id: data.customerId });

                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'User updated Successfully',
                                    response_data: {}
                                })

                            }
                        })
                    }
                }
            });
        }
    },
    changePassword: (data, callBack) => {
        if (data) {

            userSchema.findOne({ _id: data.customerId }, function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        const comparePass = bcrypt.compareSync(data.oldPassword, result.password);
                        if (comparePass) {

                            bcrypt.hash(data.newPassword, 8, function (err, hash) {
                                if (err) {
                                    callBack({
                                        success: false,
                                        STATUSCODE: 500,
                                        message: 'Something went wrong while setting the password',
                                        response_data: {}
                                    });
                                } else {
                                    userSchema.update({ _id: data.customerId }, {
                                        $set: {
                                            password: hash
                                        }
                                    }, function (err, res) {
                                        if (err) {
                                            callBack({
                                                success: false,
                                                STATUSCODE: 500,
                                                message: 'Internal DB error',
                                                response_data: {}
                                            });
                                        } else {
                                            callBack({
                                                success: true,
                                                STATUSCODE: 200,
                                                message: 'Password updated successfully',
                                                response_data: {}
                                            });
                                        }
                                    })
                                }
                            })
                        } else {
                            callBack({
                                success: false,
                                STATUSCODE: 422,
                                message: 'Invalid old password',
                                response_data: {}
                            });
                        }
                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'User not found',
                            response_data: {}
                        });
                    }
                }
            });




        }
    },
    profileImageUpload: (data, callBack) => {
        if (data) {

            userSchema.findOne({ _id: data.body.customerId }, function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        if (result.profileImage != '') {
                            var fs = require('fs');
                            var filePath = `public/img/profile-pic/${result.profileImage}`;
                            fs.unlink(filePath, (err) => { });
                        }

                        //Get image extension
                        var ext = getExtension(data.files.image.name);

                        // The name of the input field (i.e. "image") is used to retrieve the uploaded file
                        let sampleFile = data.files.image;

                        var file_name = `customerprofile-${Math.floor(Math.random() * 1000)}-${Math.floor(Date.now() / 1000)}.${ext}`;

                        // Use the mv() method to place the file somewhere on your server
                        sampleFile.mv(`public/img/profile-pic/${file_name}`, function (err) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal error',
                                    response_data: {}
                                });
                            } else {
                                updateUser({ profileImage: file_name }, { _id: data.body.customerId });
                                var customerObj = {};
                                customerObj.profileImage = `${config.serverhost}:${config.port}/img/profile-pic/` + file_name

                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Profile image updated Successfully',
                                    response_data: customerObj
                                })
                            }
                        });
                    }
                }
            });


        }
    },
    changeEmail: (data, callBack) => {
        if (data) {
            // console.log(data);
            // return;
            var newEmail = data.newEmail;

            userSchema.findOne({ _id: data.customerId }, function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        if (result.email != newEmail) {

                            /** Store user in the db */
                            var dataOtp = {};
                            dataOtp.otp = Math.random().toString().replace('0.', '').substr(0, 4);

                            updateUser(dataOtp, { _id: data.customerId });

                            dataOtp.email = newEmail;
                            dataOtp.name = result.name;

                            mail('sendOTPMail')(newEmail, dataOtp).send();

                            var responseData = {
                                id: result._id,
                                email: result.email,
                                otp: dataOtp.otp,
                                newEmail: newEmail
                            }

                            callBack({
                                success: true,
                                STATUSCODE: 200,
                                message: 'Please verify your account to continue.',
                                response_data: responseData
                            });

                        } else {
                            callBack({
                                success: false,
                                STATUSCODE: 422,
                                message: 'New email should be different from current email.',
                                response_data: {}
                            });

                        }
                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'User not found',
                            response_data: {}
                        });
                    }
                }
            });
        }
    },
    verifyEmail: (data, callBack) => {
        if (data) {
            // console.log(data);
            var dataVerify = {};
            dataVerify.email = data.newEmail;

            updateUser(dataVerify, { _id: data.customerId })
                .then(function (res) {
                    console.log(res);
                    if (res) {
                        callBack({
                            success: true,
                            STATUSCODE: 200,
                            message: 'Email updated successfully.',
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
                        response_data: err
                    });
                })
        }
    },
    fetchAllUser: async (data, callBack) => {
        if (data) {
            var customerId = data.body.customerId;

            //CONNECTED_USER
            var connectedFromUserArr = [{ fromCustomerId: customerId }, { toCustomerId: customerId }]
            var connectedFromUserObj = {
                $or: connectedFromUserArr
            }
            var connectedUserObj = await connectedUserSchema.find(connectedFromUserObj);

            var connectedUserArr = [];
            if (connectedUserObj.length > 0) {
                for (let connUser of connectedUserObj) {
                    if (connUser.fromCustomerId == customerId) {
                        connectedUserArr.push(connUser.toCustomerId);
                    } else {
                        connectedUserArr.push(connUser.fromCustomerId);
                    }

                }
            }

            var userCond = { _id: { $ne: customerId } };

            if (connectedUserArr.length > 0) {
                userCond._id = { $nin: connectedUserArr };
            }

            userSchema.find(userCond)
                .then(async (users) => {
                    var userArr = [];
                    if (users.length > 0) {
                        for (let user of users) {

                            var andReqCondObj = {};
                            var reqArr = [];
                            var reqCondOne = { $and: [{ fromCustomerId: (user._id).toString() }, { toCustomerId: customerId }] };
                            var reqCondTwo = { $and: [{ fromCustomerId: customerId }, { toCustomerId: (user._id).toString() }] };

                            reqArr.push(reqCondOne);
                            reqArr.push(reqCondTwo);

                            andReqCondObj['$or'] = reqArr;

                            var sendReqObj = await sendRequestSchema.findOne(andReqCondObj);


                            var userObj = {
                                name: user.name,
                                email: user.email,
                                profileImage: `${config.serverhost}:${config.port}/img/profile-pic/` + user.profileImage,
                                customerId: user._id,
                                sendReq: 'NO'
                            };

                            if (sendReqObj != null) {
                                if (sendReqObj.fromCustomerId == customerId) {
                                    userObj.sendReq = 'REQUEST_SEND'
                                } else {
                                    userObj.sendReq = 'REQUEST_RECEIVE'
                                }
                            }
                            userArr.push(userObj);
                        }

                    }


                    callBack({
                        success: true,
                        STATUSCODE: 200,
                        message: 'All users fetched successfully.',
                        response_data: { users: userArr }
                    })

                })
                .catch((error) => {
                    console.log('error', error);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal error',
                        response_data: {}
                    });
                })
        }
    },
    fetchAllConnectedUser: (data, callBack) => {
        if (data) {
            var customerId = data.body.customerId;

            var connectedFromUserArr = [{ fromCustomerId: customerId }, { toCustomerId: customerId }]

            var connectedFromUserObj = {
                $or: connectedFromUserArr
            }
            connectedUserSchema.find(connectedFromUserObj)
                .then(async (connectedusers) => {
                    var userArr = [];
                    if (connectedusers.length > 0) {
                        for (let connecteduser of connectedusers) {
                            if (connecteduser.fromCustomerId == customerId) {
                                var otherUser = await userSchema.findOne({ _id: connecteduser.toCustomerId });

                                var userObj = {
                                    name: otherUser.name,
                                    email: otherUser.email,
                                    profileImage: `${config.serverhost}:${config.port}/img/profile-pic/` + otherUser.profileImage,
                                    customerId: otherUser._id
                                };
                            } else {
                                var otherUser = await userSchema.findOne({ _id: connecteduser.fromCustomerId });

                                var userObj = {
                                    name: otherUser.name,
                                    email: otherUser.email,
                                    profileImage: `${config.serverhost}:${config.port}/img/profile-pic/` + otherUser.profileImage,
                                    customerId: otherUser._id
                                };
                            }
                            userArr.push(userObj);
                        }
                    }


                    callBack({
                        success: true,
                        STATUSCODE: 200,
                        message: 'All connected user fetched successfully.',
                        response_data: { users: userArr }
                    })

                })
                .catch((error) => {
                    console.log('error', error);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal error',
                        response_data: {}
                    });
                })
        }
    },
    sendRequest: (data, callBack) => {
        if (data) {
            var customerId = data.body.customerId;
            var toCustomerId = data.body.toCustomerId;

            var andReqCondObj = {};
            var reqArr = [];
            var reqCondOne = { $and: [{ fromCustomerId: customerId }, { toCustomerId: toCustomerId }] };
            var reqCondTwo = { $and: [{ fromCustomerId: toCustomerId }, { toCustomerId: customerId }] };

            reqArr.push(reqCondOne);
            reqArr.push(reqCondTwo);

            andReqCondObj['$or'] = reqArr;



            sendRequestSchema
                .findOne(andReqCondObj)
                .then(async (sendReq) => {
                    if (sendReq == null) {
                        var sendReqObj = {
                            fromCustomerId: customerId,
                            toCustomerId: toCustomerId,
                            sendOn: new Date(),
                            isAccepted: 'NO',
                            acceptedOn: new Date(),
                            acceptReject: 'ACCEPT'
                        }

                        new sendRequestSchema(sendReqObj).save(async function (err, result) {
                            if (err) {
                                console.log('err', err);
                                callBack({
                                    success: false,
                                    STATUSCODE: 422,
                                    message: 'Something went wrong.',
                                    response_data: {}
                                });
                            } else {

                                var userObj = await userSchema.findOne({ _id: customerId });
                                var notificationObj = {
                                    customerId: toCustomerId,
                                    notificationType: 'REQUEST_RECEIVE',
                                    title: userObj.name,
                                    message: `${userObj.name} send a request`,
                                    isRead: 'NO',
                                    otherData: customerId
                                }

                                new userNotificationSchema(notificationObj).save(async function (err, not) {
                                    if (err) {
                                        console.log('err', err);
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
                                            message: 'Request send successfully.',
                                            response_data: {}
                                        });
                                    }
                                });
                            }
                        })

                    } else {
                        callBack({
                            success: true,
                            STATUSCODE: 200,
                            message: 'Request send successfully.',
                            response_data: {}
                        });
                    }

                })
                .catch((error) => {
                    console.log('error', error);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal error',
                        response_data: {}
                    });
                })


        }
    },
    acceptRequest: (data, callBack) => {
        if (data) {
            var customerId = data.body.customerId;
            var toCustomerId = data.body.toCustomerId;
            var isAccept = data.body.isAccept;

            var andReqCondObj = {};
            var reqArr = [];
            var reqCondOne = { $and: [{ fromCustomerId: customerId }, { toCustomerId: toCustomerId }] };
            var reqCondTwo = { $and: [{ fromCustomerId: toCustomerId }, { toCustomerId: customerId }] };

            reqArr.push(reqCondOne);
            reqArr.push(reqCondTwo);

            andReqCondObj['$or'] = reqArr;

            sendRequestSchema
                .findOne(andReqCondObj)
                .then(async (sendReq) => {
                    if (sendReq != null) {

                        if (isAccept == 'YES') {
                            sendRequestSchema.updateOne({ _id: sendReq._id }, { $set: { isAccepted: 'YES', acceptedOn: new Date(), acceptReject: 'ACCEPT' } }, function (err, result) {
                                if (err) {
                                    console.log('err', err);
                                    callBack({
                                        success: false,
                                        STATUSCODE: 500,
                                        message: 'Internal error',
                                        response_data: {}
                                    });
                                } else {

                                    var connectedUserObj = {
                                        fromCustomerId: sendReq.fromCustomerId,
                                        toCustomerId: sendReq.toCustomerId,
                                        addedOn: new Date()
                                    }


                                    new connectedUserSchema(connectedUserObj).save(function (err, result) {
                                        if (err) {
                                            console.log('err', err);
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
                                                message: 'Request accepted successfully.',
                                                response_data: {}
                                            });
                                        }
                                    })


                                }
                            });

                        } else {
                            sendRequestSchema.updateOne({ _id: sendReq._id }, { $set: { isAccepted: 'YES', acceptedOn: new Date(), acceptReject: 'REJECT' } }, function (err, result) {
                                if (err) {
                                    callBack({
                                        success: false,
                                        STATUSCODE: 500,
                                        message: 'Internal error',
                                        response_data: {}
                                    });
                                } else {
                                    callBack({
                                        success: true,
                                        STATUSCODE: 200,
                                        message: 'Request rejected successfully.',
                                        response_data: {}
                                    })
                                }
                            });
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
                .catch((error) => {
                    console.log('error', error);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal error',
                        response_data: {}
                    });
                })


        }
    },
    fetchNotification: (data, callBack) => {
        if (data) {
            var customerId = data.body.customerId;

            userNotificationSchema
                .find({customerId: customerId})
                .sort({createdAr: 'desc'})
                .then(async (userNotification) => {
                    callBack({
                        success: true,
                        STATUSCODE: 200,
                        message: 'User notification',
                        response_data: {userNot: userNotification}
                    });

                })
                .catch((error) => {
                    console.log('error', error);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal error',
                        response_data: {}
                    });
                })


        }
    }
};


function updateUser(update, cond) {
    return new Promise(function (resolve, reject) {
        userSchema.updateOne(cond, {
            $set: update
        }, function (err, res) {
            if (err) {
                return reject(err);
            } else {
                return resolve(res);
            }
        });
    });
}

function getExtension(filename) {
    return filename.substring(filename.indexOf('.') + 1);
}

module.exports = userModel;