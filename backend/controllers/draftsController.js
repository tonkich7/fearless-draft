const Draft = require('../models/Draft');
const Champion = require('../models/Champion');

exports.getAllDrafts = async (req, res) => {
  try {
    const drafts = await Draft.find({}).sort({ createdAt: -1 });
    res.status(200).json(drafts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching drafts', error: error.message });
  }
};

exports.createDraft = async (req, res) => {
  try {
    // Create a new draft with empty games based on format
    const { format = 'BO3', blueTeamName, redTeamName, name } = req.body;
    
    const gameCount = format === 'BO5' ? 5 : 3;
    const games = [];
    
    for (let i = 1; i <= gameCount; i++) {
      games.push({
        gameNumber: i,
        blueTeam: { picks: [], bans: [] },
        redTeam: { picks: [], bans: [] }
      });
    }
    
    const newDraft = new Draft({
      name: name || "Untitled Draft",
      format,
      games,
      blueTeamName: blueTeamName || "Blue Team",
      redTeamName: redTeamName || "Red Team",
      usedChampions: { blue: [], red: [] }
    });
    
    const savedDraft = await newDraft.save();
    res.status(201).json(savedDraft);
  } catch (error) {
    res.status(400).json({ message: 'Error creating draft', error: error.message });
  }
};

exports.getDraftById = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    res.status(200).json(draft);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching draft', error: error.message });
  }
};

exports.updateDraft = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    // Here's where we handle updates based on the Fearless Draft rules
    const { gameNumber, pick, ban, winner, completed } = req.body;
    
    if (gameNumber && gameNumber <= draft.games.length) {
      const gameIndex = gameNumber - 1;
      
      // Update pick
      if (pick) {
        const { team, championId, position, playerName } = pick;
        
        // Check if champion was already used by this team in previous games
        if (team && championId) {
          if (draft.usedChampions[team].includes(championId)) {
            return res.status(400).json({ 
              message: 'Champion already used in a previous game according to Fearless Draft rules' 
            });
          }
          
          // Get champion details
          const champion = await Champion.findOne({ id: championId });
          if (!champion) {
            return res.status(404).json({ message: 'Champion not found' });
          }
          
          // Add pick to the appropriate team
          if (team === 'blue' || team === 'red') {
            draft.games[gameIndex][`${team}Team`].picks.push({
              championId,
              championName: champion.name,
              position: position || '',
              playerName: playerName || ''
            });
            
            // Update used champions list only if the game is completed
            if (draft.games[gameIndex].completed) {
              draft.usedChampions[team].push(championId);
            }
          }
        }
      }
      
      // Update ban
      if (ban) {
        const { team, championId } = ban;
        if (team && championId && (team === 'blue' || team === 'red')) {
          draft.games[gameIndex][`${team}Team`].bans.push(championId);
        }
      }
      
      // Update game winner and completion status
      if (winner && (winner === 'blue' || winner === 'red')) {
        draft.games[gameIndex].winner = winner;
      }
      
      if (completed !== undefined) {
        draft.games[gameIndex].completed = completed;
        
        // If completing a game, add all picked champions to the used champions list
        if (completed) {
          const game = draft.games[gameIndex];
          
          // Add blue team picks to used champions
          game.blueTeam.picks.forEach(pick => {
            if (!draft.usedChampions.blue.includes(pick.championId)) {
              draft.usedChampions.blue.push(pick.championId);
            }
          });
          
          // Add red team picks to used champions
          game.redTeam.picks.forEach(pick => {
            if (!draft.usedChampions.red.includes(pick.championId)) {
              draft.usedChampions.red.push(pick.championId);
            }
          });
          
          // Move to next game if available
          if (gameNumber < draft.games.length) {
            draft.currentGame = gameNumber + 1;
          } else {
            // Check if draft is complete (required wins reached)
            const winsNeeded = draft.format === 'BO5' ? 3 : 2;
            let blueWins = 0;
            let redWins = 0;
            
            draft.games.forEach(game => {
              if (game.completed) {
                if (game.winner === 'blue') blueWins++;
                if (game.winner === 'red') redWins++;
              }
            });
            
            if (blueWins >= winsNeeded || redWins >= winsNeeded) {
              draft.completed = true;
            }
          }
        }
      }
    }
    
    // Save updated draft
    const updatedDraft = await draft.save();
    res.status(200).json(updatedDraft);
  } catch (error) {
    res.status(400).json({ message: 'Error updating draft', error: error.message });
  }
};

exports.getAvailableChampions = async (req, res) => {
  try {
    const { draftId, team } = req.params;
    
    if (!draftId || !team || (team !== 'blue' && team !== 'red')) {
      return res.status(400).json({ message: 'Invalid parameters' });
    }
    
    const draft = await Draft.findById(draftId);
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    // Get all champions
    const allChampions = await Champion.find({});
    
    // Filter out used champions for the specified team
    const usedChampionIds = draft.usedChampions[team];
    const availableChampions = allChampions.filter(
      champion => !usedChampionIds.includes(champion.id)
    );
    
    res.status(200).json(availableChampions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available champions', error: error.message });
  }
};

exports.deleteDraft = async (req, res) => {
  try {
    const deletedDraft = await Draft.findByIdAndDelete(req.params.id);
    if (!deletedDraft) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    res.status(200).json({ message: 'Draft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting draft', error: error.message });
  }
};