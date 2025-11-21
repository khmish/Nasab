
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FamilyData, Person } from '../types';
import { api } from '../services/api';
import { MOCK_FAMILY } from '../constants';

interface FamilyContextType {
  familyData: FamilyData;
  isLoading: boolean;
  error: string | null;
  addPerson: (person: Person) => Promise<void>;
  updatePerson: (person: Person) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  refreshFamily: () => Promise<void>;
  getPerson: (id: string) => Person | undefined;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with empty structure or MOCK if you want offline dev mode without backend
  const [familyData, setFamilyData] = useState<FamilyData>({
    id: 'default', 
    familyName: 'My Family', 
    people: {} 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    setIsLoading(true);
    try {
      // In a real scenario, we fetch from API
      // For demonstration purposes, if the API fails (because no backend is running), 
      // we fall back to MOCK_FAMILY so the UI still works for this demo.
      try {
        const data = await api.getFamily();
        setFamilyData(data);
      } catch (apiErr) {
        console.warn("Backend not reachable, using Mock Data", apiErr);
        setFamilyData(MOCK_FAMILY);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load family data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addPerson = async (person: Person) => {
    try {
      // 1. API Call
      // If backend is running: const newPerson = await api.createPerson(person);
      // For demo fallback without backend:
      const newPerson = person; 
      try { await api.createPerson(person); } catch(e) { /* ignore for demo */ }

      // 2. Optimistic Local Update (Maintenance of relationships)
      // Even with an API, we update local state immediately for UI responsiveness
      // before re-fetching or if we trust the client logic.
      
      setFamilyData(prev => {
        const nextPeople = { ...prev.people, [newPerson.id]: newPerson };

        const addId = (ids: string[], idToAdd: string) => ids.includes(idToAdd) ? ids : [...ids, idToAdd];

        // Link Parents
        newPerson.parentIds.forEach(pId => {
          if (nextPeople[pId]) {
            nextPeople[pId] = {
              ...nextPeople[pId],
              childrenIds: addId(nextPeople[pId].childrenIds, newPerson.id)
            };
          }
        });

        // Link Children
        newPerson.childrenIds.forEach(cId => {
          if (nextPeople[cId]) {
            nextPeople[cId] = {
              ...nextPeople[cId],
              parentIds: addId(nextPeople[cId].parentIds, newPerson.id)
            };
          }
        });

        // Link Partners
        newPerson.partnerIds.forEach(ptId => {
          if (nextPeople[ptId]) {
            nextPeople[ptId] = {
              ...nextPeople[ptId],
              partnerIds: addId(nextPeople[ptId].partnerIds, newPerson.id)
            };
          }
        });

        return { ...prev, people: nextPeople };
      });

    } catch (err) {
      console.error("Failed to add person", err);
      setError("Failed to add person. Please try again.");
      throw err;
    }
  };

  const updatePerson = async (updatedPerson: Person) => {
    try {
      // 1. API Call
      try { await api.updatePerson(updatedPerson); } catch(e) { /* ignore for demo */ }

      // 2. Local State Update with complex relationship cleanup
      setFamilyData(prev => {
        const oldPerson = prev.people[updatedPerson.id];
        const nextPeople = { ...prev.people };
        const pid = updatedPerson.id;

        const removeId = (ids: string[], idToRemove: string) => ids.filter(id => id !== idToRemove);
        const addId = (ids: string[], idToAdd: string) => ids.includes(idToAdd) ? ids : [...ids, idToAdd];

        // --- Handle Relationship Changes (Remove from old links, add to new links) ---
        
        // Parents
        if (oldPerson) {
          oldPerson.parentIds.forEach(pId => {
            if (!updatedPerson.parentIds.includes(pId) && nextPeople[pId]) {
              nextPeople[pId] = { ...nextPeople[pId], childrenIds: removeId(nextPeople[pId].childrenIds, pid) };
            }
          });
        }
        updatedPerson.parentIds.forEach(pId => {
          if (nextPeople[pId]) {
            nextPeople[pId] = { ...nextPeople[pId], childrenIds: addId(nextPeople[pId].childrenIds, pid) };
          }
        });

        // Children
        if (oldPerson) {
          oldPerson.childrenIds.forEach(cId => {
            if (!updatedPerson.childrenIds.includes(cId) && nextPeople[cId]) {
              nextPeople[cId] = { ...nextPeople[cId], parentIds: removeId(nextPeople[cId].parentIds, pid) };
            }
          });
        }
        updatedPerson.childrenIds.forEach(cId => {
          if (nextPeople[cId]) {
            nextPeople[cId] = { ...nextPeople[cId], parentIds: addId(nextPeople[cId].parentIds, pid) };
          }
        });

        // Partners
        if (oldPerson) {
          oldPerson.partnerIds.forEach(ptId => {
            if (!updatedPerson.partnerIds.includes(ptId) && nextPeople[ptId]) {
              nextPeople[ptId] = { ...nextPeople[ptId], partnerIds: removeId(nextPeople[ptId].partnerIds, pid) };
            }
          });
        }
        updatedPerson.partnerIds.forEach(ptId => {
          if (nextPeople[ptId]) {
            nextPeople[ptId] = { ...nextPeople[ptId], partnerIds: addId(nextPeople[ptId].partnerIds, pid) };
          }
        });

        nextPeople[pid] = updatedPerson;
        return { ...prev, people: nextPeople };
      });

    } catch (err) {
      console.error("Failed to update person", err);
      setError("Failed to update person.");
      throw err;
    }
  };

  const deletePerson = async (id: string) => {
    try {
      // 1. API Call
      try { await api.deletePerson(id); } catch(e) { /* ignore for demo */ }

      // 2. Local Update
      setFamilyData(prev => {
        const nextPeople = { ...prev.people };
        delete nextPeople[id];

        // Cleanup orphaned references
        Object.keys(nextPeople).forEach(key => {
          const p = nextPeople[key];
          let changed = false;
          
          if (p.parentIds.includes(id)) changed = true;
          if (p.childrenIds.includes(id)) changed = true;
          if (p.partnerIds.includes(id)) changed = true;

          if (changed) {
            nextPeople[key] = {
              ...p,
              parentIds: p.parentIds.filter(x => x !== id),
              childrenIds: p.childrenIds.filter(x => x !== id),
              partnerIds: p.partnerIds.filter(x => x !== id),
            };
          }
        });

        return { ...prev, people: nextPeople };
      });
    } catch (err) {
      console.error("Failed to delete person", err);
      setError("Failed to delete person.");
      throw err;
    }
  };

  const getPerson = (id: string) => familyData.people[id];

  return (
    <FamilyContext.Provider value={{ 
      familyData, 
      addPerson, 
      updatePerson, 
      deletePerson, 
      refreshFamily: fetchFamilyData, 
      getPerson,
      isLoading,
      error
    }}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) throw new Error('useFamily must be used within FamilyProvider');
  return context;
};
