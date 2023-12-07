const express = require('express');
const cors = require('cors');
const plannerRoute = require('./routes/platform.route');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('dotenv').config();

const port = process.env.PORT || 5000;

app.use('/', plannerRoute);

app.listen(port, ()=>{
  console.log(`le serveur est lance sur le port ${port}`);
})