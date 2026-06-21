import prisma from "./prisma.js";
import bcrypt from "bcryptjs";

export async function resetDemoDatabase() {
  console.log("[DbReseeder] Resetting demo database...");
  
  try {
    // 1. Ensure Categories exist
    let catTenda = await prisma.category.findFirst({ where: { name: 'Tenda' } });
    if (!catTenda) catTenda = await prisma.category.create({ data: { name: 'Tenda' } });
    
    let catTas = await prisma.category.findFirst({ where: { name: 'Tas & Carrier' } });
    if (!catTas) catTas = await prisma.category.create({ data: { name: 'Tas & Carrier' } });

    // 2. Ensure real persistent users exist (These are isDemo: false and will NOT be touched by reset)
    const realAdminPassword = await bcrypt.hash('owner123', 10);
    const realCustomerPassword = await bcrypt.hash('pelanggan123', 10);

    let realOwner = await prisma.user.findUnique({ where: { email: 'owner@outrent.com' } });
    if (!realOwner) {
      realOwner = await prisma.user.create({
        data: {
          email: 'owner@outrent.com',
          name: 'Pemilik Usaha (Owner)',
          password: realAdminPassword,
          role: 'admin',
          isVerified: true,
          isDemo: false
        }
      });
    }

    let realCustomer = await prisma.user.findUnique({ where: { email: 'pelanggan@outrent.com' } });
    if (!realCustomer) {
      realCustomer = await prisma.user.create({
        data: {
          email: 'pelanggan@outrent.com',
          name: 'Rian Maulana (Pelanggan)',
          password: realCustomerPassword,
          role: 'customer',
          isVerified: true,
          isDemo: false,
          phone: '081122334455',
          address: 'Mataram, Lombok'
        }
      });
    }

    // 3. Find/Manage Demo Users
    const demoUsers = await prisma.user.findMany({ where: { isDemo: true } });
    const demoUserIds = demoUsers.map(u => u.id);

    // If there's no demoCustomer yet, ensure it is created
    let demoCustomer = demoUsers.find(u => u.email === 'demo.customer@outrent.com');
    if (!demoCustomer) {
      const demoCustPassword = await bcrypt.hash('demo123', 10);
      demoCustomer = await prisma.user.create({
        data: {
          email: 'demo.customer@outrent.com',
          name: 'Pratama Adi (Customer Demo)',
          password: demoCustPassword,
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
      demoUserIds.push(demoCustomer.id);
    } else {
      await prisma.user.update({
        where: { id: demoCustomer.id },
        data: {
          isVerified: true,
          isDemo: true,
          identityUrl: 'demo_ktp.jpg',
          identityNumber: '5203001234560001',
          identityType: 'KTP'
        }
      });
    }

    // 4. Reset unit status of inventory units that are borrowed by DEMO bookings
    const demoOngoingBookings = await prisma.booking.findMany({
      where: { userId: { in: demoUserIds }, status: "ongoing" },
      include: { items: true }
    });
    const demoUnitIdsToReset = demoOngoingBookings.flatMap(b => b.items.map(bi => bi.unitId));
    if (demoUnitIdsToReset.length > 0) {
      await prisma.inventoryUnit.updateMany({
        where: { id: { in: demoUnitIdsToReset } },
        data: { status: "available" }
      });
    }

    // 5. Safely delete demo-only records
    await prisma.notification.deleteMany({
      where: { userId: { in: demoUserIds } }
    });
    await prisma.penalty.deleteMany({
      where: { booking: { userId: { in: demoUserIds } } }
    });
    await prisma.payment.deleteMany({
      where: { userId: { in: demoUserIds } }
    });
    await prisma.bookingItem.deleteMany({
      where: { booking: { userId: { in: demoUserIds } } }
    });
    await prisma.booking.deleteMany({
      where: { userId: { in: demoUserIds } }
    });
    await prisma.verification.deleteMany({
      where: { userId: { in: demoUserIds } }
    });

    // 6. Find units of items & recreate demo bookings
    const itemTenda = await prisma.inventoryItem.findFirst({ where: { name: 'Tenda Eiger 4P' } });
    const itemTas = await prisma.inventoryItem.findFirst({ where: { name: 'Carrier Consina 60L' } });

    if (itemTenda && itemTas) {
      const tendaUnits = await prisma.inventoryUnit.findMany({
        where: { inventoryItemId: itemTenda.id }
      });
      const tasUnits = await prisma.inventoryUnit.findMany({
        where: { inventoryItemId: itemTas.id }
      });

      // ORD-DEMO-001: Completed
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

      // ORD-DEMO-002: Ongoing (status borrowed)
      if (tendaUnits[1]) {
        await prisma.booking.create({
          data: {
            bookingNumber: 'ORD-DEMO-002',
            userId: demoCustomer.id,
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000 * 3),
            totalDays: 3,
            totalPrice: 65000 * 3,
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

      // ORD-DEMO-003: Waiting Verification
      if (tendaUnits[2] && tasUnits[1]) {
        await prisma.booking.create({
          data: {
            bookingNumber: 'ORD-DEMO-003',
            userId: demoCustomer.id,
            startDate: new Date(Date.now() + 86400000 * 2),
            endDate: new Date(Date.now() + 86400000 * 5),
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

      // ORD-DEMO-004: Ready pickup
      if (tendaUnits[3]) {
        await prisma.booking.create({
          data: {
            bookingNumber: 'ORD-DEMO-004',
            userId: demoCustomer.id,
            startDate: new Date(Date.now() + 86400000 * 4),
            endDate: new Date(Date.now() + 86400000 * 7),
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

    // Insert an initial notification as seed greeting
    await prisma.notification.create({
      data: {
        userId: demoCustomer.id,
        title: "Sistem Demo Direset",
        message: "Data simulasi demo berhasil dikembalikan ke sedia kala.",
        type: "info"
      }
    });

    console.log("[DbReseeder] Demo database reset completed successfully.");
    return true;
  } catch (error) {
    console.error("[DbReseeder] Error resetting database:", error);
    return false;
  }
}
