const express = require('express');
const qrcode = require('qrcode');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;
const db = new sqlite3.Database('tickets.db');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/form.html');
});

app.post('/submit', (req, res) => {
  const name = req.body.name;
  const seat = req.body.seat;

  if (!name || !seat) {
    return res.status(400).send('Name and seat is required');
  }

  const id = Math.floor(Math.random() * 1000000);
  
  db.run(`INSERT INTO tickets (name, seat, id) VALUES (?,?,?);`, [name, seat, id], (err) => {
    if (err) {
        console.error(err);
        res.sendStatus(500);
    } else {
        qrcode.toDataURL(`Name: ${name}\nSeat: ${seat}\nID: ${id}`, { errorCorrectionLevel: 'M' }, (err, url) => {
            if (err) {
              console.error(err);
              return res.status(500).send('An error occurred while generating the QR code.');
            }
        
            res.send(`
              <h2>QR Code Generated Successfully!</h2>
              <img src="${url}">
              </br>
              <a href="${url}" download="qrcode.png"><button type="button">Download QR Code</button></a>
              <a href="/"><button>Go back</button></a>
            `);
          });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
