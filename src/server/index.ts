const express = require('express');
const { createClient } = require('redis');
const cors = require('cors');
import { Request, Response } from 'express';

const app = express();
const port = 3001;

// Redis client setup
const client = createClient({
  url: 'redis://localhost:6379'
});

client.on('error', (err: Error) => console.log('Redis Client Error', err));
client.connect();

app.use(cors());
app.use(express.json());

// API endpoints
app.get('/api/data/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const data = await client.get(key);
    res.json({ data: data ? JSON.parse(data) : null });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.post('/api/data/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { data } = req.body;
    await client.set(key, JSON.stringify(data));
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 