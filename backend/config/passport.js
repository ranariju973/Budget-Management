const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { supabaseAdmin } = require('./supabase');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists by googleId
        const { data: existingByGoogle } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('google_id', profile.id)
          .single();

        if (existingByGoogle) {
          return done(null, existingByGoogle);
        }

        // Check if user exists with the same email
        const email = profile.emails[0].value.toLowerCase();
        const { data: existingByEmail } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (existingByEmail) {
          // Link google account to existing email account
          const { data: updated, error } = await supabaseAdmin
            .from('users')
            .update({ google_id: profile.id })
            .eq('id', existingByEmail.id)
            .select()
            .single();

          if (error) throw error;
          return done(null, updated);
        }

        // Create new user
        const { data: newUser, error } = await supabaseAdmin
          .from('users')
          .insert({
            name: profile.displayName,
            email,
            google_id: profile.id,
          })
          .select()
          .single();

        if (error) throw error;
        done(null, newUser);
      } catch (err) {
        console.error(err);
        done(err, null);
      }
    }
  )
);

module.exports = passport;
