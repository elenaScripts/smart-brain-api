const handleRegister = (req, res, db, bcrypt) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json('incorrect form submission');
    }
    const hash = bcrypt.hashSync(password, 10);
    db.transaction(trx => {
      return trx.insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        console.log('Login email returned:', loginEmail);
        const emailToUse = typeof loginEmail[0] === 'string' ? loginEmail[0] : loginEmail[0].email || email;
        console.log('Email to use for users table:', emailToUse);
        return trx('users')
        .returning('*')
        .insert({
          email: emailToUse,
          name: name,
          joined: new Date()
        })
        .then(user => {
          console.log('User inserted:', user);
          return user;
        });
      })
    })
    .then(user => {
      console.log('Registration successful, returning user:', user);
      if (user && user.length > 0) {
        res.json(user[0]);
      } else {
        res.status(400).json('registration failed');
      }
    })
    .catch(err => {
      console.log('Registration error:', err);
      console.log('Error details:', JSON.stringify(err, null, 2));
      
      // Check for duplicate email error
      if (err.message && err.message.includes('duplicate key value violates unique constraint')) {
        return res.status(400).json('email already exists');
      }
      
      res.status(400).json(err.message || 'unable to register');
    });
  }

  module.exports = {
    handleRegister: handleRegister
  };