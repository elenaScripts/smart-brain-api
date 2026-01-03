const handleRegister = (req, res, db, bcrypt) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json('incorrect form submission');
    }
    const hash = bcrypt.hashSync(password, 10);
    db.transaction(trx => {
      return trx.insert({
        hash: hash,
        email: email,
        name: name
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
        .returning('*')
        .insert({
          email: loginEmail[0],
          name: name,
          joined: new Date()
        })
      })
    })
    .then(user => {
      res.json(user[0]);
    })
    .catch(err => {
      console.log('Registration error:', err);
      res.status(400).json(err.message || 'unable to register');
    });
  }

  module.exports = {
    handleRegister: handleRegister
  };