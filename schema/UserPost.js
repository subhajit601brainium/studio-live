var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var userPostSchema = new Schema({
    title: { type: String, default: '', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
    file: { type: String, default: '' },
    fileType: { type: String, enum: ['AUDIO', 'VIDEO'] },
    studioPrivacy: { type: String, enum: ['PUBLIC', 'PRIVATE', 'OPEN MIC'] },
    location: { type: String, default: '' }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserPost', userPostSchema);