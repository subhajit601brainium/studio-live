var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ConnectUserSchema = new Schema({
    fromCustomerId: { type: String, default: '', required: true },
    toCustomerId: { type: String, default: '', required: true },
    addedOn: { type: Date, default: new Date, required: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('ConnectUser', ConnectUserSchema);