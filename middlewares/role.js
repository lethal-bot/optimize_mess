// const User = require('../models/user')
const Mess = require('../models/mess')

//always have to pass the mess id in body
async function role(req, res, next) {
    try {
        const mess = await Mess.findOne({ _id: req.body.messId })
        if (!mess) throw new Error("mess not found");
        req.mess = mess
        // console.log(mess.admin);
        // console.log(req.user._id);
        if (mess.admin.toString() != req.user._id.toString()) {
            return res.status(401).send({ message: "not allowed" })

        }
        next()
    } catch (error) {
        res.status(401).send({ message: "not allowed" })
    }
}

module.exports = role;