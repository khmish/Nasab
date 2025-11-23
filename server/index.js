import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 8000;

app.use(cors());
app.use(bodyParser.json());

// --- Mock Database (In-Memory) ---
// In a real production app, replace this with MongoDB (Mongoose) or PostgreSQL (Prisma/Sequelize)
let FAMILY_DB = {
  id: 'fam_001',
  familyName: 'Al-Hashimi',
  rootId: 'p1',
  people: {
    'p1': { 
      id: 'p1', 
      name: 'Ahmed Al-Hashimi', 
      gender: 'male', 
      birthDate: '1940-01-01',
      deathDate: '2010-05-20',
      isDeceased: true, 
      nationality: 'Saudi',
      location: 'Riyadh',
      latitude: 24.7136,
      longitude: 46.6753,
      jobHistory: 'Retired General',
      partnerIds: ['p2'], 
      parentIds: [], 
      childrenIds: ['p3', 'p4', 'p5'] 
    },
    'p2': { 
      id: 'p2', 
      name: 'Fatima Al-Sayed', 
      gender: 'female', 
      birthDate: '1945-05-15', 
      nationality: 'Saudi',
      location: 'Riyadh',
      partnerIds: ['p1'], 
      parentIds: [], 
      childrenIds: ['p3', 'p4', 'p5'] 
    },
    'p3': { 
      id: 'p3', 
      name: 'Mohammed Ahmed', 
      gender: 'male', 
      birthDate: '1970-03-10', 
      jobHistory: 'Software Engineer at Tech Corp (1995-Present)',
      location: 'Dubai',
      latitude: 25.2048,
      longitude: 55.2708,
      partnerIds: ['p6'], 
      parentIds: ['p1', 'p2'], 
      childrenIds: ['p7', 'p8'] 
    },
    'p4': { id: 'p4', name: 'Layla Ahmed', gender: 'female', birthDate: '1975-07-20', partnerIds: [], parentIds: ['p1', 'p2'], childrenIds: [] },
    'p5': { id: 'p5', name: 'Omar Ahmed', gender: 'male', birthDate: '1980-11-30', partnerIds: [], parentIds: ['p1', 'p2'], childrenIds: [] },
    'p6': { id: 'p6', name: 'Sara Khalil', gender: 'female', birthDate: '1972-02-14', partnerIds: ['p3'], parentIds: [], childrenIds: ['p7', 'p8'] },
    'p7': { id: 'p7', name: 'Yusuf Mohammed', gender: 'male', birthDate: '2000-09-01', partnerIds: [], parentIds: ['p3', 'p6'], childrenIds: [] },
    'p8': { id: 'p8', name: 'Noor Mohammed', gender: 'female', birthDate: '2005-12-12', partnerIds: [], parentIds: ['p3', 'p6'], childrenIds: [] },
  }
};

// --- Helper Logic for Relationships ---

const addId = (ids, idToAdd) => ids.includes(idToAdd) ? ids : [...ids, idToAdd];
const removeId = (ids, idToRemove) => ids.filter(id => id !== idToRemove);

// --- Routes ---

// Get Family Data
app.get('/api/families/:id', (req, res) => {
  res.json(FAMILY_DB);
});

// Create Person
app.post('/api/people', (req, res) => {
  const newPerson = req.body;
  
  if (!newPerson || !newPerson.id) {
    return res.status(400).json({ message: 'Invalid person data' });
  }

  // 1. Add to DB
  FAMILY_DB.people[newPerson.id] = newPerson;

  // 2. Update Relationships (Bi-directional linking)
  const people = FAMILY_DB.people;
  const pid = newPerson.id;

  // Link Parents
  (newPerson.parentIds || []).forEach(pId => {
    if (people[pId]) {
      people[pId].childrenIds = addId(people[pId].childrenIds || [], pid);
    }
  });

  // Link Children
  (newPerson.childrenIds || []).forEach(cId => {
    if (people[cId]) {
      people[cId].parentIds = addId(people[cId].parentIds || [], pid);
    }
  });

  // Link Partners
  (newPerson.partnerIds || []).forEach(ptId => {
    if (people[ptId]) {
      people[ptId].partnerIds = addId(people[ptId].partnerIds || [], pid);
    }
  });

  res.status(201).json(newPerson);
});

