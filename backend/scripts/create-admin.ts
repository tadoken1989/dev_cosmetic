import { DataSource } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from '../src/modules/auth/entities/user.entity'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

async function createAdmin() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'cosmetic_db',
    entities: [User],
    synchronize: false,
  })

  try {
    await dataSource.initialize()
    console.log('✅ Connected to database')

    const userRepository = dataSource.getRepository(User)

    // Check if admin exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@example.com' },
    })

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!')
      console.log('Email: admin@example.com')
      await dataSource.destroy()
      return
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 12)
    const admin = userRepository.create({
      email: 'admin@example.com',
      passwordHash,
      fullName: 'Admin User',
      role: 'admin',
      status: 'active',
    })

    await userRepository.save(admin)
    console.log('✅ Admin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email: admin@example.com')
    console.log('🔑 Password: admin123')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    await dataSource.destroy()
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  }
}

createAdmin()

