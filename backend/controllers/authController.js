const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isFallback } = require('../config/db');

// Global mock users database for fallback mode
global.mockUsers = global.mockUsers || [
  // Pre-populate an admin and a student user for easy demonstration out-of-the-box
  {
    _id: '60c72b2f9b1d8b2a5c8e3e4a',
    name: 'Admin Demo',
    email: 'admin@demo.com',
    password: '$2a$10$O0Wd/u306wXyI5s78mC4Q.y5aH1VskO1T817t008F4W91Q9tM3tQ.', // 'admin123'
    role: 'admin',
    skills: ['Management', 'Strategy'],
    createdAt: new Date()
  },
  {
    _id: '60c72b2f9b1d8b2a5c8e3e4b',
    name: 'Student Demo',
    email: 'student@demo.com',
    password: '$2a$10$O0Wd/u306wXyI5s78mC4Q.y5aH1VskO1T817t008F4W91Q9tM3tQ.', // 'admin123'
    role: 'student',
    skills: ['Python', 'SQL'],
    createdAt: new Date()
  }
];

const getJWTSecret = () => process.env.JWT_SECRET || 'secret_token_12345';

// Register User
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userRole = role === 'admin' ? 'admin' : 'student';

    if (isFallback()) {
      // Fallback Mode
      const userExists = global.mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: new Date().getTime().toString(), // Generate a unique mock ID
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: userRole,
        skills: [],
        createdAt: new Date()
      };

      global.mockUsers.push(newUser);

      const payload = {
        user: {
          id: newUser._id,
          role: newUser.role
        }
      };

      jwt.sign(
        payload,
        getJWTSecret(),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } });
        }
      );
    } else {
      // MongoDB Mode
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      user = new User({
        name,
        email: email.toLowerCase(),
        password,
        role: userRole
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        getJWTSecret(),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        }
      );
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (isFallback()) {
      // Fallback Mode
      const user = global.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const payload = {
        user: {
          id: user._id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        getJWTSecret(),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
        }
      );
    } else {
      // MongoDB Mode
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        getJWTSecret(),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        }
      );
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    if (isFallback()) {
      // Fallback Mode
      const user = global.mockUsers.find(u => u._id === req.user.id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      // MongoDB Mode
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      res.json(user);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update Profile Skills
exports.updateSkills = async (req, res) => {
  const { skills } = req.body;
  
  try {
    if (isFallback()) {
      const userIdx = global.mockUsers.findIndex(u => u._id === req.user.id);
      if (userIdx === -1) {
        return res.status(404).json({ msg: 'User not found' });
      }
      global.mockUsers[userIdx].skills = skills;
      const { password, ...userWithoutPassword } = global.mockUsers[userIdx];
      res.json(userWithoutPassword);
    } else {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      user.skills = skills;
      await user.save();
      res.json(user);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
