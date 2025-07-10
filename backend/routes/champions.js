const express = require('express');
const router = express.Router();
const championsController = require('../controllers/draftsController');

// Get all champions
router.get('/', championsController.getAllChampions);

// Get single champion by ID
router.get('/:id', championsController.getChampionById);

// Update champion data from Riot API (admin/maintenance route)
router.post('/update', championsController.updateChampionsData);

// Get random champion (for fearless draft feature)
router.get('/random', championsController.getRandomChampion);

// Get random champion by role
router.get('/random/:role', championsController.getRandomChampionByRole);

module.exports = router;