// Update Person
app.put('/api/people/:id', (req, res) => {
  const id = req.params.id;
  const updatedPerson = req.body;
  const oldPerson = FAMILY_DB.people[id];

  if (!oldPerson) {
    return res.status(404).json({ message: 'Person not found' });
  }

  const people = FAMILY_DB.people;
  
  // 1. Handle Removes (Remove ID from people who are no longer related)
  
  // Parents
  (oldPerson.parentIds || []).forEach(pId => {
    if (!updatedPerson.parentIds.includes(pId) && people[pId]) {
      people[pId].childrenIds = removeId(people[pId].childrenIds, id);
    }
  });

  // Children
  (oldPerson.childrenIds || []).forEach(cId => {
    if (!updatedPerson.childrenIds.includes(cId) && people[cId]) {
      people[cId].parentIds = removeId(people[cId].parentIds, id);
    }
  });

  // Partners
  (oldPerson.partnerIds || []).forEach(ptId => {
    if (!updatedPerson.partnerIds.includes(ptId) && people[ptId]) {
      people[ptId].partnerIds = removeId(people[ptId].partnerIds, id);
    }
  });

  // 2. Handle Adds (Add ID to newly related people)
  
  // Parents
  (updatedPerson.parentIds || []).forEach(pId => {
    if (people[pId]) {
      people[pId].childrenIds = addId(people[pId].childrenIds || [], id);
    }
  });

  // Children
  (updatedPerson.childrenIds || []).forEach(cId => {
    if (people[cId]) {
      people[cId].parentIds = addId(people[cId].parentIds || [], id);
    }
  });

  // Partners
  (updatedPerson.partnerIds || []).forEach(ptId => {
    if (people[ptId]) {
      people[ptId].partnerIds = addId(people[ptId].partnerIds || [], id);
    }
  });

  // 3. Save Update
  FAMILY_DB.people[id] = updatedPerson;

  res.json(updatedPerson);
});

// Delete Person
app.delete('/api/people/:id', (req, res) => {
  const id = req.params.id;
  if (!FAMILY_DB.people[id]) {
    return res.status(404).json({ message: 'Person not found' });
  }

  const people = FAMILY_DB.people;
  const personToDelete = people[id];

  // 1. Remove references from others
  (personToDelete.parentIds || []).forEach(pId => {
    if (people[pId]) people[pId].childrenIds = removeId(people[pId].childrenIds, id);
  });

  (personToDelete.childrenIds || []).forEach(cId => {
    if (people[cId]) people[cId].parentIds = removeId(people[cId].parentIds, id);
  });

  (personToDelete.partnerIds || []).forEach(ptId => {
    if (people[ptId]) people[ptId].partnerIds = removeId(people[ptId].partnerIds, id);
  });

  // 2. Delete
  delete FAMILY_DB.people[id];

  res.status(204).send();
});

// Batch Import (For AI)
app.post('/api/people/batch', (req, res) => {
  const { people } = req.body;
  if (!Array.isArray(people)) {
    return res.status(400).json({ message: 'Invalid data format' });
  }

  // Naive implementation: Just loop through creation logic
  // In a real DB, use transactions
  people.forEach(newPerson => {
    FAMILY_DB.people[newPerson.id] = newPerson;
  });

  // Re-run relationship sync for everyone (safest for batch import)
  Object.values(FAMILY_DB.people).forEach(person => {
    const pid = person.id;
    const dbPeople = FAMILY_DB.people;
    
    person.parentIds?.forEach(id => {
       if(dbPeople[id]) dbPeople[id].childrenIds = addId(dbPeople[id].childrenIds, pid);
    });
    person.childrenIds?.forEach(id => {
       if(dbPeople[id]) dbPeople[id].parentIds = addId(dbPeople[id].parentIds, pid);
    });
    person.partnerIds?.forEach(id => {
       if(dbPeople[id]) dbPeople[id].partnerIds = addId(dbPeople[id].partnerIds, pid);
    });
  });

  res.status(201).json(people);
});

app.listen(PORT, () => {
  console.log(`Nasab Backend running on http://localhost:${PORT}`);
});