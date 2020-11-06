var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var SendRequestSchema = new Schema({
    fromCustomerId: { type: String, default: '', required: true },
    toCustomerId: { type: String, default: '', required: true },
    sendOn: { type: Date, default: new Date, required: true },
    isAccepted: { type: String, enum: ['YES', 'NO']},
    acceptedOn: { type: Date, default: new Date, required: true },
    acceptReject: { type: String, enum: ['ACCEPT', 'REJECT']},
}, {
    timestamps: true
});

module.exports = mongoose.model('SendRequest', SendRequestSchema);