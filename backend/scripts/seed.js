const mongoose = require('mongoose');
const config = require('../src/config/env');
const {
  User,
  Category,
  Service,
  Zone,
  Provider,
  ProviderZone,
  Technician,
} = require('../src/models');
const { hashPassword } = require('../src/core/security/password');
const { ROLES, DUTY_STATUS, KYC_STATUS } = require('../src/core/constants');

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected.');

    // Clear existing
    await User.deleteMany({});
    await Category.deleteMany({});
    await Service.deleteMany({});
    await Zone.deleteMany({});
    await Provider.deleteMany({});
    await ProviderZone.deleteMany({});
    await Technician.deleteMany({});

    console.log('Cleared existing collections.');

    // Seed default password for demo accounts
    const passwordHash = await hashPassword('password123');

    // 1. Super Admin
    const adminUser = await User.create({
      name: 'Super Administrator',
      email: 'admin@homeserve.test',
      phone: '+91 99000 00001',
      passwordHash,
      role: ROLES.SUPER_ADMIN,
    });

    // 2. Customer
    const customerUser = await User.create({
      name: 'Rahul Sharma',
      email: 'customer@homeserve.test',
      phone: '+91 98765 43210',
      passwordHash,
      role: ROLES.CUSTOMER,
    });

    // 3. Provider User & Profile
    const providerUser = await User.create({
      name: 'Apex Cooling Admin',
      email: 'provider@homeserve.test',
      phone: '+91 80 4123 4567',
      passwordHash,
      role: ROLES.PROVIDER,
    });

    // 4. Categories
    const categoriesData = [
      {
        name: 'Electrical Services',
        slug: 'electrical',
        description: 'Expert repairs for wiring, switchboards, MCB breakers, fans, and home appliances.',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
        isActive: true,
      },
      {
        name: 'Plumbing & Water',
        slug: 'plumbing',
        description: 'Fix leaking pipes, taps, water motors, bathroom fixtures, and drainage systems.',
        image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
        isActive: true,
      },
      {
        name: 'AC Repair & Service',
        slug: 'ac-repair',
        description: 'Split and window AC deep cleaning, gas refill, compressor maintenance, and installation.',
        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
        isActive: true,
      },
      {
        name: 'Home Cleaning',
        slug: 'cleaning',
        description: 'Deep kitchen cleaning, sofa shampooing, bathroom sanitization, and full home scrub.',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
        isActive: true,
      },
      {
        name: 'Carpentry & Furniture',
        slug: 'carpentry',
        description: 'Door locks, hinge repairs, custom furniture assembly, and wooden polish.',
        image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
        isActive: true,
      },
      {
        name: 'Painting & Waterproofing',
        slug: 'painting',
        description: 'Interior wall painting, texture finishes, exterior weather protection, and crack sealing.',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
        isActive: true,
      },
    ];
    const createdCategories = await Category.insertMany(categoriesData);

    const catElec = createdCategories.find((c) => c.slug === 'electrical');
    const catPlumb = createdCategories.find((c) => c.slug === 'plumbing');
    const catAC = createdCategories.find((c) => c.slug === 'ac-repair');
    const catClean = createdCategories.find((c) => c.slug === 'cleaning');
    const catCarp = createdCategories.find((c) => c.slug === 'carpentry');

    // 5. Services
    const servicesData = [
      {
        categoryId: catElec._id,
        name: 'Ceiling Fan Installation & Repair',
        slug: 'ceiling-fan-installation',
        description: 'Standard and decorative ceiling fan installation, motor noise diagnostics, and capacitor replacement.',
        basePricePaise: 29900,
        estimatedDurationMinutes: 45,
        isActive: true,
      },
      {
        categoryId: catElec._id,
        name: 'Switchboard & Socket Replacement',
        slug: 'switchboard-replacement',
        description: 'Replacement of burnt modular sockets, 16A power points for geyser/AC, and fuse rewiring.',
        basePricePaise: 19900,
        estimatedDurationMinutes: 30,
        isActive: true,
      },
      {
        categoryId: catPlumb._id,
        name: 'Tap & Shower Leakage Repair',
        slug: 'tap-leakage-repair',
        description: 'Dripping tap washer replacement, mixer cartridge fixing, and shower arm unblocking.',
        basePricePaise: 24900,
        estimatedDurationMinutes: 40,
        isActive: true,
      },
      {
        categoryId: catAC._id,
        name: 'AC Foam Jet Deep Service',
        slug: 'ac-foam-jet-service',
        description: 'High-pressure water pump and antibacterial foam cleaning for indoor and outdoor coils.',
        basePricePaise: 69900,
        estimatedDurationMinutes: 75,
        isActive: true,
      },
      {
        categoryId: catClean._id,
        name: 'Deep Kitchen Degreasing & Sanitization',
        slug: 'deep-kitchen-cleaning',
        description: 'Complete removal of oil stains, chimney exterior cleaning, tiles scrub, and cabinet sanitizing.',
        basePricePaise: 129900,
        estimatedDurationMinutes: 120,
        isActive: true,
      },
      {
        categoryId: catCarp._id,
        name: 'Main Door Lock Installation',
        slug: 'door-lock-installation',
        description: 'Fitting of brass mortise locks, cylinder deadbolts, and door handles.',
        basePricePaise: 39900,
        estimatedDurationMinutes: 60,
        isActive: true,
      },
    ];
    await Service.insertMany(servicesData);

    // 6. Provider Profile
    const provider = await Provider.create({
      userId: providerUser._id,
      businessName: 'Apex Cooling & Appliances Ltd',
      businessAddress: 'Bellandur Tech Zone, Bangalore',
      gstNumber: '29ABCDE1234F1Z5',
      panNumber: 'ABCDE1234F',
      kycStatus: KYC_STATUS.APPROVED,
      walletBalancePaise: 450000,
      bankDetails: {
        accountNumberMasked: 'XXXX-XXXX-4589',
        ifscCode: 'HDFC0001042',
        bankName: 'HDFC Bank',
      },
      categories: [catAC._id, catElec._id],
    });

    // 7. Technician User & Profile
    const techUser = await User.create({
      name: 'Vikas Kumar',
      email: 'technician@homeserve.test',
      phone: '+91 91234 56789',
      passwordHash,
      role: ROLES.TECHNICIAN,
    });

    await Technician.create({
      userId: techUser._id,
      providerId: provider._id,
      skills: [catAC._id, catElec._id],
      dutyStatus: DUTY_STATUS.ONLINE,
      rating: 4.8,
      totalJobsCount: 142,
      isActive: true,
    });

    // 8. Service Zones
    const zonesData = [
      { name: 'Bellandur & Outer Ring Road', pincode: '560103', city: 'Bangalore', state: 'Karnataka', isActive: true },
      { name: 'Koramangala & HSR', pincode: '560034', city: 'Bangalore', state: 'Karnataka', isActive: true },
      { name: 'Indiranagar & Domlur', pincode: '560038', city: 'Bangalore', state: 'Karnataka', isActive: true },
      { name: 'Whitefield', pincode: '560066', city: 'Bangalore', state: 'Karnataka', isActive: true },
    ];
    const createdZones = await Zone.insertMany(zonesData);

    for (const z of createdZones) {
      await ProviderZone.create({
        providerId: provider._id,
        zoneId: z._id,
        isActive: true,
      });
    }

    console.log('✅ Demo database seeded successfully!');
    console.log('Accounts created:');
    console.log('Admin: admin@homeserve.test | password123');
    console.log('Customer: customer@homeserve.test | password123');
    console.log('Provider: provider@homeserve.test | password123');
    console.log('Technician: technician@homeserve.test | password123');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
