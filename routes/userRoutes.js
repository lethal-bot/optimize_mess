const express = require('express');
const router = express.Router();
const User = require('../models/user')
const Mess = require('../models/mess')
const auth = require('../middlewares/auth')
const role = require('../middlewares/role')

router.post('/user', async (req, res) => {
    console.log(req.body);
    try {
        const user = await new User(req.body);
        const token = await user.generateAuthToken();
        await user.save();
        res.status(200).send({ user, token });
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
})

//view user
router.get('/user', auth, async (req, res) => {
    res.status(200).send(req.user);
})

//send request using email or username
router.post('/user/add', auth, role, async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    try {

        let user;
        if (username) user = await User.findOne({ username });
        if (email) user = await User.findOne({ email })
        if (user) {
            for (let i = 0; i < req.mess.members.length; i++) {
                if (req.mess.members[i].member.toString() == user._id) {
                    return res.status(401).send({ message: "already a member" })
                }
            }
            for (let i = 0; i < user.requests.length; i++) {
                if (user.requests[i].messReq.toString() == req.body.messId)
                    return res.status(401).send({ message: "already requested" })
            }
            user.requests = user.requests.concat({ messReq: req.body.messId })
            await user.save()
            res.status(200).send(user);
        } else {
            res.status(404).send("User not found");
        }
    } catch (e) {
        console.error(e);
        res.status(500).send();
    }
});

//to accept the request
router.get('/user/accept/:messId', auth, async (req, res) => {
    try {
        const mess = await Mess.findOne({ _id: req.params.messId });
        if (!mess) return res.status(404).send()
        let flag = false;
        console.log(req.user.requests);
        for (let i = 0; i < req.user.requests.length; i++) {
            if (req.user.requests[i].messReq.toString() == req.params.messId) {
                flag = true;
                break;
            }
        }
        if (!flag) return res.status(400).send({ message: "no requests" });
        req.user.requests = req.user.requests.filter((obj) => obj.messReq.toString() == req.params.messId ? false : true)
        req.user.joinedMess = req.user.joinedMess.concat({ messId: mess._id })
        await req.user.save();
        mess.members = mess.members.concat({ member: req.user._id });
        await mess.save()
        res.status(200).send();
    } catch (error) {
        res.status(500).send();
    }

})

//decline request
router.get('/user/reject/:messId', auth, async (req, res) => {
    req.user.requests = req.user.requests.filter((obj) => obj.messReq.toString() == req.params.messId ? false : true);
    try {
        await req.user.save();
        res.status(200).send()
    } catch (error) {
        res.status(500).send();
    }
})

//to kick a member
router.post('/user/kick/:userId', auth, role, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.userId });
        if (user) {
            req.mess.members = req.mess.members.filter((obj) => obj.member == req.params.userId ? false : true);
            await req.mess.save();
            user.joinedMess = user.joinedMess.filter((obj) => obj.messId == req.mess._id ? false : true);
            await user.save();
            res.status(201).send()
        } else res.status(404).send({ message: "user not found" });
    } catch (error) {
        res.status(500).send();
    }
})






module.exports = router