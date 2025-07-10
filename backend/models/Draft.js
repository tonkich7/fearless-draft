// models/Draft.js
const mongoose = require('mongoose');

const PickSchema = new mongoose.Schema({
  championId: String,
  championName: String,
  position: String,
  playerName: { type: String, default: '' }
});

const GameSchema = new mongoose.Schema({
  gameNumber: Number,
  blueTeam: {
    picks: [PickSchema],
    bans: [String]
  },
  redTeam: {
    picks: [PickSchema],
    bans: [String]
  },
  winner: { type: String, enum: ['blue', 'red', ''], default: '' },
  completed: { type: Boolean, default: false }
});

const DraftSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "Untitled Draft"
  },
  format: {
    type: String,
    enum: ['BO3', 'BO5'],
    default: 'BO3'
  },
  games: [GameSchema],
  blueTeamName: { type: String, default: 'Blue Team' },
  redTeamName: { type: String, default: 'Red Team' },
  usedChampions: {
    blue: [String], // Store IDs of champions used by blue team
    red: [String]   // Store IDs of champions used by red team
  },
  currentGame: {
    type: Number,
    default: 1
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Draft', DraftSchema);