var config = {
    port: 3047,
    serverhost: 'http://localhost',
    environment: 'development', //development,staging,live
    secretKey: 'hyrgqwjdfbw4534efqrwer2q38945765',
    production: {
        username: 'brain1uMMong0User',
        password: 'PL5qnU9nuvX0pBa',
        host: '68.183.173.21',
        port: '27017',
        dbName: 'StudioLive',
        authDb: 'admin'
    },
    emailConfig: {
        MAIL_USERNAME: "liveapp.brainium@gmail.com",
        MAIL_PASS: "YW5kcm9pZDIwMTY"
    }
}

module.exports = config;