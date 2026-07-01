import express from 'express';
import { verifyLink, verifyLinks } from 'safe-link-checker';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/verify', async (req, res) => {
  try {
    const { url, options } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const result = await verifyLink(url, options);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/verify/batch', async (req, res) => {
  try {
    const { urls, options } = req.body;
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'Array of URLs is required' });
    }
    const results = await verifyLinks(urls, options);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`safe-link-checker-api running on port ${port}`);
});
