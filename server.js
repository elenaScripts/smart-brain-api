const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const app = express();

/* ❌ Do not allow local runs */
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing. This app runs only on Render.');
}

/* Database */
const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  }
});

/* Test DB once */
db.raw('select 1')
  .then(() => console.log('✅ Database connected'))
  .catch(err => {
    console.error('❌ DB error', err);
    process.exit(1);
  });

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => res.send('success'));

app.post('/signin', (req, res) =>
  signin.handleSignin(req, res, db, bcrypt)
);

app.post('/register', (req, res) =>
  register.handleRegister(req, res, db, bcrypt)
);

app.get('/profile/:id', (req, res) =>
  profile.handleProfileGet(req, res, db)
);

app.put('/image', (req, res) =>
  image.handleImage(req, res, db)
);

app.post('/imageurl', (req, res) =>
  image.handleApiCall(req, res)
);

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});