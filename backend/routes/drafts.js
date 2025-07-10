const express = require('express');
const router = express.Router();
const draftsController = require('../controllers/draftsController');

// Get all drafts
router.get('/', draftsController.getAllDrafts);

// Create new draft
router.post('/', draftsController.createDraft);

// Get draft by ID
router.get('/:id', draftsController.getDraftById);

// Update draft
router.put('/:id', draftsController.updateDraft);

// Get available champions for a team in a draft
router.get('/:draftId/available-champions/:team', draftsController.getAvailableChampions);

// Delete draft
router.delete('/:id', draftsController.deleteDraft);

module.exports = router;