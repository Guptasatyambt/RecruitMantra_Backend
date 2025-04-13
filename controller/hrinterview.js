const HrInterView = require('../models/hrInterview');
const ManagerialInterView = require('../models/managarialinterview');
const User = require('../models/usermodel');
const { getobjecturl, putObject } = require('../middleware/aws');


async function handlestart(req, res) {
    try {
        const email = req.user.email;
        const user = await User.findOne({ email })
        const { type } = req.body
        let coin = user.coins;
        let fee = 15
        var _id;
        if(coin < fee){
            return res.status(201).json({ message: "Insufficient Balance" })
        }
        else {
            coin = coin - fee;
            if(type=="HR"){
                const hrinterview = await HrInterView.create({
                    email: email,
                })    
                _id=hrinterview._id
            }
            else if(type=="Managerial"){
                const Managerialinterview = await ManagerialInterView.create({
                    email: email,
                })    
                _id=Managerialinterview._id
            }

            const updateduser = await User.findByIdAndUpdate(user._id,
                {
                    $set: {
                        coins: coin,
                    }
                }
                , { new: true })
            return res.status(200).json({ message: "Success", data: { id:_id } })

        }
        
    }
    catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function insertConfidence(req, res) {
    try {
        // have to send interview_id,question_number,email,iscompleated
        const { interview_id, question_number, confidence,type } = req.body;
        if (!interview_id || !question_number||!type) {
            return res.status(400).json("All fields are compulsory");
        }
        if(type=="HR"){
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
        if(type=="Managerial"){
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

        const {interview_id,type} = req.body;
	    const email = req.user.email;
        // Validate required fields
        if ( interview_id == null||!type) {
            return res.status(400).json("All fields are compulsory");
        }
        var interview;
        if(type=="HR"){
             interview = await HrInterView.findById(interview_id);
        }
        else if(type=="Managerial"){
             interview = await ManagerialInterView.findById(interview_id);
        }
        
        var confidence_list = interview.confidence
        var confidence = 0;

        for (var item of confidence_list) {
            confidence += parseFloat(item['value']);
        }
        confidence = confidence_list.length ? confidence / confidence_list.length : 0;

        
        const result = (confidence ) / 10;
        // Fetch user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let coin = user.coins;
        // Calculate reward if interview is complete 
           
        const reward = 15 + parseInt(result) * 2;
        coin += reward;
        var updatedinterview
        if(type=="HR"){
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

            let user_interview = user.HRInterview;
            user_interview.push({ interview_id: interview_id, result: result });

            // Update the user in the database
            const updateduser = await User.findByIdAndUpdate(
                user._id,
                {
                    $set: {
                        coins: coin,
                        HRInterview: user_interview
                    }
                },
                { new: true }
            );
       }
       else if(type=="Managerial"){
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
            let user_interview = user.ManagerialInterview;
            user_interview.push({ interview_id: interview_id, result: result });

            // Update the user in the database
            const updateduser = await User.findByIdAndUpdate(
                user._id,
                {
                    $set: {
                        coins: coin,
                        ManagerialInterview: user_interview
                    }
                },
                { new: true }
            );
       }
       
        // Update user's interview list
        

        return res.status(200).json({ message: "Success", data: { updatedinterview } });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function videoupload(req, res) {
    try {
        const { interview_id, question_number, type } = req.body;

        // Validate required fields
        if (!interview_id || !question_number || !type) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const key = `VID-${interview_id}-${Date.now()}-Q->${question_number}.mp4`;
        const path = `uploads/user-uploads/${interview_id}/${key}`;
        const key_send = `${interview_id}/${key}`;

        // Determine the model dynamically
        const Model = type === "HR" ? HrInterView : type === "Managerial" ? ManagerialInterView : null;
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
        console.error("Error in videoupload:", e);
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
                        console.error(`Failed to fetch URL for key: ${item.key}`, err);
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
        console.error("Error in getinfo:", e);
        res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}


module.exports = {
    handlestart,
    handlestop,
    getinfo,
    videoupload,
    getVideoUrl,
    insertConfidence,
};
