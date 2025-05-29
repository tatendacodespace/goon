// Script to add 100 dummy users with random stats and realistic names
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Session = require('../models/Session');

// MongoDB connection string (update if needed)
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://tatendamidzi:MT1209%40mt@gooner.udoudar.mongodb.net/goon-squad?retryWrites=true&w=majority&appName=gooner';

// Some realistic first and last names for username generation
const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Drew', 'Cameron', 'Skyler',
  'Avery', 'Peyton', 'Quinn', 'Reese', 'Rowan', 'Sawyer', 'Emerson', 'Finley', 'Harper', 'Jesse',
  'Logan', 'Parker', 'Sage', 'Toby', 'Blake', 'Dakota', 'Elliot', 'Hayden', 'Jules', 'Kai'
];
const lastNames = [
  'Smith', 'Johnson', 'Lee', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Clark',
  'Lewis', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'AdAMS',
  'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'EvANS', 'Edwards'
];

function getRandomName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${first}${last}${num}`;
}

function getRandomPassword() {
  return Math.random().toString(36).slice(-8) + 'A1!';
}

function getRandomSessionStats() {
  // Duration between 5 and 120 minutes
  const duration = (Math.random() * 115 + 5).toFixed(2);
  // Date within the last 30 days
  const date = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
  return { duration: parseFloat(duration), date };
}

async function main() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  let created = 0;
  let sessionLogged = 0;
  for (let i = 0; i < 100; i++) {
    let username;
    let user;
    let tries = 0;
    // Try to find or create a unique dummy username
    while (tries < 10) {
      username = getRandomName();
      user = await User.findOne({ username });
      if (!user) break;
      tries++;
    }
    if (!user) {
      // Create new user
      const password = getRandomPassword();
      const hashed = await bcrypt.hash(password, 10);
      user = new User({ username, password: hashed });
      await user.save();
      created++;
      // Give each new user 1-5 sessions with random stats
      const sessionCount = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < sessionCount; j++) {
        const { duration, date } = getRandomSessionStats();
        const session = new Session({ user: user._id, duration, date });
        await session.save();
      }
      console.log(`Created user: ${username} with ${sessionCount} sessions.`);
    } else {
      // User exists: log a new session for today
      const duration = (Math.random() * 115 + 5).toFixed(2);
      const session = new Session({ user: user._id, duration: parseFloat(duration), date: new Date() });
      await session.save();
      sessionLogged++;
      console.log(`Logged new session for existing user: ${username}`);
    }
  }

  console.log(`Done. Created ${created} users. Logged sessions for ${sessionLogged} existing users.`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
