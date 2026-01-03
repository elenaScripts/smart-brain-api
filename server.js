const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const knex = require('knex'); 

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  ssl: true
});

db.select('*').from('users').then(data => {
  console.log(data);
}).catch(err => {
  console.log('Database connection error:', err);
});

const bcrypt = require('bcrypt');
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => { res.send('success')})
app.post('/signin', (req, res) => {signin.handleSignin(req, res, db, bcrypt)})
app.post('/register', (req, res) => {register.handleRegister(req, res, db, bcrypt)})
app.get('/profile/:id', (req, res) => {profile.handleProfileGet(req, res, db)})
app.put('/image', (req, res) => {image.handleImage(req, res, db)})
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res)})

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});