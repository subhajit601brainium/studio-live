const mongoose = require('mongoose');

var cmsSchema = new mongoose.Schema({
    title: { type: String, default: '', required: true },
    slug: { type: String, default: '', required: true },
    description: { type: String, default: '' }
},
{
    timestamps: true
});

module.exports = mongoose.model('Cms', cmsSchema);