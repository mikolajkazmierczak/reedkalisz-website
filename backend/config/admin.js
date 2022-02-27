module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'e218b5ee1a6c40227433a1235158d56b'),
  },
});
