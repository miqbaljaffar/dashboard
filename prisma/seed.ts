import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;
import {
  initialStudents,
} from '../src/data/mockData';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔄 Memulai reset data...');

  // 1. Hapus semua data transaksi (urutan penting - dari dependan dulu)
  console.log('  ↳ Menghapus data nilai (StudentGrade)...');
  await prisma.studentGrade.deleteMany();

  console.log('  ↳ Menghapus kolom nilai (GradeColumn)...');
  await prisma.gradeColumn.deleteMany();

  console.log('  ↳ Menghapus submission tugas (AssignmentSubmission)...');
  await prisma.assignmentSubmission.deleteMany();

  console.log('  ↳ Menghapus tugas (Assignment)...');
  await prisma.assignment.deleteMany();

  console.log('  ↳ Menghapus catatan presensi (AttendanceRecord)...');
  await prisma.attendanceRecord.deleteMany();

  console.log('  ↳ Menghapus log pelanggaran (BehavioralIncidence)...');
  await prisma.behavioralIncidence.deleteMany();

  console.log('  ↳ Menghapus log penghargaan (BehavioralReward)...');
  await prisma.behavioralReward.deleteMany();

  // 2. Reset skor/statistik semua siswa yang ada ke nilai awal
  console.log('  ↳ Mereset skor dan statistik siswa ke nilai awal...');
  await prisma.student.updateMany({
    data: {
      behaviorScore: 100,
      attendanceRate: 1.0,
      violationsCount: 0,
      status: 'Active',
    },
  });

  // 3. Upsert siswa dari mockData (tambah jika belum ada, update jika sudah ada)
  console.log('  ↳ Sinkronisasi data siswa dari mockData...');
  for (const student of initialStudents) {
    await prisma.student.upsert({
      where: { id: student.id },
      update: {
        name: student.name,
        gender: student.gender,
        age: student.age,
        classroom: student.classroom,
        enrollmentDate: student.enrollmentDate,
        graduationTarget: student.graduationTarget,
        status: 'Active',
        behaviorScore: 100,
        attendanceRate: 1.0,
        violationsCount: 0,
      },
      create: {
        id: student.id,
        name: student.name,
        gender: student.gender,
        age: student.age,
        classroom: student.classroom,
        enrollmentDate: student.enrollmentDate,
        graduationTarget: student.graduationTarget,
        status: 'Active',
        behaviorScore: 100,
        attendanceRate: 1.0,
        violationsCount: 0,
      },
    });
  }

  console.log('✅ Reset selesai! Semua data transaksi dihapus, siswa dipertahankan.');
  console.log(`   Total siswa: ${initialStudents.length} orang`);
}

main()
  .catch((e) => {
    console.error('❌ Error saat reset:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
