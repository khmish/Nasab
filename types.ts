
export interface Person {
  id: string;
  name: string;
  gender: 'male' | 'female';
  birthDate?: string;
  deathDate?: string;
  isDeceased?: boolean;
  photoUrl?: string;
  
  // New fields
  nationalId?: string;
  nationality?: string;
  phoneNumber?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  jobHistory?: string;

  partnerIds: string[];
  parentIds: string[];
  childrenIds: string[];
  attributes?: Record<string, any>;
}

export interface FamilyData {
  id: string;
  familyName: string;
  people: Record<string, Person>;
  rootId?: string; // The primary ancestor to start visualization
}

export type Language = 'en' | 'ar';

export interface Translation {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export interface TreeLayoutNode {
  id: string;
  x: number;
  y: number;
  data: Person;
  children?: TreeLayoutNode[];
  spouses?: Person[];
}
