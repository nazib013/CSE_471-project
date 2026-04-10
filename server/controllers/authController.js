const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    // 1. ADDED: Extract phone and address from the frontend request
    const { name, email, password, role, phone, address } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 2. ADDED: Pass phone and address to the new User object
    const user = new User({ 
        name, 
        email, 
        password: hashedPassword, 
        role, 
        phone, 
        address 
    });
    
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // 3. ADDED: Include the new fields in the login response
    res.json({ 
        token, 
        user: { 
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            phone: user.phone,
            address: user.address,
            additionalInfo: user.additionalInfo
        } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addInfo = async (req, res) => {
  try {
    const userId = req.params.id;
    const { additionalInfo } = req.body;

    // Find the user and update their additionalInfo array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { additionalInfo: additionalInfo },
      { new: true } // This tells Mongoose to return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', additionalInfo: updatedUser.additionalInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};