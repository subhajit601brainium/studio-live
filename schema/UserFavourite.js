var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var userFovouriteSchema = new Schema({
    favouriteCustomerId: { type: String, default: '', required: true },
    postId: { type: String, default: '', required: true },
    addedOn: { type: Date, default: new Date, required: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('UserFavourite', userFovouriteSchema);