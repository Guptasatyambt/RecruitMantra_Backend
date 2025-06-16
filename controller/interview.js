const InterView = require('../models/interview');
const User = require('../models/usermodel');
const Defaultuser=require('../models/defaultUser');
const Student=require('../models/student');
const { getobjecturl, putObject } = require('../middleware/aws');
const { messaging } = require('firebase-admin');


async function handlestart(req, res) {
    try {
        const email = req.user.email;
        let user;
        if (req.user.role === 'student') {
            user = await Student.findOne({ studentId: req.user._id });
        } else if (req.user.role === 'default') {
            user = await Defaultuser.findOne({ defaultUserId: req.user._id });
        }

        const { level } = req.body;
        const feeMap = {
            beginner: 10,
            intermidiate: 15,
            advance: 25
        };

        const fee = feeMap[level] || 50;
        let coin = user.coins;

        if (coin < fee) {
            return res.status(201).json({ message: "Insufficient Balance" });
        }

        coin -= fee;

        const interview = await InterView.create({
            email: email,
            level: level,
        });

        let updateduser;
        if (req.user.role === 'student') {
            updateduser = await Student.findOneAndUpdate(
                { _id: user._id },
                { $set: { coins: coin } },
                { new: true }
            );
        } else if (req.user.role === 'default') {
            updateduser = await Defaultuser.findOneAndUpdate(
                { _id: user._id },
                { $set: { coins: coin } },
                { new: true }
            );
        }

        return res.status(200).json({ message: "Success", data: { id: interview._id } });

    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function insertConfidence(req, res) {
    try {
        // have to send interview_id,question_number,email,iscompleated
        const { interview_id, question_number, confidence } = req.body;
        if (!interview_id || !question_number) {
            return res.status(400).json("All fields are compulsory");
        }
        const interview = await InterView.findById(interview_id)
        interview.confidence.push({ questionNumber: question_number, value: confidence });
        const updatedinterview = await InterView.findByIdAndUpdate(
            interview_id,
            {
                $set: {
                    confidence: interview.confidence
                }
            },
            { new: true }
        );

        return res.status(200).json({ message: "Success" });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function insertAccuracy(req, res) {
    try {
        // have to send interview_id,question_number,email,iscompleated
        const { interview_id, question_number, accuracy } = req.body;
        if (!interview_id || !question_number) {
            return res.status(400).json("All fields are compulsory");
        }
        const interview = await InterView.findById(interview_id)
        interview.accuracy.push({ questionNumber: question_number, value: accuracy })
        const updatedinterview = await InterView.findByIdAndUpdate(
            interview_id,
            {
                $set: {
                    accuracy: interview.accuracy,
                }
            },
            { new: true }
        );

        return res.status(200).json({ message: "Success" });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function handlestop(req, res) {
    try {

        const {interview_id} = req.body;
        // Validate required fields
        if ( !interview_id) {
            return res.status(400).json("All fields are compulsory");
        }
        const interview = await InterView.findById(interview_id);
        var confidence_list = interview.confidence
        var accuracy_list = interview.accuracy
        var confidence = 0, accuracy = 0;

        for (var item of confidence_list) {
            confidence += parseFloat(item['value']);
        }
        confidence = confidence_list.length ? confidence / confidence_list.length : 0;

        for (var item of accuracy_list) {
            accuracy += parseFloat(item['value']);
        }

        accuracy = accuracy_list.length ? accuracy / accuracy_list.length : 0;

        const result = (confidence + accuracy) / 20
        const updatedinterview = await InterView.findByIdAndUpdate(
            interview_id,
            {
                $set: {
                    Result: result,
                    overallConfidence: confidence,
                    overallAccuracy: accuracy
                }
            },
            { new: true }
        );

        const level = interview.level;

        let user;
        if(req.user.role=='student'){
            user = await Student.findOne({ studentId: req.user._id });
        }
        else if(req.user.role=='default'){
            user = await Defaultuser.findOne({ defaultUserId: req.user._id });
        }
        let coin = user.coins;
        // Calculate reward if interview is complete 
           let reward = 0;
            if (level === 'beginner') {
                reward = 10 + parseInt(result);
            } else if (level === 'intermediate') {
                reward = 15 + parseInt(result) * 2;
            } else if (level === 'advance') {
                reward = 25 + parseInt(result) * 5;
            }
            coin += reward;

        // Update user's interview list
        const userdata=await User.findById(req.user._id);
        let user_interview = userdata.technicalInterview;
        
        user_interview.push({ interview_id, result });

        // Update the user in the database
        const updateduser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    technicalInterview: user_interview
                }
            },
            { new: true }
        );
        if(req.user.role=='student'){
            await Student.findOneAndUpdate(
            {_id:user._id},
            {
                $set: {
                    coins: coin
                }
            },
            { new: true }
            );
        }
        else if(req.user.role=='default'){
            await Defaultuser.findOneAndUpdate(
            {_id:user._id},
            {
                $set: {
                    coins: coin
                }
            },
            { new: true }
            );
        }
        return res.status(200).json({ message: "Success", data: { updatedinterview } });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function videoupload(req, res) {
    try {
        const { interview_id, question_number } = req.body;
        const key = `VID-${interview_id}-${Date.now()}-Q->${question_number}.mp4`;

        const interview = await InterView.findById(interview_id);

        var interview_videos = interview.video
        const path = `uploads/user-uploads/${interview_id}/${key}`
        const key_send = `${interview_id}/${key}`
        interview_videos.push({ question: question_number, key: path })
        await InterView.findByIdAndUpdate(interview_id,
            {
                $set: {
                    video: interview_videos
                }
            }
            , { new: true })

        const url = await putObject(key_send, "video/mp4")
	const video_link = await getobjecturl(path)
        res.status(200).json({ message: "success", key: url,video_url:video_link })

    }
    catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function getVideoUrl(req, res) {
    try {
        const key = req.query.key;
        const video_url = await getobjecturl(key)
        res.status(200).json({ message: "success", url: video_url })

    }
    catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function ackServer(req, res) {
    try {

        res.status(200).json({ message: "success" })

    }
    catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function getinfo(req, res) {
    try {
        const interview_id = req.query.interview_id;
        const interview = await InterView.findById(interview_id);

        const videos = [];
        for (var item of interview.video) {
            const url = await getobjecturl(item['key']);
            videos.push({ question: item['question'], url: url });
        }

        // Respond with the interview and the video URLs
        res.status(200).json({
            message: "success",
            interview: interview,
            videos: videos // Return individual video URLs with question numbers
        });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}


module.exports = {
    handlestart,
    handlestop,
    getinfo,
    videoupload,
    getVideoUrl,
    ackServer,
    insertConfidence,
    insertAccuracy
};
