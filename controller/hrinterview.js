const HrInterView = require('../models/hrInterview');
const ManagerialInterView = require('../models/managarialinterview');
const Defaultuser = require('../models/defaultUser');
const Student = require('../models/student');
const User = require('../models/usermodel');
const { getobjecturl, putObject } = require('../middleware/aws');


async function handlestart(req, res) {
    try {
        const email = req.user.email;
        let user;
        if (req.user.role === 'student') {
            user = await Student.findOne({ studentId: req.user._id });
        }
        else if (req.user.role === 'default') {
            user = await Defaultuser.findOne({ defaultUserId: req.user._id });
        }
        const { type } = req.body
        let coin = user.coins;
        let fee = 15
        var _id;
        if (coin < fee) {
            return res.status(201).json({ message: "Insufficient Balance" })
        }

        else {
            coin = coin - fee;
            if (type == "HR") {
                const hrinterview = await HrInterView.create({
                    email: email,
                })
                _id = hrinterview._id
            }
            else if (type == "Managerial") {
                const Managerialinterview = await ManagerialInterView.create({
                    email: email,
                })
                _id = Managerialinterview._id
            }
            let updateduser;
            if (req.user.role == 'student') {
                updateduser = await Student.findOneAndUpdate({ _id: user._id },
                    {
                        $set: {
                            coins: coin,
                        }
                    }
                    , { new: true })
            }
            else if (req.user.role == 'default') {
                updateduser = await Defaultuser.findOneAndUpdate({ _id: user._id },
                    {
                        $set: {
                            coins: coin,
                        }
                    }
                    , { new: true })
            }
            return res.status(200).json({ message: "Success", data: { id: _id } })
        }
    }
    catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function insertConfidence(req, res) {
    try {
        // have to send interview_id,question_number,email,iscompleated
        const { interview_id, question_number, confidence, type } = req.body;
        if (!interview_id || !question_number || !type) {
            return res.status(400).json("All fields are compulsory");
        }
        if (type == "HR") {
            const hrinterview = await HrInterView.findById(interview_id)
            hrinterview.confidence.push({ questionNumber: question_number, value: confidence });
            const updatedinterview = await HrInterView.findByIdAndUpdate(
                interview_id,
                {
                    $set: {
                        confidence: hrinterview.confidence
                    }
                },
                { new: true }
            );
        }
        if (type == "Managerial") {
            const managerialinterview = await ManagerialInterView.findById(interview_id)
            managerialinterview.confidence.push({ questionNumber: question_number, value: confidence });
            const updatedinterview = await ManagerialInterView.findByIdAndUpdate(
                interview_id,
                {
                    $set: {
                        confidence: managerialinterview.confidence
                    }
                },
                { new: true }
            );
        }


        return res.status(200).json({ message: "Success" });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function handlestop(req, res) {
    try {

        const { interview_id, type } = req.body;
        const email = req.user.email;
        // Validate required fields
        if (interview_id == null || !type) {
            return res.status(400).json("All fields are compulsory");
        }
        var interview;
        if (type == "HR") {
            interview = await HrInterView.findById(interview_id);
        }
        else if (type == "Managerial") {
            interview = await ManagerialInterView.findById(interview_id);
        }

        var confidence_list = interview.confidence
        var confidence = 0;

        for (var item of confidence_list) {
            confidence += parseFloat(item['value']);
        }
        confidence = confidence_list.length ? confidence / confidence_list.length : 0;


        const result = (confidence) / 10;

        let user;
        if (req.user.role == 'student') {
            user = await Student.findOne({ studentId: req.user._id });
        }
        else if (req.user.role == 'default') {
            user = await Defaultuser.findOne({ defaultUserId: req.user._id });
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        let coin = user.coins;
        // Calculate reward if interview is complete 

        const reward = 15 + parseInt(result) * 2;
        coin += reward;
        var updatedinterview
        if (type == "HR") {
            updatedinterview = await HrInterView.findByIdAndUpdate(
                interview_id,
                {
                    $set: {
                        Result: result,
                        overallConfidence: confidence,
                    }
                },
                { new: true }
            );
            const userdata = await User.findById(req.user._id);
            let user_interview = userdata.hrInterview;
            user_interview.push({ interview_id, result });
            // Update the user in the database
            const updateduser = await User.findByIdAndUpdate(
                req.user._id,
                {
                    $set: {
                        hrInterview: user_interview
                    }
                },
                { new: true }
            );

        }
        else if (type == "Managerial") {
            updatedinterview = await ManagerialInterView.findByIdAndUpdate(
                interview_id,
                {
                    $set: {
                        Result: result,
                        overallConfidence: confidence,
                    }
                },
                { new: true }
            );
            const userdata = await User.findById(req.user._id);
            let user_interview = userdata.managerialInterview;
            user_interview.push({ interview_id, result });

            // Update the user in the database
            const updateduser = await User.findByIdAndUpdate(
                user._id,
                {
                    $set: {
                        managerialInterview: user_interview
                    }
                },
                { new: true }
            );
        }

        if (req.user.role == 'student') {
            await Student.findOneAndUpdate(
                { _id: user._id },
                {
                    $set: {
                        coins: coin
                    },
                },
                { new: true }
            );
        }
        else if (req.user.role == 'default') {
            await Defaultuser.findOneAndUpdate(
                { _id: user._id },
                {
                    $set: {
                        coins: coin
                    }
                },
                { new: true }
            );
        }

        // Update user's interview list

    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function videoupload(req, res) {
    try {
        const { interview_id, question_number, type } = req.body;
        // Validate required fields
        if (interview_id == null || question_number == null || type == null) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const key = `VID-${interview_id}-${Date.now()}-Q->${question_number}.mp4`;
        const path = `uploads/user-uploads/${key}`;
        const key_send = `${key}`;
const normalizedType = type?.toLowerCase();
        // Determine the model dynamically
        const Model = normalizedType === "hr" ? HrInterView : normalizedType === "managerial" ? ManagerialInterView : null;
        if (!Model) {
            return res.status(400).json({ message: "Invalid interview type" });
        }

        // Fetch interview data
        const interview = await Model.findById(interview_id);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        // Ensure interview.video is an array
        const interview_videos = Array.isArray(interview.video) ? interview.video : [];

        // Add new video entry
        interview_videos.push({ question: question_number, key: path });

        // Update interview document
        await Model.findByIdAndUpdate(interview_id, { $set: { video: interview_videos } }, { new: true });

        // Upload video and get URL concurrently
        const [url, video_link] = await Promise.all([
            putObject(key_send, "video/mp4"),
            getobjecturl(path),
        ]);

        // Send response
        res.status(200).json({ message: "success", key: url, video_url: video_link });

    } catch (e) {
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
        const { interview_id, question_number, question, videoUrl, type } = req.body;
   
        if (!interview_id || !question_number || !question || !videoUrl || !type) {
            return res.status(400).json({ message: "All fields are compulsory" });
        }
        const normalizedType = type?.toLowerCase();
        const Model = normalizedType === "hr" ? HrInterView : normalizedType === "managerial" ? ManagerialInterView : null;
        if (!Model) {
            return res.status(400).json({ message: "Invalid interview type" });
        }
        const interview = await Model.findById(interview_id);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }


        const [response_audio, response_video, responce_accuracy] = await Promise.all([

            axios.post("https://ml.recruitmantra.com/audio_emotion/process_video", {
                video_url: videoUrl
            }),
            axios.post("https://ml.recruitmantra.com/video_emotion/upload", {
                video_url: videoUrl
            }),
            axios.post("https://ml.recruitmantra.com/hr/process", {
                question: question,
                video_url: videoUrl
            }),
        ]);
        const confidence = 0
        const accuracy = Number(
            (responce_accuracy.data.Accuracy).toFixed(2)
        )
        if (accuracy > 40) {
            confidence = Number(
                ((response_video.data.average_confidence + response_audio.data.confidence_level) / 2).toFixed(2)
            );
        }

        // interview.confidence.push({ questionNumber: question_number, value: confidence });
        // interview.accuracy.push({ questionNumber: question_number, value: response_accuracy.data.Accuracy })
        const updatedinterview = await Model.findByIdAndUpdate(
            interview_id,
            {
                $push: {
                    confidence: { questionNumber: question_number, value: confidence },
                    accuracy: { questionNumber: question_number, value: accuracy },
                }
            },
            { new: true }
        );
        return res.status(200).json({ message: "Success", updatedinterview });
    } catch (e) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: e.message,
        });
    }
}

async function getinfo(req, res) {
    try {
        const { interview_id, type } = req.query;

        // Validate interview_id
        if (!interview_id) {
            return res.status(400).json({ message: "interview_id is required" });
        }

        // Normalize type input (convert to lowercase)
        const normalizedType = type?.toLowerCase();
        const Model = normalizedType === "hr" ? HrInterView
            : normalizedType === "managerial" ? ManagerialInterView
                : null;

        if (!Model) {
            return res.status(400).json({ message: "Invalid interview type" });
        }

        // Fetch interview from database
        const interview = await Model.findById(interview_id);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        // Process videos only if interview.video is an array
        let videos = [];
        if (Array.isArray(interview.video)) {
            videos = await Promise.all(
                interview.video.map(async (item) => {
                    try {
                        const url = await getobjecturl(item.key);
                        return { question: item.question, url };
                    } catch (err) {
                        return { question: item.question, url: null, error: "Failed to retrieve video" };
                    }
                })
            );
        }

        // Respond with the interview data
        res.status(200).json({
            message: "success",
            interview,
            videos
        });

    } catch (e) {
        res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}


module.exports = {
    handlestart,
    handlestop,
    getinfo,
    videoupload,
    ackServer,
    getVideoUrl,
    insertConfidence,
};
