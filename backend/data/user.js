const bcrypt = require('bcryptjs');

// Hash the password directly in this file before exporting.
// We generate a "salt" (a random string) and then combine it with the password
// to create a secure hash. 10 rounds of salting is a strong standard.
const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync('admin123456789', salt);

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        // Use the hashed password here
        password: hashedPassword,
        role: 'admin',
    },
    {
        name: 'Normal User',
        email: 'user@example.com',
        // Password for login is: password123
        password: bcrypt.hashSync('password123', salt),
        // The 'role' defaults to 'user' in the schema, but being explicit here is good practice.
        role: 'user',
    }
];

module.exports = users;