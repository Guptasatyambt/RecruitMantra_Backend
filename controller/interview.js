const InterView = require('../models/interview');
const User = require('../models/usermodel');
const { getobjecturl, putObject } = require('../middleware/aws');
const { messaging } = require('firebase-admin');


async function handlestart(req, res) {
    try {
        const email = req.user.email;
        const user = await User.findOne({ email })
        const { level } = req.body
        let coin = user.coins;
        let fee = 50
        if (level == 'beginner') {
            fee = 10
        }
        if (level == 'intermidiate') {
            fee = 15
        }
        if (level == 'advance') {
            fee = 25
        }
        if (coin >= fee) {
            coin = coin - fee;
            const interview = await InterView.create({
                email: email,
                level: level,
            })

            const updateduser = await User.findByIdAndUpdate(user._id,
                {
                    $set: {
                        coins: coin,
                    }
                }
                , { new: true })
            return res.status(200).json({ message: "Success", data: { id: interview._id } })

        }
        else {
            return res.status(201).json({ message: "Insufficient Balance" })
        }
    }
    catch (e) {
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

        const { email, interview_id, complete } = req.body;

        // Validate required fields
        if (email == null || interview_id == null || complete == null) {
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

        // Fetch user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let coin = user.coins;
        // Calculate reward if interview is complete
        if (complete == "1" || complete === 1) {
            let reward = 0;
            if (level === 'beginner') {
                reward = 10 + parseInt(result);
            } else if (level === 'intermediate') {
                reward = 15 + parseInt(result) * 2;
            } else if (level === 'advance') {
                reward = 25 + parseInt(result) * 5;
            }
            coin += reward;
        }

        // Update user's interview list
        let user_interview = user.interview;
        user_interview.push({ interview_id: interview_id, result: result });

        // Update the user in the database
        const updateduser = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    coins: coin,
                    interview: user_interview
                }
            },
            { new: true }
        );

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
        res.status(200).json({ message: "success", key: url })

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
