var mongoose = require('mongoose');

var userNotificationSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true},
    notificationType: { type: String,required: true , enum: ['REQUEST_RECEIVE']},
    title: { type: String  },
    message: { type: String  },
    isRead: { type: String, enum: ['YES', 'NO']  },
    otherData: { type: String}
}, {
    timestamps: true
});

module.exports = mongoose.model('UserNotification', userNotificationSchema);