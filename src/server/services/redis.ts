const { createClient } = require('redis');

// Redis client setup
const client = createClient({
  url: 'redis://localhost:6379'
});

client.on('error', (err: Error) => console.log('Redis Client Error', err));
client.connect().catch(console.error);
// Helper functions
export const getData = async (key: string) => {
  try {
    const data = await client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (parseError) {
      console.error(`Error parsing data for key ${key}:`, parseError);
      return null;
    }
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return null;
  }
};

export const setData = async (key: string, data: any) => {
  try {
    const jsonData = JSON.stringify(data);
    await client.set(key, jsonData);
  } catch (error) {
    console.error(`Error setting data for key ${key}:`, error);
    throw error;
  }
};