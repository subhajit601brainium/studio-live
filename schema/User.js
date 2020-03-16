var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var Schema = mongoose.Schema;
var userSchema = new Schema({
    name: {type: String, default: '', required: true},
    firstName: {type: String, default: ''},
    lastName: {type: String, default: ''},
    email: {type: String, default: '', unique: true, required: true},
    phone: { type: Number, default: ''},
    dateOfBirth: {type: Date},
    password: {type: String, default: ''},
    profileImage: {type: String, default: ''},
    otp: {type: String, default: ''},
    otpVerify: {type: String, enum: ['0', '1'], default: '0'},
    appType: { type: String, enum: ['IOS', 'ANDROID', 'BROWSER']},
    deviceToken: { type: String, default: '' },
}, {
    timestamps: true
});

userSchema.pre('save', function(next) {
    let user = this;
    if (!user.isModified('password'))
        return next();

    bcrypt.hash(user.password, 8, function(err, hash) {
        if (err) {
            return next(err);
        } else {
            if (user.password !== '') {
                user.password = hash;
            }
            next();
        }
    })
})

module.exports = mongoose.model('User', userSchema);