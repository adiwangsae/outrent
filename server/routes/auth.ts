import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";
import { authenticate, AuthRequest } from "../middlewares/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    let user = await prisma.user.findUnique({ where: { email } });
    
    // Auto-create/reset the default admin/owner or persistent demo users if they are requesting with valid predefined passwords to ensure they never get invalid credentials
    if (email === 'owner@outrent.com' && password === 'owner123') {
      const hashedPassword = await bcrypt.hash('owner123', 10);
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: 'owner@outrent.com',
            name: 'Pemilik Usaha (Owner)',
            password: hashedPassword,
            role: 'super_admin',
            isVerified: true,
            isDemo: false
          }
        });
      } else {
        user = await prisma.user.update({
          where: { email },
          data: { password: hashedPassword, role: 'super_admin' }
        });
      }
    } else if (email === 'admin@outrent.com' && password === 'admin123') {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: 'admin@outrent.com',
            name: 'Admin Utama',
            password: hashedPassword,
            role: 'admin',
            isVerified: true,
            isDemo: true
          }
        });
      } else {
        user = await prisma.user.update({
          where: { email },
          data: { password: hashedPassword, role: 'admin' }
        });
      }
    } else if (email === 'pelanggan@outrent.com' && password === 'pelanggan123') {
      const hashedPassword = await bcrypt.hash('pelanggan123', 10);
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: 'pelanggan@outrent.com',
            name: 'Rian Maulana (Pelanggan)',
            password: hashedPassword,
            role: 'customer',
            isVerified: true,
            isDemo: false,
            phone: '081122334455',
            address: 'Mataram, Lombok'
          }
        });
      } else {
        user = await prisma.user.update({
          where: { email },
          data: { password: hashedPassword }
        });
      }
    }

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ token, user: userWithoutPassword });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/demo", async (req, res) => {
  const { role } = req.body; // 'admin' or 'customer'
  try {
    // 1. Ensure Categories exist
    let catTenda = await prisma.category.findFirst({ where: { name: 'Tenda' } });
    if (!catTenda) {
      catTenda = await prisma.category.create({ data: { name: 'Tenda' } });
    }
    
    let catTas = await prisma.category.findFirst({ where: { name: 'Tas & Carrier' } });
    if (!catTas) {
      catTas = await prisma.category.create({ data: { name: 'Tas & Carrier' } });
    }

    // 2. Ensure Inventory Items and Units exist
    let itemTenda = await prisma.inventoryItem.findFirst({ where: { name: 'Tenda Eiger 4P' } });
    if (!itemTenda) {
      itemTenda = await prisma.inventoryItem.create({
        data: {
          categoryId: catTenda.id,
          name: 'Tenda Eiger 4P',
          description: 'Tenda dome double layer yang andal untuk segala cuaca dan kondisi pegunungan.',
          pricePerDay: 65000,
          icon: 'Tent',
          units: {
            create: [
              { unitCode: 'TEN-EIG-4P-001', status: 'available' },
              { unitCode: 'TEN-EIG-4P-002', status: 'available' },
              { unitCode: 'TEN-EIG-4P-003', status: 'available' },
              { unitCode: 'TEN-EIG-4P-004', status: 'available' },
              { unitCode: 'TEN-EIG-4P-005', status: 'available' },
            ]
          }
        }
      });
    }

    let itemTas = await prisma.inventoryItem.findFirst({ where: { name: 'Carrier Consina 60L' } });
    if (!itemTas) {
      itemTas = await prisma.inventoryItem.create({
        data: {
          categoryId: catTas.id,
          name: 'Carrier Consina 60L',
          description: 'Tas carrier kapasitas 60 liter dengan konstruksi punggung ergonomis untuk efisiensi beban.',
          pricePerDay: 40000,
          icon: 'Backpack',
          units: {
            create: [
              { unitCode: 'BAG-CON-60-001', status: 'available' },
              { unitCode: 'BAG-CON-60-002', status: 'available' },
              { unitCode: 'BAG-CON-60-003', status: 'available' },
            ]
          }
        }
      });
    }

    // 3. Ensure Demo Users exist
    const adminPassword = await bcrypt.hash('demo123', 10);
    const customerPassword = await bcrypt.hash('demo123', 10);

    let demoAdmin = await prisma.user.findUnique({ where: { email: 'demo.admin@outrent.com' } });
    if (!demoAdmin) {
      demoAdmin = await prisma.user.create({
        data: {
          email: 'demo.admin@outrent.com',
          name: 'Admin Demo Outrent',
          password: adminPassword,
          role: 'admin',
          isVerified: true,
          isDemo: true
        }
      });
    } else if (!demoAdmin.isDemo) {
      demoAdmin = await prisma.user.update({
        where: { id: demoAdmin.id },
        data: { isDemo: true }
      });
    }

    let demoCustomer = await prisma.user.findUnique({ where: { email: 'demo.customer@outrent.com' } });
    if (!demoCustomer) {
      demoCustomer = await prisma.user.create({
        data: {
          email: 'demo.customer@outrent.com',
          name: 'Pratama Adi (Customer Demo)',
          password: customerPassword,
          role: 'customer',
          isVerified: true,
          isDemo: true,
          phone: '081234567890',
          address: 'Jl. Raya Sembalun No. 24, Lombok Timur',
          identityType: 'KTP',
          identityNumber: '5203001234560001',
          identityUrl: 'demo_ktp.jpg'
        }
      });
    } else if (!demoCustomer.isDemo) {
      demoCustomer = await prisma.user.update({
        where: { id: demoCustomer.id },
        data: { isDemo: true }
      });
    }

    // 4. Create some realistic demo bookings under dev database if they do not exist
    const existingBookingsCount = await prisma.booking.count({
      where: { userId: demoCustomer.id }
    });

    if (existingBookingsCount === 0) {
      // Fetch some available units of tenda and tas.
      const tendaUnits = await prisma.inventoryUnit.findMany({
        where: { inventoryItemId: itemTenda.id }
      });
      const tasUnits = await prisma.inventoryUnit.findMany({
        where: { inventoryItemId: itemTas.id }
      });

      // 4A: Finished/Completed historic booking
      if (tendaUnits[0] && tasUnits[0]) {
        await prisma.booking.create({
          data: {
            bookingNumber: 'ORD-DEMO-001',
            userId: demoCustomer.id,
            startDate: new Date('2026-05-10'),
            endDate: new Date('2026-05-13'),
            totalDays: 3,
            totalPrice: 105000 * 3, 
            status: 'completed',
            pickupBranch: 'Sembalun Utama',
            items: {
              create: [
                { unitId: tendaUnits[0].id, pricePerDay: 65000 },
                { unitId: tasUnits[0].id, pricePerDay: 40000 }
              ]
            }
          }
        });
      }

      // 4B: Ongoing booking
      if (tendaUnits[1]) {
        await prisma.booking.create({
          data: {
            bookingNumber: 'ORD-DEMO-002',
            userId: demoCustomer.id,
            startDate: new Date('2025-05-25'),
            endDate: new Date('2025-05-30'),
            totalDays: 5,
            totalPrice: 65000 * 5,
            status: 'ongoing',
            pickupBranch: 'Sembalun Utama',
            items: {
              create: [
                { unitId: tendaUnits[1].id, pricePerDay: 65000 }
              ]
            }
          }
        });
        await prisma.inventoryUnit.update({
          where: { id: tendaUnits[1].id },
          data: { status: 'borrowed' }
        });
      }

      // 4C: Payment verification waiting
      if (tendaUnits[2] && tasUnits[1]) {
        await prisma.booking.create({
          data: {
            bookingNumber: 'ORD-DEMO-003',
            userId: demoCustomer.id,
            startDate: new Date('2026-06-01'),
            endDate: new Date('2026-06-04'),
            totalDays: 3,
            totalPrice: 105000 * 3,
            status: 'payment_verified',
            pickupBranch: 'Sembalun Utama',
            items: {
              create: [
                { unitId: tendaUnits[2].id, pricePerDay: 65000 },
                { unitId: tasUnits[1].id, pricePerDay: 40000 }
              ]
            }
          }
        });
      }

      // 4D: Ready for pickup
      if (tendaUnits[3]) {
        await prisma.booking.create({
          data: {
            bookingNumber: 'ORD-DEMO-004',
            userId: demoCustomer.id,
            startDate: new Date('2026-06-05'),
            endDate: new Date('2026-06-08'),
            totalDays: 3,
            totalPrice: 65000 * 3,
            status: 'ready_pickup',
            pickupBranch: 'Sembalun Utama',
            items: {
              create: [
                { unitId: tendaUnits[3].id, pricePerDay: 65000 }
              ]
            }
          }
        });
      }
    }

    const loggedUser = role === 'admin' ? demoAdmin : demoCustomer;
    const token = jwt.sign({ id: loggedUser.id, role: loggedUser.role, email: loggedUser.email }, JWT_SECRET, { expiresIn: '7d' });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = loggedUser;
    res.json({ token, user: userWithoutPassword });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already taken" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "customer"
      }
    });

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ token, user: userWithoutPassword });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      include: {
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
