const Series = require('../models/series');
const User = require('../models/usermodel');
const { getobjecturl, putObject } = require('../middleware/aws');
const { messaging } = require('firebase-admin');


async function handlestart(req, res) {
    try {
        const email = req.user?.email;
        if (!email) {
            return res.status(400).json({ message: "User email is required" });
        }

        // Fetch user from DB
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create a new series
        const series = new Series({ email });
        await series.save();

        // Ensure SeriesInterview is an array
        let user_interview = Array.isArray(user.seriesInterview) ? user.seriesInterview : [];

        // Add new series entry
        user_interview.push({ series_id: series._id, completeness: 0 });

        // Update user in DB
        await User.findByIdAndUpdate(user._id, { $set: { seriesInterview: user_interview } }, { new: true });

        return res.status(200).json({ message: "Success", data: { id: series._id } });

    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function insertInterview(req, res) {
    try {
        const { series_id, interview_id, type, Result } = req.body;
        const email = req.user?.email;
        const user_id=req.user?._id;
        if (!email) {
            return res.status(400).json({ message: "User email is required" });
        }
        
        // Validate required fields
        if (!series_id || !interview_id || !type || Result === undefined) {
            return res.status(400).json({ message: "All fields are compulsory" });
        }

        // Find the series
        const series = await Series.findById(series_id);
        if (!series) {
            return res.status(404).json({ message: "Series not found" });
        }

        let updateFields = {};
        let totalResult;
        if (type === "Technical1") {
            updateFields = { Technical1: interview_id, Result_Tech1: Result };
        } else if (type === "Technical2") {
            updateFields = { Technical2: interview_id, Result_Tech2: Result };
        } else if (type === "HR") {
            updateFields = { HR: interview_id, Result_HR: Result };
        } else if (type === "Managerial") {
            totalResult =
                (series.Result_Tech1 || 0) +
                (series.Result_Tech2 || 0) +
                (series.Result_HR || 0) +
                Result; // Use the new Managerial result
            updateFields = { Managerial: interview_id, Result_Managerial: Result, Result: totalResult };
        } else {
            return res.status(400).json({ message: "Invalid interview type" });
        }

        // Update the series
        await Series.findByIdAndUpdate(series_id, { $set: updateFields }, { new: true });

        // Update the user's series
        let user_series = req.user.seriesInterview;
        user_series.push({ series_id: series_id, result: totalResult });
        const userUpdateResult = await User.findByIdAndUpdate(
            user_id,
            {
                $set: {
                    seriesInterview: user_series,
                }
            },
            { new: true }
        );

        // If no user was updated, return an error
        
        if (userUpdateResult.matchedCount === 0) {
            return res.status(404).json({ message: "User not found or SeriesInterview entry missing" });
        }

        return res.status(200).json({ message: "Success" });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}

async function getinfo(req, res) {
    try {
        const series_id = req.query.series_id;
        const series = await Series.findById(series_id);

        // Respond with the interview and the video URLs
        res.status(200).json({
            message: "success",
            series: series
        });
    } catch (e) {
        return res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
}


module.exports = {
    handlestart,
    getinfo,
    insertInterview
};
