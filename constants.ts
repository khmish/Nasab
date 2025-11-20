
import { Translation, FamilyData } from './types';

export const TRANSLATIONS: Translation = {
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  familyTree: { en: 'Family Tree', ar: 'شجرة العائلة' },
  people: { en: 'People', ar: 'الأفراد' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  addPerson: { en: 'Add Person', ar: 'إضافة فرد' },
  importExport: { en: 'Import/Export', ar: 'استيراد/تصدير' },
  generateAI: { en: 'Generate with AI', ar: 'توليد بالذكاء الاصطناعي' },
  searchPlaceholder: { en: 'Search for a family member...', ar: 'ابحث عن فرد من العائلة...' },
  totalMembers: { en: 'Total Members', ar: 'إجمالي الأعضاء' },
  generations: { en: 'Generations', ar: 'الأجيال' },
  males: { en: 'Males', ar: 'ذكور' },
  females: { en: 'Females', ar: 'إناث' },
  name: { en: 'Full Name', ar: 'الاسم الكامل' },
  gender: { en: 'Gender', ar: 'الجنس' },
  birthDate: { en: 'Birth Date', ar: 'تاريخ الميلاد' },
  father: { en: 'Father', ar: 'الأب' },
  mother: { en: 'Mother', ar: 'الأم' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  aiPrompt: { en: 'Describe the family structure (e.g., "John (Engineer, living in NY) is the father of Mary...")', ar: 'صف هيكل العائلة (مثال: "أحمد (مهندس، يسكن في الرياض) هو والد مريم...")' },
  visualize: { en: 'Visualize', ar: 'عرض' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  parents: { en: 'Parents', ar: 'الآباء' },
  children: { en: 'Children', ar: 'الأبناء' },
  partners: { en: 'Partners', ar: 'الشركاء' },
  select: { en: 'Select...', ar: 'اختر...' },
  photo: { en: 'Photo', ar: 'الصورة' },
  uploadPhoto: { en: 'Upload Photo', ar: 'رفع صورة' },
  removePhoto: { en: 'Remove', ar: 'إزالة' },
  
  // New Fields
  nationalId: { en: 'National ID', ar: 'الرقم الوطني' },
  nationality: { en: 'Nationality', ar: 'الجنسية' },
  phoneNumber: { en: 'Phone Number', ar: 'رقم الهاتف' },
  location: { en: 'Location', ar: 'الموقع' },
  jobHistory: { en: 'Job Brief History', ar: 'نبذة عن العمل' },
  personalInfo: { en: 'Personal Information', ar: 'المعلومات الشخصية' },
  contactInfo: { en: 'Contact & Location', ar: 'التواصل والموقع' },
  professionalInfo: { en: 'Professional Info', ar: 'المعلومات المهنية' },
  pinLocation: { en: 'Pin Location on Map', ar: 'تحديد الموقع على الخريطة' },
  clickToPin: { en: 'Click on map to pin location', ar: 'اضغط على الخريطة لتحديد الموقع' },
  
  // Deceased
  isDeceased: { en: 'Deceased', ar: 'متوفي' },
  deathDate: { en: 'Death Date', ar: 'تاريخ الوفاة' },
  living: { en: 'Living', ar: 'على قيد الحياة' },
  status: { en: 'Status', ar: 'الحالة' },

  // Tree Actions
  addParent: { en: 'Add Parent', ar: 'إضافة أب/أم' },
  addChild: { en: 'Add Child', ar: 'إضافة ابن/ابنة' },
  addPartner: { en: 'Add Partner', ar: 'إضافة شريك' },
  actions: { en: 'Actions', ar: 'إجراءات' },
};

export const NATIONALITIES = [
  'Saudi', 'Emirati', 'Kuwaiti', 'Qatari', 'Omani', 'Bahraini', 
  'Jordanian', 'Palestinian', 'Lebanese', 'Syrian', 'Iraqi', 'Yemeni', 
  'Egyptian', 'Sudanese', 'Libyan', 'Tunisian', 'Algerian', 'Moroccan',
  'American', 'British', 'French', 'German', 'Canadian', 'Australian', 
  'Indian', 'Pakistani', 'Bangladeshi', 'Filipino', 'Other'
];

export const MOCK_FAMILY: FamilyData = {
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
