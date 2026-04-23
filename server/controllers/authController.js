const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
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

// 2. LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
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

// 3. ADD DYNAMIC INFO (+ Add button)
exports.addInfo = async (req, res) => {
  try {
    const userId = req.params.id;
    const { additionalInfo } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { additionalInfo: additionalInfo },
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile info added successfully', additionalInfo: updatedUser.additionalInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while adding info' });
  }
};

// 4. UPDATE BASIC PROFILE (Edit button)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, phone, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone, address },
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};