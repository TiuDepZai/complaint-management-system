
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const categoryRoutes = require('./routes/categoryRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());

app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', categoryRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

app.get('/ping', (req, res) => {
  res.send('pong');
});

//app.use('/api/tasks', require('./routes/taskRoutes'));

async function ensureFirstAdmin() {
  try {
    const adminEmail = process.env.adminEmail || 'admin@abc.com'; 
    const adminPassword = process.env.adminPassword || 'admin123';       

    // If a user with this email already exists, skip
    const existing = await User.findOne({ email: adminEmail.toLowerCase().trim() }).select('_id role email');
    if (existing) {
      console.log(`[admin-seed] Skipped: admin user already exists (${existing.email})`);
      return;
    }

    // Create the *first* admin
    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword, // hashed by User pre-save hook
      role: 'admin',
    });
    console.log(`[admin-seed] Created admin user: ${adminEmail}`);
  } catch (err) {
    console.error('[admin-seed] Error:', err.message);
  }
}

// Export the app object for testing
if (require.main === module) {
    connectDB();
    ensureFirstAdmin();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }


module.exports = app
