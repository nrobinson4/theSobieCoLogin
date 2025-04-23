const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const fs = require('fs');
const bcrypt = require('bcryptjs');
//const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Opens use of sessions
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour
}));
// Flash messages for notifications
app.use(flash());

// Make user data and flash messages available to all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Gets info from database, will be replaced with mongoDB statements
const getDb = () => {
  const data = fs.readFileSync('./data/users.json');
  return JSON.parse(data);
};

// Saves to database, will be replaced with mongoDB statements
const saveDb = (data) => {
  fs.writeFileSync('./data/users.json', JSON.stringify(data, null, 2));
};

// Authentication middleware, checks if user is logged in
const ensureAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  // If not logged in, redirect to login page with error message
  req.flash('error_msg', 'Please log in to view this resource');
  res.redirect('/login');
};

// Admin middleware, checks if user is admin, else redirects to dashboard with error message
const ensureAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.isAdmin) {
    return next();
  }
  req.flash('error_msg', 'Access denied. Admin privileges required');
  res.redirect('/dashboard');
};

// ============Routes============ 
// turn into separate files for better organization
// Home page
app.get('/', (req, res) => {
  res.render('index');
});

// Login page
app.get('/login', (req, res) => {
  // Check if user is already logged in
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login');
});

// Login process from form
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Grab info from database, will be replaced with mongoDB statements
  const db = getDb();
  const user = db.users.find(u => u.username === username);
  
  // Check if user exists
  if (!user) {
    req.flash('error_msg', 'User not found');
    return res.redirect('/login');
  }
  
  // Check if password is correct to hash in db
  const isMatch = bcrypt.compareSync(password, user.password);
  
  // If password is incorrect, redirect to login page with error message
  if (!isMatch) {
    req.flash('error_msg', 'Invalid password');
    return res.redirect('/login');
  }
  
  // Store user in session without password, performs a shallow copy of the user object
  const sessionUser = { ...user };
  delete sessionUser.password;
  req.session.user = sessionUser;
  
  req.flash('success_msg', 'You are now logged in');
  res.redirect('/dashboard');
});

// Register page
app.get('/register', (req, res) => {
  // Check if user is already logged in
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('register');
});

// Register process
app.post('/register', (req, res) => {
  // Grab info from form
  const { username, email, password, password2 } = req.body;
  const errors = [];
  
  // Validation
  if (!username || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }
  
  if (errors.length > 0) {
    return res.render('register', {
      errors,
      username,
      email
    });
  }
  
  const db = getDb();
  // Check if username already exists
  if (db.users.some(u => u.username === username)) {
    errors.push({ msg: 'Username already exists' });
    return res.render('register', {
      errors,
      username,
      email
    });
  }
  // Check if email already exists
  if (db.users.some(u => u.email === email)) {
    errors.push({ msg: 'Email already registered' });
    return res.render('register', {
      errors,
      username,
      email
    });
  }
  
  // Create new user, assigns id based on max id in db
  // Will be replaced with mongoDB statements
  const newUser = {
    id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
    username,
    email,
    password: bcrypt.hashSync(password, 10),
    isAdmin: false,
    registrations: []
  };
  // Add new user to database and save
  db.users.push(newUser);
  saveDb(db);
  
  // Positive feedback, redirect to login page
  req.flash('success_msg', 'You are now registered and can log in');
  res.redirect('/login');
});

// Dashboard page
app.get('/dashboard', ensureAuthenticated, (req, res) => {
  const db = getDb();
  // Get updated user data
  const user = db.users.find(u => u.id === req.session.user.id);
  
  // Get user's registrations
  const userRegistrations = db.registrations.filter(r => r.userId === user.id);
  
  res.render('dashboard', {
    user,
    registrations: userRegistrations
  });
});

// Logout
// Destroy session and redirect to login page
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// User profile
app.get('/profile', ensureAuthenticated, (req, res) => {
  const db = getDb();
  // Get current user data, replace with mongoDB statements
  const user = db.users.find(u => u.id === req.session.user.id);
  res.render('profile', { user });
});

// Update profile
app.post('/profile', ensureAuthenticated, (req, res) => {
  const { email, currentPassword, newPassword, confirmPassword } = req.body;
  const db = getDb();
  // Get current user data, replace with mongoDB statements
  const userIndex = db.users.findIndex(u => u.id === req.session.user.id);
  
  // Check if user exists
  // If not, redirect to profile page with error message
  if (userIndex === -1) {
    req.flash('error_msg', 'User not found');
    return res.redirect('/profile');
  }
  
  const user = db.users[userIndex];
  
  // Update email if provided
  // Check if email is already in use by another user
  if (email && email !== user.email) {
    if (db.users.some(u => u.email === email && u.id !== user.id)) {
      req.flash('error_msg', 'Email already in use');
      return res.redirect('/profile');
    }
    user.email = email;
  }
  
  // Update password if provided
  if (currentPassword && newPassword && confirmPassword) {
    // Check if current password is correct
    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    
    if (!isMatch) {
      req.flash('error_msg', 'Current password is incorrect');
      return res.redirect('/profile');
    }
    
    if (newPassword !== confirmPassword) {
      req.flash('error_msg', 'New passwords do not match');
      return res.redirect('/profile');
    }
    
    if (newPassword.length < 6) {
      req.flash('error_msg', 'Password should be at least 6 characters');
      return res.redirect('/profile');
    }
    // Hash new password and update user object
    // Will be replaced with mongoDB statements
    user.password = bcrypt.hashSync(newPassword, 10);
  }
  
  db.users[userIndex] = user;
  saveDb(db);
  
  // Update session user, shallow copy of user object without password
  const sessionUser = { ...user };
  delete sessionUser.password;
  req.session.user = sessionUser;
  
  req.flash('success_msg', 'Profile updated successfully');
  res.redirect('/profile');
});

