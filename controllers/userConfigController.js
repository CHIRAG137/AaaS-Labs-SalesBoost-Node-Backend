const UserConfig = require('../models/UserConfig');

exports.setupUserConfig = async (req, res) => {
  try {
    const config = new UserConfig(req.body);
    await config.save();
    res.status(201).json({ message: 'User config saved successfully.' });
  } catch (error) {
    console.error('Error saving user config:', error);
    res.status(500).json({ error: 'Failed to save user config.' });
  }
};