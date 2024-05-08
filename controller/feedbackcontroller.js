const Feedback = require('../models/feedback');
const User = require('../models/usermodel');

async function handlefeedback(req, res) {
    try {
    const email = req.user.email;
    const { userFeedback } = req.body; // Changed the variable name to avoid conflict
     if (!email || !userFeedback) {
        return res.status(400).json({message:"Give Us Feedback"});
    }
   const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({message:"User Not Found"});
        }
        const _id = user._id;
        const feed = await Feedback.create({
            auther: _id, // Assuming _id is the ObjectId of the user
            email: email,
            feedback: userFeedback // Assuming userFeedback is the feedback content
        });

        return res.status(200).json({message:"Success"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal Server Error"});
    }
}

module.exports = { handlefeedback };