// Admin routes
app.get('/admin', ensureAuthenticated, ensureAdmin, (req, res) => {
  const db = getDb();
  res.render('admin', {
    users: db.users.map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    }),
    registrations: db.registrations
  });
});

// ==========Admin==========
// View all users
app.get('/admin/users', ensureAuthenticated, ensureAdmin, (req, res) => {
  const db = getDb();
  // Get all users without passwords for security
  res.render('admin-users', {
    users: db.users.map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    })
  });
});

// Admin - Edit user form
app.get('/admin/users/edit/:id', ensureAuthenticated, ensureAdmin, (req, res) => {
  const db = getDb();
  // Get user by ID, replace with mongoDB statements
  const user = db.users.find(u => u.id === parseInt(req.params.id));
  // Check if user exists
  // If not, redirect to users page with error message
  if (!user) {
    req.flash('error_msg', 'User not found');
    return res.redirect('/admin/users');
  }
  
  res.render('admin-edit-user', {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin
    }
  });
});

// Admin - Update user
app.post('/admin/users/edit/:id', ensureAuthenticated, ensureAdmin, (req, res) => {
  const { email, isAdmin, resetPassword } = req.body;
  const userId = parseInt(req.params.id);
  const db = getDb();
  // Get user by ID, replace with mongoDB statements
  const userIndex = db.users.findIndex(u => u.id === userId);
  
  // Check if user exists
  if (userIndex === -1) {
    req.flash('error_msg', 'User not found');
    return res.redirect('/admin/users');
  }
  
  // Update user
  db.users[userIndex].email = email;
  db.users[userIndex].isAdmin = isAdmin === 'on';
  
  // Reset password if requested
  if (resetPassword === 'on') {
    // Dummy password, needs to be generated or sent to user
    const tempPassword = 'password123'; 
    db.users[userIndex].password = bcrypt.hashSync(tempPassword, 10);
    req.flash('success_msg', `User updated. Temporary password: ${tempPassword}`);
  } else {
    req.flash('success_msg', 'User updated successfully');
  }
  
  saveDb(db);
  res.redirect('/admin/users');
});

// Admin - Delete user
app.post('/admin/users/delete/:id', ensureAuthenticated, ensureAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  const db = getDb();
  
  // Don't allow self deletion of admin or manager account 
  if (userId === req.session.user.id) {
    req.flash('error_msg', 'You cannot delete your own account');
    return res.redirect('/admin/users');
  }
  
  // Remove user
  db.users = db.users.filter(u => u.id !== userId);
  
  // Remove all user's registrations
  db.registrations = db.registrations.filter(r => r.userId !== userId);
  
  saveDb(db);
  req.flash('success_msg', 'User deleted successfully');
  res.redirect('/admin/users');
});

// Admin - View all registrations
app.get('/admin/registrations', ensureAuthenticated, ensureAdmin, (req, res) => {
  const db = getDb();
  
  // Get registrations with usernames
  const registrationsWithUsernames = db.registrations.map(reg => {
    const user = db.users.find(u => u.id === reg.userId);
    return {
      ...reg,
      username: user ? user.username : 'Unknown'
    };
  });
  
  res.render('admin-registrations', {
    registrations: registrationsWithUsernames
  });
});

// Admin - Delete registration
app.post('/admin/registrations/delete/:id', ensureAuthenticated, ensureAdmin, (req, res) => {
  const regId = parseInt(req.params.id);
  const db = getDb();
  
  // Remove registration
  db.registrations = db.registrations.filter(r => r.id !== regId);
  
  saveDb(db);
  req.flash('success_msg', 'Registration deleted successfully');
  res.redirect('/admin/registrations');
});

// Admin - Email users form
app.get('/admin/email', ensureAuthenticated, ensureAdmin, (req, res) => {
  const db = getDb();
  res.render('admin-email', {
    users: db.users
  });
});

// Admin - Send email
app.post('/admin/email', ensureAuthenticated, ensureAdmin, async (req, res) => {
  const { subject, message, recipients } = req.body;
  const db = getDb();
  
  // In a real application, you would configure actual email sending
  // This is just a simulation
  let emailsSent = 0;
  let recipientsList = [];
  
  if (recipients === 'all') {
    recipientsList = db.users.map(u => u.email);
    emailsSent = db.users.length;
  } else if (recipients === 'admins') {
    recipientsList = db.users.filter(u => u.isAdmin).map(u => u.email);
    emailsSent = recipientsList.length;
  } else if (recipients === 'non-admins') {
    recipientsList = db.users.filter(u => !u.isAdmin).map(u => u.email);
    emailsSent = recipientsList.length;
  }
  
  // Log the email details (in a real app, you would send actual emails)
  console.log('Email details:');
  console.log(`Subject: ${subject}`);
  console.log(`Recipients: ${recipientsList.join(', ')}`);
  console.log(`Message: ${message}`);
  
  req.flash('success_msg', `Email sent to ${emailsSent} users`);
  res.redirect('/admin');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
}); 