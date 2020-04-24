const router = require('express').Router();
const bcrypt = require('bcryptjs');
const Users = require("../users/users-model.js");

const jwt = require("jsonwebtoken");
const secrets = require('../api/secrets');

router.post('/register', (req, res) => {
  // implement registration
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 12);
  user.password = hash;
  Users.add(user)
    .then(user => res.status(201).json(user))
    .catch(({name, message, stack, code }) => res.status(500).json({name, message, stack, code }))
});

router.post('/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .then(([user]) => {
      if (user && bcrypt.compareSync(password, user.password)) {

        const token = generateToken(user);

        res.status(200).json({ message: "Welcome!", token});
      } else {
        res.status(401).json({ message: "You cannot pass!" });
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ errorMessage: error.message });
    });
});

function generateToken(user) {
  const payload = {
    userId: user.id,
    username: user.username
  };
  const secret = secrets.jwtSecret;
  const options = {
    expiresIn: '1h'
  }
  
  return jwt.sign(payload, secret, options);
}

module.exports = router;
