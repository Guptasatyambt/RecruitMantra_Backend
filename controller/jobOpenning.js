const OPENNING=require('../models/jobOpennings');

async function addOpenning(req,res){
    const {title,jd,opennings,releasedate,lastdate,location,mode,KeyResponcibility,experience,package,skills}=req.body;
    if(!title|| !jd||!opennings||!releasedate||!lastdate||!location||!mode||!KeyResponcibility||!experience||!package){
        return res.status(400).json({message:"All fields are compulsory"});
    }
    if (!Array.isArray(skills)) {
        return res.status(400).json({ message: "Skills must be an array." });
    }
    try{
    const job=await OPENNING.create({
        Title:title,
        jd:jd,
        NoOfOpenning:opennings,
        ReleaseDate:releasedate,
        LasTDayofApplication:lastdate,
        Location:location,
        Mode:mode,
        KeyResponcibility:KeyResponcibility,
        Experience:experience,
        Package:package,
        skills:skills
    });
    return res.status(200).json({message:"Openning created succesfully"});
    }catch(err){
        return res.status(500).json({message:"Internal server error",error:err.message});
    }

}
async function removeOpenning(req,res){
    const {id}=req.params;
    try{
        const job=await OPENNING.findByIdAndDelete(id);
        return res.status(200).json({message:"Openning deleted succesfully"});
    }catch(err){
        return res.status(500).json({message:"Internal server error",error:err.message});
    }
}
async function getOpenings(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const jobs = await OPENNING.find({}, 'Title Package Location Experience ReleaseDate KeyResponcibility') // Project selected fields
                                   .sort({ createdAt: -1 })
                                   .skip(skip)
                                   .limit(limit);

        const total = await OPENNING.countDocuments();
        const formattedJobs = jobs.map(job => ({
            id: job._id,
            title: job.Title,
            package: job.Package,
            location: job.Location,
            experience: job.Experience,
            release_date:job.ReleaseDate,
            Responcibility:job.KeyResponcibility

        }));
        return res.status(200).json({ data: formattedJobs, total, page, limit });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}


async function getOneOpenning(req,res){ //for get one
    const {id}=req.params;
    try{
        const job=await OPENNING.findById(id);
        return res.status(200).json({message:"success",data:job});
    }catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

async function locationSearch(req, res) {
    const { location } = req.params;
    try {
        const jobs = await OPENNING.find({ Location: { $regex: new RegExp(location, 'i') } });
        
        if (jobs.length === 0) {
            return res.status(404).json({ message: "No job openings found for this location" });
        }

        return res.status(200).json({ data: jobs });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

async function titleSearch(req,res){ //for get one
    const { title } = req.params;
    try {
        const jobs = await OPENNING.find({ Title: { $regex: new RegExp(title, 'i') } });
        
        if (jobs.length === 0) {
            return res.status(404).json({ message: "No job openings found for this title" });
        }

        return res.status(200).json({ data: jobs });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

module.exports = {
    addOpenning,
    removeOpenning,
    getOpenings,
    getOneOpenning,
    locationSearch,
    titleSearch
};