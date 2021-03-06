const express = require('express');
const httpProxy = require('http-proxy');
const cors = require('cors');

const REAL_BACKEND = 'https://api.dev.steamatic.com.au';

const proxyServer = httpProxy.createProxyServer({
  secure: false,
  changeOrigin: true,
  xfwd: true
});

const proxy = () => (req, res, next) => {
  console.log(`Proxy: "${req.path}"`);
  proxyServer.web(req, res, {target: REAL_BACKEND}, next);
};

const app = express();
app.use(cors());

// Feel free to mock any request here
// app.get('/v1/me', (req, res) => {
//   res.json({
//     data: {
//       id: 1,
//       email: faker.internet.email(),
//       first_name: faker.name.firstName(),
//       last_name: faker.name.lastName(),
//     }
//   });
// });

app.get('/v1/finance/gs-codes', (req, res) => {
  res.json({
    data: [{id: 1, description: 'TEST', is_buy: true, is_sell: false, name: 'L234'}]
  });
});

app.get('/v1/warehouse/inventories/:location_id', (req, res) => {
  res.json({
    data: [{id: 1, address: 'TEST', job_number: '123-MEL', count: 12, status: 'Completed'}]
  });
});

app.get('/v1/warehouse/inventory/:inventory_id', (req, res) => {
  res.json({
    data: {id: 1, address: 'TEST', job_number: '123-MEL', count: 12, status: 'Completed'}
  });
});
app.get('/v1/warehouse/inventory/:inventory_id/items', (req, res) => {
  res.json({
    data: [
      {id: 1, photo: 'TEST', name: 'Microwave', location: 'Biosweep', status: 'New', date: '24 January 2019'},
      {id: 2, photo: 'TEST2', name: 'Microwave', location: 'Biosweep', status: 'New', date: '25 January 2019'}
    ]
  });
});

app.use(proxy());

app.listen(8080, () => console.log(`Mock server is ready at http://localhost:8080`));
