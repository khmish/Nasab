import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FamilyData, Person } from '../types';
import { MOCK_FAMILY } from '../constants';

interface FamilyContextType {
  familyData: FamilyData;
  addPerson: (person: Person) => void;
  updatePerson: (person: Person) => void;
  deletePerson: (id: string) => void;
  setRawData: (data: FamilyData) => void;
  getPerson: (id: string) => Person | undefined;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [familyData, setFamilyData] = useState<FamilyData>(MOCK_FAMILY);

  const addPerson = (person: Person) => {
    setFamilyData(prev => {
      const nextPeople = { ...prev.people, [person.id]: person };

      // Helper to safely add ID to array ensuring uniqueness
      const addId = (ids: string[], idToAdd: string) => ids.includes(idToAdd) ? ids : [...ids, idToAdd];

      // 1. Link Parents: Add this person as a child to their parents
      person.parentIds.forEach(pId => {
        if (nextPeople[pId]) {
          nextPeople[pId] = {
            ...nextPeople[pId],
            childrenIds: addId(nextPeople[pId].childrenIds, person.id)
          };
        }
      });

      // 2. Link Children: Add this person as a parent to their children
      person.childrenIds.forEach(cId => {
        if (nextPeople[cId]) {
          nextPeople[cId] = {
            ...nextPeople[cId],
            parentIds: addId(nextPeople[cId].parentIds, person.id)
          };
        }
      });

      // 3. Link Partners: Add this person as a partner to their partners
      person.partnerIds.forEach(ptId => {
        if (nextPeople[ptId]) {
          nextPeople[ptId] = {
            ...nextPeople[ptId],
            partnerIds: addId(nextPeople[ptId].partnerIds, person.id)
          };
        }
      });

      return { ...prev, people: nextPeople };
    });
  };

  const updatePerson = (updatedPerson: Person) => {
    setFamilyData(prev => {
      const oldPerson = prev.people[updatedPerson.id];
      // If new person, fallback to add
      if (!oldPerson) {
         // Just call logic similar to add, but we need to return state here
         // For safety, we just run the update logic assuming 'oldPerson' had empty arrays if undefined
         // but usually updatePerson is called on existing.
      }

      const nextPeople = { ...prev.people };
      const pid = updatedPerson.id;

      // Helpers
      const removeId = (ids: string[], idToRemove: string) => ids.filter(id => id !== idToRemove);
      const addId = (ids: string[], idToAdd: string) => ids.includes(idToAdd) ? ids : [...ids, idToAdd];

      // --- Parents ---
      // Remove relationship from removed parents
      if (oldPerson) {
        oldPerson.parentIds.forEach(pId => {
          if (!updatedPerson.parentIds.includes(pId) && nextPeople[pId]) {
            nextPeople[pId] = { ...nextPeople[pId], childrenIds: removeId(nextPeople[pId].childrenIds, pid) };
          }
        });
      }
      // Add relationship to new parents
      updatedPerson.parentIds.forEach(pId => {
        if (nextPeople[pId]) {
          nextPeople[pId] = { ...nextPeople[pId], childrenIds: addId(nextPeople[pId].childrenIds, pid) };
        }
      });

      // --- Children ---
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

      // --- Partners ---
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

      // Finally update the person object itself
      nextPeople[pid] = updatedPerson;

      return { ...prev, people: nextPeople };
    });
  };

  const deletePerson = (id: string) => {
    setFamilyData(prev => {
      const person = prev.people[id];
      if (!person) return prev;
      
      const nextPeople = { ...prev.people };
      delete nextPeople[id];

      // Cleanup references in all other people
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
  };

  const setRawData = (data: FamilyData) => {
    setFamilyData(data);
  };

  const getPerson = (id: string) => familyData.people[id];

  return (
    <FamilyContext.Provider value={{ familyData, addPerson, updatePerson, deletePerson, setRawData, getPerson }}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) throw new Error('useFamily must be used within FamilyProvider');
  return context;
};