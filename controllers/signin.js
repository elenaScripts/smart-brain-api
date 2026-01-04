const handleSignin = (req, res, db, bcrypt) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json('incorrect form submission');
    }

    db.select('email', 'hash').from('login')
      .where('email', '=', email)
      .then(data => {
        console.log('Login query result:', data);
        if (!data || data.length === 0) {
          console.log('No user found with email:', email);
          return res.status(400).json('wrong credentials');
        }
        
        if (!data[0].hash) {
          console.log('Hash is missing for email:', email);
          return res.status(400).json('wrong credentials');
        }
        
        console.log('Comparing password for email:', email);
        // bcrypt.compare is asynchronous, must use callback or promise
        bcrypt.compare(password, data[0].hash, function(err, isValid) {
          console.log('Password comparison result:', isValid, 'Error:', err);
          if (err) {
            return res.status(400).json('wrong credentials');
          }
          
          if (isValid) {
            return db.select('*').from('users')
              .where('email', '=', email)
              .then(user => {
                console.log('User found:', user);
                if (!user || user.length === 0) {
                  console.log('User not found in users table for email:', email);
                  return res.status(400).json('wrong credentials');
                }
                console.log('Sending user data:', user[0]);
                res.json(user[0]);
              })
              .catch(err => {
                console.log('Error fetching user:', err);
                console.log('Error details:', JSON.stringify(err, null, 2));
                res.status(400).json('wrong credentials');
              });
          } else {
            console.log('Password comparison failed');
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