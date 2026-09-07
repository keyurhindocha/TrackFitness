// Extends app.json so the web build can be deployed either at a domain root
// (Netlify, Vercel, Cloudflare Pages) or under a sub-path (GitHub Pages,
// e.g. https://<user>.github.io/TrackFitness).
//
// Set EXPO_WEB_BASE_URL to the sub-path when hosting on GitHub Pages:
//   EXPO_WEB_BASE_URL=/TrackFitness npx expo export -p web
//
// Leave it unset for root hosting.

const baseUrl = (process.env.EXPO_WEB_BASE_URL || '').replace(/\/+$/, '');

module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl,
  },
});
