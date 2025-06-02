const BRANCH = require('../models/branch');

async function createBranch(req, res) {
    try {
        const { branchName } = req.body;
        
        if (!branchName) {
            return res.status(400).json({ message: "Branch name is required" });
        }

        const existingBranch = await BRANCH.findOne({ branchName });
        if (existingBranch) {
            return res.status(409).json({ message: "Branch already exists" });
        }

        const branch = await BRANCH.create({ branchName });
        return res.status(201).json({ 
            message: "Branch created successfully", 
            data: branch 
        });
    } catch (e) {
        return res.status(500).json({ 
            message: "Internal Server Error", 
            error: e.message 
        });
    }
}

async function getAllBranches(req, res) {
    try {
        const branches = await BRANCH.find().sort({ branchName: 1 });
        return res.status(200).json({ 
            message: "Success", 
            data: branches 
        });
    } catch (e) {
        return res.status(500).json({ 
            message: "Internal Server Error", 
            error: e.message 
        });
    }
}

async function getBranchById(req, res) {
    try {
        const { id } = req.params;
        const branch = await BRANCH.findById(id);
        
        if (!branch) {
            return res.status(404).json({ message: "Branch not found" });
        }
        
        return res.status(200).json({ 
            message: "Success", 
            data: branch 
        });
    } catch (e) {
        return res.status(500).json({ 
            message: "Internal Server Error", 
            error: e.message 
        });
    }
}

async function updateBranch(req, res) {
    try {
        const { id } = req.params;
        const { branchName } = req.body;
        
        if (!branchName) {
            return res.status(400).json({ message: "Branch name is required" });
        }

        const branch = await BRANCH.findByIdAndUpdate(
            id,
            { branchName },
            { new: true }
        );
        
        if (!branch) {
            return res.status(404).json({ message: "Branch not found" });
        }
        
        return res.status(200).json({ 
            message: "Branch updated successfully", 
            data: branch 
        });
    } catch (e) {
        return res.status(500).json({ 
            message: "Internal Server Error", 
            error: e.message 
        });
    }
}

async function deleteBranch(req, res) {
    try {
        const { id } = req.params;
        const branch = await BRANCH.findByIdAndDelete(id);
        
        if (!branch) {
            return res.status(404).json({ message: "Branch not found" });
        }
        
        return res.status(200).json({ 
            message: "Branch deleted successfully" 
        });
    } catch (e) {
        return res.status(500).json({ 
            message: "Internal Server Error", 
            error: e.message 
        });
    }
}

module.exports = {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch
};