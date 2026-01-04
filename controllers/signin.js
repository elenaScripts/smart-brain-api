const handleSignin = (req, res, db, bcrypt) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json('incorrect form submission');
    }

    db.select('email', 'hash').from('login')
      .where('email', '=', email)
      .then(data => {
        if (!data || data.length === 0) {
          return res.status(400).json('wrong credentials');
        }
        
        // bcrypt.compare is asynchronous, must use callback or promise
        bcrypt.compare(password, data[0].hash, function(err, isValid) {
          if (err) {
            return res.status(400).json('wrong credentials');
          }
          
          if (isValid) {
            return db.select('*').from('users')
              .where('email', '=', email)
              .then(user => {
                if (!user || user.length === 0) {
                  return res.status(400).json('wrong credentials');
                }
                res.json(user[0]);
              })
              .catch(err => {
                console.log('Error fetching user:', err);
                res.status(400).json('wrong credentials');
              });
          } else {
            res.status(400).json('wrong credentials');
          }
        });
      })
      .catch(err => {
        console.log('Error in signin:', err);
        res.status(400).json('wrong credentials');
      });
  }

  module.exports = {
    handleSignin: handleSignin
  };