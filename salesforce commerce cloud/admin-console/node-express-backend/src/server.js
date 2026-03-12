const app = require('./app');

const PORT = process.env.ADMIN_API_PORT || 4000;

app.listen(PORT, () => {
  console.log(`Admin backend listening on http://localhost:${PORT}`);
});
