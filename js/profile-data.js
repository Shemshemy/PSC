/**
 * PSCIMS 2.0 - Candidate Profile Data Store & Persistence Engine
 * Supports IndexedDB + LocalStorage sync with real-time auto-save physics
 */

const STORAGE_KEY = 'psc_candidate_profile_v3';

export const initialProfile = {
  // Personal Details
  nationalId: '24681012',
  hudumaNo: '',
  payrollNumber: '20260012345',
  salutation: 'Ms',
  surname: 'Mwangi',
  firstName: 'Faith',
  otherNames: 'Wanjiku',
  dobDay: '14',
  dobMonth: '05',
  dobYear: '1992',
  gender: 'Female',
  kraPin: 'A009876543Z',
  nationality: 'Kenya',
  ethnicity: 'Kikuyu',
  isDisability: 'No',
  disabilityDetails: '',
  homeCounty: 'Kiambu',
  constituency: 'Gatundu South',
  subCounty: 'Gatundu',
  ward: 'Kiganjo',
  postalAddress: 'P.O. Box 30095',
  postalCode: '00100',
  town: 'Nairobi',
  mobileNumber: '0700000000',
  emailAddress: 'candidate@publicservice.go.ke',
  altContactName: 'Grace Mwangi',
  altContactMobile: '0711000222',

  // Public Service Status
  inPublicService: 'Yes',
  currentEmployer: 'Ministry of Information, Communications & The Digital Economy',
  positionHeld: 'Assistant Systems Analyst',
  effectiveDate: '2022-01-31',
  grossSalaryMonthly: '94,500',
  hasCriminalConviction: 'No',
  hasDismissal: 'No',

  // Qualifications Lists
  highSchoolQualifications: [
    {
      id: 'hs-1',
      schoolName: 'Alliance Girls High School',
      schoolLevel: 'Secondary Education Level',
      examType: 'KCSE',
      course: 'Secondary/High School Education',
      award: 'Certificate (KCSE)',
      grade: 'A',
      indexNumber: '11200001/014',
      certificateNo: 'KCSE/2010/98210',
      subjects: 'Maths A, English A, Kiswahili A, Physics A, Chemistry A, Biology A, Geography A, Computer Studies A',
      completionYear: '2010'
    },
    {
      id: 'hs-2',
      schoolName: 'Kilimani Primary School',
      schoolLevel: 'Primary Education Level',
      examType: 'KCPE',
      course: 'Primary School Level',
      award: 'Certificate (KCPE)',
      grade: '410 Marks',
      indexNumber: '11200044/008',
      certificateNo: 'KCPE/2006/11293',
      subjects: 'Maths 88, English 86, Kiswahili 82, Science 80, Social Studies & CRE 74',
      completionYear: '2006'
    }
  ],

  academicQualifications: [
    {
      id: 'acad-1',
      institutionName: 'Maseno University',
      areaOfStudy: 'Computing and Information Sciences',
      specialisation: 'Computer Science',
      course: 'Bachelor of Science (Computer Science)',
      award: 'Degree (BSc)',
      grade: 'Second Class Honours (Upper Division)',
      startDate: '2017-09-04',
      endDate: '2021-11-26',
      certificateNo: 'MSU/DEG/2021/4491'
    },
    {
      id: 'acad-2',
      institutionName: 'Moringa School',
      areaOfStudy: 'Computing and Information Sciences',
      specialisation: 'Software Development',
      course: 'Diploma in Software Development (Full-Stack)',
      award: 'Diploma',
      grade: 'Distinction',
      startDate: '2022-02-07',
      endDate: '2022-09-30',
      certificateNo: 'MOR-SD-2022-837'
    }
  ],

  professionalQualifications: [
    {
      id: 'prof-1',
      institutionName: 'CISCO Networking Academy',
      areaOfStudy: 'Computing and Information Sciences',
      specialisation: 'Communication and Computer Networks',
      course: 'Cisco Certified Network Associate (CCNA 1-4)',
      award: 'Professional Certificate',
      grade: 'Distinction',
      certificateNo: 'CSCO-13984102',
      examiner: 'Cisco Systems Inc.'
    },
    {
      id: 'prof-2',
      institutionName: 'Moringa School',
      areaOfStudy: 'Computing and Information Sciences',
      specialisation: 'Data Science & Machine Learning',
      course: 'Data Science Professional Track',
      award: 'Professional Certificate',
      grade: 'Distinction',
      certificateNo: 'MOR-DS-2023-112',
      examiner: 'Moringa School'
    }
  ],

  otherCourses: [
    {
      id: 'sem-1',
      courseName: 'Public Sector Cybersecurity Governance & Data Protection Act 2019',
      institutionName: 'Kenya School of Government (KSG) Lower Kabete',
      certificateNo: 'KSG/CYBER/2023/182',
      startDate: '2023-08-14',
      endDate: '2023-08-25'
    }
  ],

  professionalBodies: [
    {
      id: 'body-1',
      professionalBody: 'Computer Society of Kenya (CSK)',
      membershipType: 'Full Professional Member',
      registrationNumber: 'CSK-2022-8819',
      dateRenewed: '2026-01-07',
      expiryDate: '2026-12-31'
    },
    {
      id: 'body-2',
      professionalBody: 'Information Systems Audit and Control Association (ISACA)',
      membershipType: 'Professional Member',
      registrationNumber: 'ISACA-KE-94102',
      dateRenewed: '2026-01-15',
      expiryDate: '2026-12-31'
    }
  ],

  employmentHistory: [
    {
      id: 'emp-1',
      designation: 'ICT Officer II / Full Stack Software Engineer',
      category: 'Public Service / ICT',
      jobScale: 'CSG 10',
      grossMonthlySalary: '94,500',
      organization: 'State Department for ICT & The Digital Economy',
      natureOfDuties: 'Designed and deployed national microservices, spearheaded secure citizen portal integrations, ensured compliance with Data Protection guidelines.',
      startDate: '2022-02-01',
      endDate: 'Present'
    },
    {
      id: 'emp-2',
      designation: 'Software Developer Intern',
      category: 'Private Sector',
      jobScale: 'Contract',
      grossMonthlySalary: '45,000',
      organization: 'Net Mtaani Technology Solutions',
      natureOfDuties: 'Built client management dashboard, integrated M-PESA Daraja APIs and PostgreSQL databases.',
      startDate: '2021-03-01',
      endDate: '2021-12-15'
    }
  ],

  publications: [
    {
      id: 'pub-1',
      category: 'Peer-Reviewed Conference Paper',
      title: 'Optimizing Microservice Latency for African Civic Portals using Edge Caching',
      publisher: 'East African Journal of Computer Science & Telecommunications',
      year: '2024'
    }
  ],

  grants: [],
  studentSupervisions: [],

  referees: [
    {
      id: 'ref-1',
      fullName: 'Dr. Calvis',
      occupation: 'Dean, School of Computing & Informatics',
      postalAddress: 'P.O. Box 3275',
      postalCode: '40100',
      postalCity: 'Maseno',
      mobileNumber: '0710764518',
      emailAddress: 'sokoth@maseno.ac.ke',
      periodKnown: '4 years'
    },
    {
      id: 'ref-2',
      fullName: 'Sidney Essendi',
      occupation: 'CEO, Net Mtaani',
      postalAddress: 'P.O. Box 00200-4724',
      postalCode: '00100',
      postalCity: 'Kisumu',
      mobileNumber: '0722210711',
      emailAddress: 'info@sidnet.co.ke',
      periodKnown: '3 years'
    },
    {
      id: 'ref-3',
      fullName: 'Eng. Francis Mwangi',
      occupation: 'Director of ICT Infrastructure',
      postalAddress: 'P.O. Box 30025',
      postalCode: '00100',
      postalCity: 'Nairobi',
      mobileNumber: '0722998811',
      emailAddress: 'fmwangi@information.go.ke',
      periodKnown: '2 years'
    }
  ]
};

class ProfileStore {
  constructor() {
    this.profile = this.loadProfile();
    this.listeners = [];
  }

  loadProfile() {
    try {
      // Automatically purge legacy profile versions and reset storage
      localStorage.removeItem('psc_candidate_profile_v2');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Purge any stale profiles from older app versions
        if (parsed._version !== initialProfile._version) {
          localStorage.removeItem(STORAGE_KEY);
          return { ...initialProfile };
        }
        return { ...initialProfile, ...parsed };
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial state', e);
    }
    return { ...initialProfile };
  }

  get() {
    return this.profile;
  }

  set(updates) {
    this.profile = { ...this.profile, ...updates };
    this.persist();
    this.notify();
  }

  persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.profile);
    }
  }
}

export const profileStore = new ProfileStore();
