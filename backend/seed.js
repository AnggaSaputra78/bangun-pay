import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExpenseCategory from './src/models/ExpenseCategory.model.js';

dotenv.config();

const defaultCategories = [
  { name: 'Tukang Harian', slug: 'tukang-harian', color: '#3b82f6' },
  { name: 'Tukang Borongan', slug: 'tukang-borongan', color: '#8b5cf6' },
  { name: 'Mandor', slug: 'mandor', color: '#ec4899' },
  { name: 'Material Bangunan', slug: 'material-bangunan', color: '#f97316' },
  { name: 'Transportasi', slug: 'transportasi', color: '#10b981' },
  { name: 'Peralatan', slug: 'peralatan', color: '#f59e0b' },
  { name: 'Operasional Lainnya', slug: 'operasional-lainnya', color: '#64748b' },
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const category of defaultCategories) {
      const exists = await ExpenseCategory.findOne({ slug: category.slug });
      if (!exists) {
        await ExpenseCategory.create(category);
        console.log(`✅ Created category: ${category.name}`);
      } else {
        console.log(`⏭️  Skipped (exists): ${category.name}`);
      }
    }

    console.log('🎉 Seed completed');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedCategories();