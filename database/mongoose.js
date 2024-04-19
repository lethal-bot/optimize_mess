const mongoose = require("mongoose")
async function connection() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/optimize-mess-api')
    } catch (e) {
        console.log(e);
    }
}

connection();
