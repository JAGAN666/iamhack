import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo universities
  const universities = await Promise.all([
    prisma.university.upsert({
      where: { emailDomain: 'emich.edu' },
      update: {},
      create: {
        name: 'Eastern Michigan University',
        emailDomain: 'emich.edu',
        adminEmail: 'admin@emich.edu',
        active: true,
      },
    }),
    prisma.university.upsert({
      where: { emailDomain: 'vt.edu' },
      update: {},
      create: {
        name: 'Virginia Tech',
        emailDomain: 'vt.edu',
        adminEmail: 'admin@vt.edu',
        active: true,
      },
    }),
    prisma.university.upsert({
      where: { emailDomain: 'oakland.edu' },
      update: {},
      create: {
        name: 'Oakland University',
        emailDomain: 'oakland.edu',
        adminEmail: 'admin@oakland.edu',
        active: true,
      },
    }),
  ]);

  console.log('✅ Universities created');

  // Create demo users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'demo@student.edu' },
      update: {},
      create: {
        email: 'demo@student.edu',
        universityEmail: 'john.doe@emich.edu',
        firstName: 'John',
        lastName: 'Doe',
        university: 'Eastern Michigan University',
        studentId: 'EMU123456',
        emailVerified: true,
        role: 'student',
      },
    }),
    prisma.user.upsert({
      where: { email: 'demo2@student.edu' },
      update: {},
      create: {
        email: 'demo2@student.edu',
        universityEmail: 'jane.smith@vt.edu',
        firstName: 'Jane',
        lastName: 'Smith',
        university: 'Virginia Tech',
        studentId: 'VT789012',
        emailVerified: true,
        role: 'student',
      },
    }),
    prisma.user.upsert({
      where: { email: 'admin@academicnft.com' },
      update: {},
      create: {
        email: 'admin@academicnft.com',
        universityEmail: 'admin@academicnft.com',
        firstName: 'Admin',
        lastName: 'User',
        university: 'Academic NFT Platform',
        emailVerified: true,
        role: 'admin',
      },
    }),
  ]);

  console.log('✅ Demo users created');

  // Create demo achievements
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        userId: users[0].id,
        type: 'gpa',
        title: "Dean's List Achievement",
        description: 'Maintained 3.8 GPA for Fall 2023 semester',
        gpaValue: 3.8,
        verified: true,
        verifiedBy: users[2].id,
        verifiedAt: new Date(),
        verificationStatus: 'approved',
      },
    }),
    prisma.achievement.create({
      data: {
        userId: users[0].id,
        type: 'research',
        title: 'Published Research Paper',
        description: 'Co-authored paper on blockchain applications in education',
        verified: true,
        verifiedBy: users[2].id,
        verifiedAt: new Date(),
        verificationStatus: 'approved',
      },
    }),
    prisma.achievement.create({
      data: {
        userId: users[1].id,
        type: 'leadership',
        title: 'Student Government President',
        description: 'Elected as Student Government President for 2023-2024',
        verified: true,
        verifiedBy: users[2].id,
        verifiedAt: new Date(),
        verificationStatus: 'approved',
      },
    }),
  ]);

  console.log('✅ Demo achievements created');

  // Create demo companies
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'Tech Innovators Inc',
        industry: 'Technology',
        size: 'medium',
        website: 'https://techinnovators.com',
        description: 'Leading technology company focused on educational innovation',
        isVerified: true,
        contactEmail: 'hr@techinnovators.com',
        tier: 'premium',
        creditsBalance: 50,
      },
    }),
    prisma.company.create({
      data: {
        name: 'Research Labs Corp',
        industry: 'Research',
        size: 'large',
        website: 'https://researchlabs.com',
        description: 'Premier research organization offering internships and opportunities',
        isVerified: true,
        contactEmail: 'careers@researchlabs.com',
        tier: 'enterprise',
        creditsBalance: 100,
      },
    }),
  ]);

  console.log('✅ Demo companies created');

  // Create demo opportunities
  const opportunities = await Promise.all([
    prisma.opportunity.create({
      data: {
        title: 'Premium Research Database Access',
        description: 'Access to IEEE and ACM digital libraries for research purposes',
        type: 'research',
        category: 'digital',
        requiredNFTs: JSON.stringify(['gpa_guardian', 'research_rockstar']),
        minLevel: 1,
        minRarity: 'common',
        companyId: companies[1].id,
        postedBy: users[2].id,
        location: 'Online',
        remote: true,
        url: 'https://researchlabs.com/database-access',
        status: 'active',
        featured: true,
        maxParticipants: 100,
      },
    }),
    prisma.opportunity.create({
      data: {
        title: 'Summer Internship Program',
        description: 'Paid summer internship in software development and blockchain technology',
        type: 'internship',
        category: 'physical',
        requiredNFTs: JSON.stringify(['gpa_guardian']),
        minLevel: 1,
        minRarity: 'common',
        companyId: companies[0].id,
        postedBy: users[2].id,
        salary: '$15-20/hour',
        location: 'San Francisco, CA',
        remote: false,
        url: 'https://techinnovators.com/internships',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        applicationDeadline: new Date('2024-04-15'),
        status: 'active',
        maxParticipants: 20,
      },
    }),
  ]);

  console.log('✅ Demo opportunities created');

  // Create social profiles
  const socialProfiles = await Promise.all([
    prisma.socialProfile.create({
      data: {
        userId: users[0].id,
        displayName: 'John Doe',
        bio: 'Computer Science student passionate about blockchain and education',
        isPublic: true,
        showNFTs: true,
        showAchievements: true,
        totalPoints: 150,
        level: 2,
        streak: 5,
      },
    }),
    prisma.socialProfile.create({
      data: {
        userId: users[1].id,
        displayName: 'Jane Smith',
        bio: 'Engineering student and student government leader',
        isPublic: true,
        showNFTs: true,
        showAchievements: true,
        totalPoints: 200,
        level: 3,
        streak: 8,
      },
    }),
  ]);

  console.log('✅ Social profiles created');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📊 Demo Data Summary:');
  console.log(`- Universities: ${universities.length}`);
  console.log(`- Users: ${users.length}`);
  console.log(`- Achievements: ${achievements.length}`);
  console.log(`- Companies: ${companies.length}`);
  console.log(`- Opportunities: ${opportunities.length}`);
  console.log(`- Social Profiles: ${socialProfiles.length}`);
  console.log('\n🔑 Demo Login Credentials:');
  console.log('- Student: demo@student.edu (no password required)');
  console.log('- Student 2: demo2@student.edu (no password required)');
  console.log('- Admin: admin@academicnft.com (no password required)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });