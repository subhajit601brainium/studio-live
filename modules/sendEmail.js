var nodeMailer = require('nodemailer');
var nodeMailerSmtpTransport = require('nodemailer-smtp-transport');
var config = require('../config');

module.exports = function(emailType) {
    const emailFrom = config.emailConfig.MAIL_USERNAME;
    const emailPass = config.emailConfig.MAIL_PASS;

    // define mail types
    var mailDict = {
        "userRegistrationMail" :{
            subject : "Welcome to StudioLive",
            //html    : require('./welcomeUser'),
        },
        "forgotPasswordMail" :{
            subject : "Forgot Password",
            //html    : require('./forgotPasswordMail'),
        },
        "sendOTPdMail" :{
            subject : "OTP verification email",
            //html    : require('./otpVerificationMail'),
        },
        "resendOtpMail": {
            subject : "Resend OTP",
        },
        "sendOTPMail": {
            subject : "New email verification",
        }
    };

    // var transporter = nodeMailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: emailFrom,
    //         pass: emailPass
    //     }
    // });

    var transporter = nodeMailer.createTransport(nodeMailerSmtpTransport({
        host: 'smtp.gmail.com',
        port    : 465,
        secure  : true,
        debug   : true,
        auth    : {
            user    : emailFrom,
            // pass    : emailPass,
            pass    : new Buffer(emailPass,'base64').toString('ascii'),
        },    
        maxMessages : 100,
        requireTLS : true,
    }));

    /** email option */

    // var mailOption = {
    //     from: emailFrom,
    //     to: 'soumyanag.brainium@gmail.com',
    //     subject: 'Sending Test Email',
    //     text: `Hello Email Testing`
    // };

    return function(to, data) {
        var self = {
            send: () => {
                var mailOption = {
                    from: emailFrom,
                    to: to,
                    subject: mailDict[emailType].subject,
                    // text: `Hello ${data.name}, please verify your studiolive account. Your verification code is ${data.otp}`
                };

                /** Temporary Email text */
                switch(emailType) {
                    case 'userRegistrationMail': 
                        mailOption.text = `Hello ${data.name}, please verify your studiolive account. Your verification code is ${data.otp}`
                        break;
                    case 'forgotPasswordMail': 
                        mailOption.text = `Hello ${data.name}, use ${data.forgotPasswordOtp} code to reset your password.`
                        break;
                    case 'resendOtpMail':
                        mailOption.text = `Hello ${data.name}, use ${data.otp} code to verify your account.`
                        break;
                    case 'sendOTPMail':
                        mailOption.text = `Hello ${data.name}, use ${data.otp} code to verify your account.`
                        break;
                }
 

                transporter.sendMail(mailOption, function(error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email Sent', info.response);
                    }
                });
            }
        }
        return self;
    }
}

