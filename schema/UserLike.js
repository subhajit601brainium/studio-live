var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var userLikeSchema = new Schema({
    likeCustomerId: { type: String, default: '', required: true },
    postId: { type: String, default: '', required: true },
    addedOn: { type: Date, default: new Date, required: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('UserLike', userLikeSchema);