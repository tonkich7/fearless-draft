const Champion = require('../models/Champion');
const axios = require('axios');

// Utility to fetch champion data from Riot API
const fetchRiotChampionData = async () => {
  try {
    const response = await axios.get('http://ddragon.leagueoflegends.com/cdn/13.23.1/data/en_US/champion.json');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching champion data from Riot:', error);
    throw error;
  }
};

exports.getAllChampions = async (req, res) => {
  try {
    const champions = await Champion.find({});
    res.status(200).json(champions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching champions', error: error.message });
  }
};

exports.getChampionById = async (req, res) => {
  try {
    const champion = await Champion.findOne({ id: req.params.id });
    if (!champion) {
      return res.status(404).json({ message: 'Champion not found' });
    }
    res.status(200).json(champion);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching champion', error: error.message });
  }
};

exports.updateChampionsData = async (req, res) => {
  try {
    const riotData = await fetchRiotChampionData();
    
    for (const [key, champData] of Object.entries(riotData)) {
      await Champion.findOneAndUpdate(
        { id: champData.id },
        {
          id: champData.id,
          name: champData.name,
          key: champData.key,
          title: champData.title,
          image: `http://ddragon.leagueoflegends.com/cdn/13.23.1/img/champion/${champData.image.full}`,
          roles: champData.tags,
        },
        { upsert: true }
      );
    }
    
    res.status(200).json({ message: 'Champion data updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating champion data', error: error.message });
  }
};
