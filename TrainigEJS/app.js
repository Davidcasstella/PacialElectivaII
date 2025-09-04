require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Load JSON data
const loadDepartments = () => {
  const data = fs.readFileSync(path.join(__dirname, 'departments.json'), 'utf8');
  return JSON.parse(data);
};

const loadTowns = () => {
  const data = fs.readFileSync(path.join(__dirname, 'towns.json'), 'utf8');
  return JSON.parse(data);
};

const loadRecords = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'records.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveRecords = (records) => {
  fs.writeFileSync(path.join(__dirname, 'records.json'), JSON.stringify(records, null, 2));
};

// Routes
app.get('/', (req, res) => {
  try {
    const records = loadRecords();
    const departments = loadDepartments();
    const towns = loadTowns();
    
    console.log('Records loaded:', records.length);
    console.log('Departments loaded:', departments.length);
    console.log('Towns loaded:', towns.length);
    console.log('APP_NAME:', process.env.APP_NAME);
    
    res.render('templates/index', {
      records,
      departments,
      towns,
      appName: process.env.APP_NAME || 'Training EJS App'
    });
  } catch (error) {
    console.error('Error in / route:', error);
    res.status(500).send('Error loading home page: ' + error.message);
  }
});

app.get('/create', (req, res) => {
  try {
    const departments = loadDepartments();
    console.log('Departments loaded:', departments.length);
    console.log('APP_NAME:', process.env.APP_NAME);
    
    res.render('templates/create', {
      departments,
      appName: process.env.APP_NAME || 'Training EJS App'
    });
  } catch (error) {
    console.error('Error in /create route:', error);
    res.status(500).send('Error loading create page: ' + error.message);
  }
});

app.post('/create', (req, res) => {
  const records = loadRecords();
  const newRecord = {
    id: Date.now().toString(),
    name: req.body.name,
    email: req.body.email,
    departmentCode: req.body.departmentCode,
    townCode: req.body.townCode,
    createdAt: new Date().toISOString()
  };
  
  records.push(newRecord);
  saveRecords(records);
  res.redirect('/');
});

app.get('/edit/:id', (req, res) => {
  const records = loadRecords();
  const departments = loadDepartments();
  const towns = loadTowns();
  const record = records.find(r => r.id === req.params.id);
  
  if (!record) {
    return res.redirect('/');
  }
  
  res.render('templates/edit', {
    record,
    departments,
    towns,
    appName: process.env.APP_NAME
  });
});

app.post('/edit/:id', (req, res) => {
  const records = loadRecords();
  const recordIndex = records.findIndex(r => r.id === req.params.id);
  
  if (recordIndex !== -1) {
    records[recordIndex] = {
      ...records[recordIndex],
      name: req.body.name,
      email: req.body.email,
      departmentCode: req.body.departmentCode,
      townCode: req.body.townCode,
      updatedAt: new Date().toISOString()
    };
    saveRecords(records);
  }
  
  res.redirect('/');
});

app.post('/delete/:id', (req, res) => {
  const records = loadRecords();
  const filteredRecords = records.filter(r => r.id !== req.params.id);
  saveRecords(filteredRecords);
  res.redirect('/');
});

app.get('/api/towns/:departmentCode', (req, res) => {
  try {
    const towns = loadTowns();
    const departmentCode = req.params.departmentCode;
    const departmentTowns = towns.filter(town => town.departmentCode === departmentCode);
    
    console.log(`Requested department: ${departmentCode}`);
    console.log(`Total towns in file: ${towns.length}`);
    console.log(`Found ${departmentTowns.length} towns for department ${departmentCode}`);
    
    res.json(departmentTowns);
  } catch (error) {
    console.error('Error loading towns:', error);
    res.status(500).json({ error: 'Error loading towns' });
  }
});

app.get('/search', (req, res) => {
  try {
    const departments = loadDepartments();
    const towns = loadTowns();
    
    res.render('templates/search', {
      departments,
      towns,
      results: null,
      searchId: '',
      appName: process.env.APP_NAME || 'Training EJS App'
    });
  } catch (error) {
    console.error('Error in /search route:', error);
    res.status(500).send('Error loading search page: ' + error.message);
  }
});

app.post('/search', (req, res) => {
  try {
    const records = loadRecords();
    const departments = loadDepartments();
    const towns = loadTowns();
    const searchId = req.body.searchId;
    
    let results = null;
    if (searchId) {
      results = records.filter(record => 
        record.id === searchId || 
        record.name.toLowerCase().includes(searchId.toLowerCase()) ||
        record.email.toLowerCase().includes(searchId.toLowerCase())
      );
    }
    
    res.render('templates/search', {
      departments,
      towns,
      results,
      searchId,
      appName: process.env.APP_NAME || 'Training EJS App'
    });
  } catch (error) {
    console.error('Error in /search POST route:', error);
    res.status(500).send('Error processing search: ' + error.message);
  }
});

app.get('/filter', (req, res) => {
  try {
    const records = loadRecords();
    const departments = loadDepartments();
    const towns = loadTowns();
    const { departmentCode, townCode } = req.query;
    
    let filteredRecords = records;
    
    if (departmentCode) {
      filteredRecords = filteredRecords.filter(record => record.departmentCode === departmentCode);
    }
    
    if (townCode) {
      filteredRecords = filteredRecords.filter(record => record.townCode === townCode);
    }
    
    res.render('templates/filter', {
      records: filteredRecords,
      departments,
      towns,
      selectedDepartment: departmentCode || '',
      selectedTown: townCode || '',
      appName: process.env.APP_NAME || 'Training EJS App'
    });
  } catch (error) {
    console.error('Error in /filter route:', error);
    res.status(500).send('Error loading filter page: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
