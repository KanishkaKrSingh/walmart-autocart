require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const NLP_SERVICE_PORT = 4001;
const SEARCH_SERVICE_PORT = 4002;

app.post('/api/process-products', async (req, res) => {
  try {
    const { type, content } = req.body;
    let nlpInput;
    if(type =='list') {
     nlpInput = {
      type: 'list',
      content: content.map(product => {
        return {"Product Name": product.name, Quantity: product.quantity, Details: product.details || ''};
      })
    };
  } else if(type == 'image') {
    nlpInput = {
      type: 'image',
      content: content // Assuming content is base64 encoded image
    };
  } else if(type == 'text') {
    nlpInput = {
      type: 'text',
      content: content // Assuming content is a string of text
    };
  } else {
    return res.status(400).send('Invalid input type');
  }
    const nlpResponse = await axios.post(`http://localhost:${NLP_SERVICE_PORT}/api/extract-products`, nlpInput);
    
    const searchResponse = await axios.post(`http://localhost:${SEARCH_SERVICE_PORT}/api/search-products`, nlpResponse.data);
    console.log('Search Response:', searchResponse.data);
    res.status(200).json(searchResponse.data);
  } catch (error) {
    console.error('Error processing products:', error);
    res.status(500).send('Failed to process products');
  }
});

const PORT = process.env.PORT || 4000;
http.createServer({}, app).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
