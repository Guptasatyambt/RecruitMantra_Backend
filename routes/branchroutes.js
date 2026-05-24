const express = require('express');
const { 
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch
} = require('../controller/branchcontroller');
const { validation, isAdmin } = require('../service/auth');
const router = express.Router();

router.post('/', validation, isAdmin, createBranch);
router.get('/', validation, getAllBranches);
router.get('/:id', validation, getBranchById);
router.put('/:id', validation, isAdmin, updateBranch);
router.delete('/:id', validation, isAdmin, deleteBranch);

module.exports = router;