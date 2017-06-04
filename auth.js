/*****
See Credits & README: https://github.com/justsml/escape-from-callback-mountain
******/
const Promise           = require('bluebird')
const {hashString}      = require('./lib/crypto')
const {logEventAsync}   = require('./lib/log')
const {getModel}        = require('./lib/db')

module.exports = {auth}

/* auth is our main function */
function auth({username, password}) {
  return Promise.resolve({username, password})
  .then(isInputValid)
  .tap(() => logEventAsync({event: 'login', username}))
  .then(({username, password}) => {
    let users = getModel('users')
    // users.findOneAsync = Promise.promisify(users.findOne); // moved to lib/db
    return Promise
    .props({username, password: hashString(password)})
    // .tap(args => console.log('logging in with: ', args))
    .then(users.findOneAsync.bind(users))
    // .then(args => {
    //   return users.findOneAsync(args)
    //     .tap(user => console.warn('\nusers.findOneAsync(args)', args, '\nUSER=', user))
    // })

  })
  .tap(isResultValid)
  // .catch(errorHandler)
}

function isInputValid({username, password}) {
  if (!username || username.length < 1) { return Promise.reject(new Error('Invalid username. Required, 1 char minimum.')) }
  if (!password || password.length < 6) { return Promise.reject(new Error('Invalid password. Required, 6 char minimum.')) }
  return {username, password}
}

function isResultValid(user) {
  return user && user._id ? user : Promise.reject(new Error('No users matched. Login failed'))
}

// function errorHandler(err) {
//   console.error('Failed auth!', err)
//   return Promise.reject(err);
// }
