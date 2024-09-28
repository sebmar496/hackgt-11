const express = require('express');
const router = express.Router();
const Crime = require('../models/Crime');

// @route   GET /api/crimes
// @desc    Get all crime incidents (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const crimes = await Crime.find();
    res.json(crimes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/crimes
// @desc    Add a new crime incident
router.post('/', async (req, res) => {
  const { type, location, description, date } = req.body;
  const crime = new Crime({
    type,
    location,
    description,
    date,
  });

  try {
    const newCrime = await crime.save();
    res.status(201).json(newCrime);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;