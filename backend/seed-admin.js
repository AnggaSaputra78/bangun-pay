import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './src/models/User.model.js'

dotenv.config()

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Cek apakah admin sudah ada
    const existingAdmin = await User.findOne({ email: 'admin@bangunpay.com' })
    
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists')
      process.exit(0)
    }

    // Buat admin user
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@bangunpay.com',
      password: 'Password123',
      role: 'super_admin',
      isActive: true,
    })

    console.log('✅ Admin user created:', admin.email)
    console.log('🔑 Password: Password123')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding admin:', error)
    process.exit(1)
  }
}

seedAdmin()