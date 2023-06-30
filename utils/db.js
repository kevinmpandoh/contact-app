const mongoose = require('mongoose');

// Koneksi database
mongoose.connect('mongodb://127.0.0.1:27017/contact-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})


