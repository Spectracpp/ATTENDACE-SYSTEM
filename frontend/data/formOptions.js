// Course options
export const courses = [
  { id: 'cs', name: 'Computer Science' },
  { id: 'it', name: 'Information Technology' },
  { id: 'ec', name: 'Electronics' },
  { id: 'me', name: 'Mechanical' },
  { id: 'ce', name: 'Civil' },
  { id: 'ee', name: 'Electrical' }
];

// Department options
export const departments = [
  { id: 'cse', name: 'CSE' },
  { id: 'it', name: 'IT' },
  { id: 'ece', name: 'ECE' },
  { id: 'me', name: 'ME' },
  { id: 'ce', name: 'CE' },
  { id: 'ee', name: 'EE' }
];

// Semester options
export const semesters = Array.from({ length: 8 }, (_, i) => ({
  id: `${i + 1}`,
  name: `Semester ${i + 1}`
}));

export const roles = [
  { id: 'student', name: 'Student' },
  { id: 'faculty', name: 'Faculty' },
  { id: 'staff', name: 'Staff' },
  { id: 'admin', name: 'Administrator' }
];

export const genders = [
  { id: 'male', name: 'Male' },
  { id: 'female', name: 'Female' },
  { id: 'other', name: 'Other' },
  { id: 'prefer_not_to_say', name: 'Prefer not to say' }
];

export const years = [
  { id: '1', name: 'First Year' },
  { id: '2', name: 'Second Year' },
  { id: '3', name: 'Third Year' },
  { id: '4', name: 'Fourth Year' }
];

export const bloodGroups = [
  { id: 'A+', name: 'A+' },
  { id: 'A-', name: 'A-' },
  { id: 'B+', name: 'B+' },
  { id: 'B-', name: 'B-' },
  { id: 'AB+', name: 'AB+' },
  { id: 'AB-', name: 'AB-' },
  { id: 'O+', name: 'O+' },
  { id: 'O-', name: 'O-' }
];

export const states = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const designations = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Lecturer',
  'Lab Assistant',
  'Administrative Staff',
  'Support Staff',
];

export const qualifications = [
  'Ph.D.',
  'M.Tech',
  'M.E.',
  'M.Sc',
  'MBA',
  'B.Tech',
  'B.E.',
  'B.Sc',
  'Diploma',
];

export const maritalStatus = [
  'Single',
  'Married',
  'Divorced',
  'Widowed',
  'Prefer not to say',
];
