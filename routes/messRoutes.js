const express = require('express');
const router = express.Router();
const Mess = require('../models/mess')
const User = require('../models/user')
const auth = require('../middlewares/auth')
const role = require('../middlewares/role')


//create mess
router.post('/mess', auth, async (req, res) => {
    const mess = new Mess({ ...req.body });
    req.user.joinedMess = req.user.joinedMess.concat({ messId: mess._id })
    mess.admin = req.user._id;
    mess.members = mess.members.concat({ member: req.user })
    try {
        await req.user.save();
        await mess.save();
        res.status(200).send(mess)
    } catch (error) {
        res.status(500).send();
    }
})

//view mess
router.get('/mess/:_id', async (req, res) => {
    try {
        const mess = await Mess.findOne({ _id: req.params._id })
        if (!mess) res.status(404).send(mess);
        res.status(200).send(mess);
    } catch (error) {
        res.status(500).send();
    }
})


//kick user by the admin
//body{messId:messId,member:userId,authtoken}
router.delete('/mess/kick', auth, role, async (req, res) => {
    try {
        if (req.body.member == req.user._id) return res.status(401).send({ message: "admin can't be kicked" })
        const member = await User.findOne({ _id: req.body.member })
        if (!member) return res.status(404).send({ message: "user not found" })
        member.joinedMess = member.joinedMess.filter((obj) => obj.messId == req.body.messId ? false : true);
        await member.save();
        req.mess.members = req.mess.members.filter((obj) => obj.member == req.body.member)
        await req.mess.save()
        res.status(200).send();
    } catch (error) {
        res.status(500).send();
    }
})

//leave the group
//body messId
router.post('/mess/leave', auth, async (req, res) => {
    try {
        const mess = await Mess.findOne({ _id: req.body.messId });
        if (!mess) return res.status(404).send({ message: "mess not found" });
        req.user.joinedMess = req.user.joinedMess.filter((obj) => obj.messId.toString() != mess._id.toString());
        mess.members = mess.members.filter((obj) => obj.member.toString() != req.user._id.toString())
        let flag = false;
        if (mess.admin.toString() == req.user._id.toString()) {
            if (mess.members.length >= 1) {
                mess.admin = mess.members[0].member
            } else {
                await Mess.deleteOne({ _id: mess._id });
                flag = true
            }
        }
        await req.user.save()
        if (!flag) await mess.save()
        res.status(200).send(mess)
    } catch (error) {
        res.status(500).send(error);
    }
})

//delete mess
router.post('/mess/delete', auth, role, async (req, res) => {
    try {
        req.mess.members = req.mess.members.map(async (obj) => {
            const user = await User.findOne({ _id: obj.member })
            user.joinedMess = user.joinedMess.filter((obj) => obj.messId.toString() != req.mess._id.toString())
            if (req.mess.admin == user._id) user.adminMess = null;
            await user.save();
        })
        console.log(req.mess.members)
        await Mess.deleteOne({ _id: req.mess._id })
        res.status(200).send({ message: "mess deleted" });
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router;