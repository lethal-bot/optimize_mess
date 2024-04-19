const express = require('express')
const app = express();
require('./database/mongoose.js')
const userRouter = require('./routes/userRoutes.js')
const messRouter = require('./routes/messRoutes.js')
app.use(express.json());
app.use(userRouter);
app.use(messRouter);

app.listen(3000, () => console.log('running on port 3000'))