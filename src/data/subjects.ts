// The eight study subjects. Each one's color is used on its tile, page header and Q&A tag.
// `topics` lists what the subject's charts actually cover; edit freely.
export interface Subject {
  id: string;
  name: string;
  abbr: string;
  color: string;
  tint: string;
  topics: string;
}

export const subjects: Subject[] = [
  { id: 'blood-bank', name: 'Blood Bank', abbr: 'BB', color: '#B42318', tint: '#FDECEA',
    topics: 'Antibody panel walkthrough, ABO discrepancies, antibody characteristics, donor criteria' },
  { id: 'chemistry', name: 'Chemistry', abbr: 'CH', color: '#0E6A80', tint: '#E3F2F6',
    topics: 'Enzymes, tumor and cardiac markers, lipoproteins, diabetes, acid-base' },
  { id: 'coagulation', name: 'Coagulation', abbr: 'CO', color: '#A14A06', tint: '#FCEFE3',
    topics: 'The coagulation cascade, drawn in a few easy steps' },
  { id: 'endocrinology', name: 'Endocrinology', abbr: 'EN', color: '#6D28D9', tint: '#F0EAFD',
    topics: 'One-page graphics for the thyroid, adrenal gland and estrogen' },
  { id: 'hematology', name: 'Hematology', abbr: 'HE', color: '#BE185D', tint: '#FCE8F1',
    topics: 'Reference ranges, hematopoiesis, lymphocytes, granulocyte abnormalities, hemoglobin electrophoresis' },
  { id: 'immunology', name: 'Immunology', abbr: 'IM', color: '#1D4ED8', tint: '#E7EEFD',
    topics: 'Hepatitis B serologic markers, made easy to memorize' },
  { id: 'microbiology', name: 'Microbiology', abbr: 'MI', color: '#15703A', tint: '#E5F4EA',
    topics: 'Gram-positive and gram-negative flowcharts, anaerobes, HACEK, TSI, parasites' },
  { id: 'urinalysis-body-fluids', name: 'Urinalysis & Body Fluids', abbr: 'UA', color: '#8A5A00', tint: '#FBF1DC',
    topics: 'Urine crystals' },
];

export const subjectById = Object.fromEntries(subjects.map((s) => [s.id, s]));
export const subjectPath = (id: string) => `/high-yield-notes-2/${id}/`;
