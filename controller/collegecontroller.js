const COLLEGE = require('../models/college');

const createCollege = async (req, res) => {
    try {
        const { name, location, contact_email, contact_phone, website, established_year } = req.body;
        
        const college = new COLLEGE({
            name,
            location,
            contact_email,
            contact_phone,
            website,
            established_year
        });

        await college.save();
        res.status(201).json(college);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getColleges = async (req, res) => {
    try {
        const colleges = await COLLEGE.find();
        res.status(200).json(colleges);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getCollegeById = async (req, res) => {
    try {
        const college = await COLLEGE.findById(req.params.id);
        if (!college) {
            return res.status(404).json({ error: 'College not found' });
        }
        res.status(200).json(college);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateCollege = async (req, res) => {
    try {
        const college = await COLLEGE.findByIdAndUpdate(req.params.id, req.body, { 
            new: true,
            runValidators: true
        });
        if (!college) {
            return res.status(404).json({ error: 'College not found' });
        }
        res.status(200).json(college);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteCollege = async (req, res) => {
    try {
        const college = await COLLEGE.findByIdAndDelete(req.params.id);
        if (!college) {
            return res.status(404).json({ error: 'College not found' });
        }
        res.status(200).json({ message: 'College deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createCollege,
    getColleges,
    getCollegeById,
    updateCollege,
    deleteCollege
};