/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The flyme authentication strategy authenticates requests by delegating to
 * flyme using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your flyme application's Client ID
 *   - `clientSecret`  your flyme application's Client Secret
 *   - `callbackURL`   URL to which flyme will redirect the user after granting authorization
 *   - `scope`         array of permission scopes to request.  valid scopes include:
 *                     'user', 'public_repo', 'repo', 'gist', or none.
 *                     (see http://developer.flyme.com/v3/oauth/#scopes for more info)
 *
 * Examples:
 *
 *     passport.use(new flymeStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/flyme/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://open-api.flyme.cn/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://open-api.flyme.cn/oauth/token';

  OAuth2Strategy.call(this, options, verify);

  this.name = 'flyme';
  this._userProfileURL = options.userProfileURL || 'https://open-api.flyme.cn/v2/me';
  this._oauth2._useAuthorizationHeaderForGET = true;
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from flyme.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `flyme`
 *   - `id`               the user's flyme ID
 *   - `username`         the user's flyme username
 *   - `avatar`           the user's avatar url
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {

  this._oauth2.getProtectedResource(this._userProfileURL, accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

    try {
      var json = JSON.parse(body);

      if (json.code !== '200'){
        return done(new InternalOAuthError('failed to fetch user profile', err));
      }

      var profile = { provider: 'flyme' };
      profile.id = json.value.openId;
      profile.username = json.value.nickname;
      profile.avatar = json.value.icon;

      profile._raw = body;
      profile._json = json;

      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}


/**
 * Expose `Strategy`.Inherit
 */
module.exports = Strategy;
