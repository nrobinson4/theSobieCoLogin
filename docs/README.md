# SobieCo test branch

A login/management system. This application includes user authentication, registration management, and admin features.
Built with local DB, needs conversion to mongo for prod function
Built with intention to convert admin, regular user login code found within views/public directories of main repo

## Features

Addresses goals created here: https://github.com/barrycumbie/theSobieCo/issues/13#issue-2970684483
- User Authentication (Login/Register)
- User Profile Management
- Event Registration System
- Admin Panel
  - User Management
  - Registration Management
  - Email Users/Registrants
  
## Default Admin Account

The system comes with a default admin account:

- Username: admin
- Password: admin123

## System Structure

- **app.js**: Main application file
- **data/users.json**: File-based database
- **views/**: EJS templates
    broken down heavily
- **public/**: Static files (CSS, JS)

## File-Based Database

The application uses a JSON file (`data/users.json`) as a testing database. Switching to MongoDB is recommended

## Notes

- This is a demonstration project and not intended for production use without further security enhancements
- The email functionality is simulated and will log emails to the console
- Password reset generates a temporary password that would normally be sent via email
- Need latest bcrypt, connect-flash, ejs, express, express-session versions to work in right conditions
