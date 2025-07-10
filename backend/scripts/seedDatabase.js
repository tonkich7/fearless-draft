require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Champion = require('../models/Champion');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lol-fearless-draft', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const fetchAndSeedChampions = async () => {
  try {
    console.log('Fetching champion data from Riot API...');
    const response = await axios.get('http://ddragon.leagueoflegends.com/cdn/13.23.1/data/en_US/champion.json');
    const championData = response.data.data;
    
    // Clear existing data
    await Champion.deleteMany({});
    
    const champions = [];
    
    for (const [key, champData] of Object.entries(championData)) {
      champions.push({
        id: champData.id,
        name: champData.name,
        key: champData.key,
        title: champData.title,
        image: `http://ddragon.leagueoflegends.com/cdn/13.23.1/img/champion/${champData.image.full}`,
        roles: champData.tags
      });
    }
    
    await Champion.insertMany(champions);
    console.log(`Successfully seeded ${champions.length} champions!`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding champion data:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

fetchAndSeedChampions();