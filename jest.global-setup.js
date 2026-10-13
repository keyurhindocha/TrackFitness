// A western timezone is where the UTC date-rollover bug lived, and one with DST.
module.exports = async () => {
  process.env.TZ = 'America/New_York';
};
