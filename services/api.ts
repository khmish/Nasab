
import { FamilyData, Person } from '../types';

// Change this to your actual backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Generic fetch wrapper
const request = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `API Error: ${response.statusText}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

export const api = {
  // Get the entire family tree
  getFamily: (familyId: string = 'default') => {
    return request<FamilyData>(`/families/${familyId}`);
  },

  // Create a new person
  createPerson: (person: Person) => {
    return request<Person>('/people', {
      method: 'POST',
      body: JSON.stringify(person),
    });
  },

  // Update an existing person
  updatePerson: (person: Person) => {
    return request<Person>(`/people/${person.id}`, {
      method: 'PUT',
      body: JSON.stringify(person),
    });
  },

  // Delete a person
  deletePerson: (id: string) => {
    return request<void>(`/people/${id}`, {
      method: 'DELETE',
    });
  },

  // Batch import (optional, for AI generation)
  importPeople: (people: Person[]) => {
    return request<Person[]>('/people/batch', {
      method: 'POST',
      body: JSON.stringify({ people }),
    });
  }
};
