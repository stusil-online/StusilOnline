require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const prisma = require('../src/services/db');

const samples = [
  {
    id: 'sample-opportunity-001',
    title: 'Global Youth Innovation Scholarship',
    deadline: new Date('2027-02-15T23:59:59.999Z'),
    category: 'scholarship',
    link: 'https://example.org/youth-scholarship',
    eligibility_notes: 'For students pursuing a first undergraduate degree.',
    student_level: 'undergraduate',
    is_remote: true,
    is_global: true
  },
  {
    id: 'sample-opportunity-002',
    title: 'Climate Solutions Student Challenge',
    deadline: new Date('2027-03-01T23:59:59.999Z'),
    category: 'competition',
    link: 'https://example.org/climate-challenge',
    eligibility_notes: 'Open to teams of 2-5 students.',
    student_level: 'any',
    is_remote: true,
    is_global: true
  },
  {
    id: 'sample-opportunity-003',
    title: 'Community Technology Internship',
    deadline: new Date('2027-04-10T23:59:59.999Z'),
    category: 'internship',
    link: 'https://example.org/technology-internship',
    eligibility_notes: 'Applicants should be available for a 10-week placement.',
    student_level: 'undergraduate',
    is_remote: false,
    is_global: false
  }
];

async function main() {
  for (const sample of samples) {
    await prisma.opportunity.upsert({ where: { id: sample.id }, create: sample, update: sample });
  }
}

main()
  .catch((error) => {
    console.error('Failed to seed opportunities:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());