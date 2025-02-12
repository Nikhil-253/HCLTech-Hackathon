const express = require('express');
const bodyParser = require('body-parser');
const mssql = require('mssql');
const dotenv = require('dotenv');
const path = require('path');


dotenv.config();


const app = express();


app.use(bodyParser.urlencoded({ extended: true }));


app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')));


const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, 
    trustServerCertificate: true 
  }
};

app.get('/', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    await mssql.connect(dbConfig);
    const result = await mssql.query(`
      SELECT * FROM Auth WHERE FirstName = '${username}' AND password = '${password}'
    `);
    
    if (result.recordset.length > 0) {
        //res.render('login', { error: 'User exist' });
        //res.redirect('/')
        const user_type = await mssql.query(`
            SELECT Type FROM Auth WHERE FirstName = '${username}'
        `);
        // Access the value of 'type' from the result
        const userTypeValue = user_type.recordset[0]?.Type;
        if (userTypeValue === 'SO') {
            //console.log('Spot owner');
            res.render('login', { error: 'Spot owner' });
        } else {
            res.render('login', { error: 'Normal' });
        }


    } else {
      res.render('login', { error: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('Database connection error:', err);
    res.render('login', { error: 'An error occurred. Please try again later.' });
  } finally {
    
    await mssql.close();
  }
});


app.get('/welcome/:username', (req, res) => {
  const { username } = req.params;
  res.send(`<h1>Welcome, ${username}!</h1>`);
});


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
