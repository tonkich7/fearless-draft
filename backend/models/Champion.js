const mongoose = require('mongoose');

const ChampionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true
  },
  title: String,
  image: String,
  roles: [String],
});

module.exports = mongoose.model('Champion', ChampionSchema);