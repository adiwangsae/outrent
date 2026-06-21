import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seedOnStartup(prisma: PrismaClient) {
  console.log("[StartupSeeder] Checking database initialization...");
  try {
    // 1. Create or ensure Categories exist
    const createOrGetCategory = async (name: string) => {
      let cat = await prisma.category.findFirst({ where: { name } });
      if (!cat) cat = await prisma.category.create({ data: { name } });
      return cat;
    };

    const catTenda = await createOrGetCategory('Tenda');
    const catTas = await createOrGetCategory('Tas & Carrier');
    const catMasak = await createOrGetCategory('Alat Masak & Makan');
    const catTidur = await createOrGetCategory('Peralatan Tidur');
    const catLampu = await createOrGetCategory('Penerangan');

    // 2. Ensure each individual item exists in the database.
    // This handles cases where only some items were created (e.g. only 2 items from partial seed or resets)
    console.log("[StartupSeeder] Validating catalog items list...");

    const createItemIfMissing = async (
      categoryId: string, 
      name: string, 
      description: string, 
      pricePerDay: number, 
      icon: string, 
      unitsData: { code: string; condition?: string }[]
    ) => {
      const existing = await prisma.inventoryItem.findFirst({ where: { name } });
      if (existing) {
        // Also check if units exist. In case they exist but have no units, we can create units.
        const existingUnits = await prisma.inventoryUnit.count({
          where: { inventoryItemId: existing.id }
        });
        if (existingUnits === 0) {
          console.log(`[StartupSeeder] Found item '${name}' but it has no units. Seeding units...`);
          for (const u of unitsData) {
            const unitExist = await prisma.inventoryUnit.findUnique({ where: { unitCode: u.code } });
            if (!unitExist) {
              await prisma.inventoryUnit.create({
                data: {
                  inventoryItemId: existing.id,
                  unitCode: u.code,
                  condition: u.condition || 'Optimal'
                }
              });
            }
          }
        }
        return existing;
      }

      console.log(`[StartupSeeder] Seeding missing catalog item: ${name}`);
      return await prisma.inventoryItem.create({
        data: {
          categoryId,
          name,
          description,
          pricePerDay,
          icon,
          units: {
            create: unitsData.map(u => ({ 
              unitCode: u.code, 
              condition: u.condition || 'Optimal' 
            }))
          }
        }
      });
    };

    // Tenda Eiger 4P: Rp 65.000 / day
    await createItemIfMissing(catTenda.id, 'Tenda Eiger 4P', 'Tenda dome double layer yang andal untuk segala cuaca.', 65000, 'Tent', [
      { code: 'TEN-EIG-4P-001', condition: 'Optimal' },
      { code: 'TEN-EIG-4P-002', condition: 'Optimal' },
      { code: 'TEN-EIG-4P-003', condition: 'Optimal' }
    ]);

    // Carrier Consina 60L: Rp 40.000 / day
    await createItemIfMissing(catTas.id, 'Carrier Consina 60L', 'Tas carrier 60 liter dengan raincover dan ergonomi prima.', 40000, 'Backpack', [
      { code: 'BAG-CON-60-001', condition: 'Optimal' },
      { code: 'BAG-CON-60-002', condition: 'Optimal' }
    ]);

    // Tenda Great Outdoor 2P: Rp 45.000 / day
    await createItemIfMissing(catTenda.id, 'Tenda Great Outdoor 2P', 'Tenda dome ringan kapasitas 2 orang.', 45000, 'Tent', [
      { code: 'TEN-GO-2P-001', condition: 'Prima - Steril Siap Pakai' },
      { code: 'TEN-GO-2P-002', condition: 'Optimal' }
    ]);

    // Nesting Set Bulat: Rp 15.000 / day
    await createItemIfMissing(catMasak.id, 'Nesting Set Bulat', 'Satu set alat masak nesting aluminium.', 15000, 'Flame', [
      { code: 'MSK-NST-001', condition: 'Optimal' },
      { code: 'MSK-NST-002', condition: 'Optimal' },
      { code: 'MSK-NST-003', condition: 'Optimal' },
      { code: 'MSK-NST-004', condition: 'Optimal' }
    ]);

    // Kompor Lipat Kotak: Rp 12.000 / day
    await createItemIfMissing(catMasak.id, 'Kompor Lipat Kotak', 'Kompor gas mini lipat untuk camping.', 12000, 'Flame', [
      { code: 'MSK-KMP-001', condition: 'Optimal' },
      { code: 'MSK-KMP-002', condition: 'Optimal' },
      { code: 'MSK-KMP-003', condition: 'Optimal' }
    ]);

    // Headlamp Energizer: Rp 10.000 / day
    await createItemIfMissing(catLampu.id, 'Headlamp Energizer', 'Headlamp terang dengan mode merah.', 10000, 'Flashlight', [
      { code: 'LMP-HDL-001', condition: 'Optimal' },
      { code: 'LMP-HDL-002', condition: 'Prima - Steril Siap Pakai' }
    ]);

    // Sleeping Bag Polar: Rp 18.000 / day
    await createItemIfMissing(catTidur.id, 'Sleeping Bag Polar', 'SB hangat bahan inner polar tebal.', 18000, 'Package', [
      { code: 'TDR-SB-001', condition: 'Optimal' },
      { code: 'TDR-SB-002', condition: 'Optimal' },
      { code: 'TDR-SB-003', condition: 'Optimal' }
    ]);

    // Matras Foil: Rp 6.000 / day
    await createItemIfMissing(catTidur.id, 'Matras Foil', 'Matras alumunium foil tahan dingin.', 6000, 'Package', [
      { code: 'TDR-MTR-001', condition: 'Optimal' },
      { code: 'TDR-MTR-002', condition: 'Optimal' },
      { code: 'TDR-MTR-003', condition: 'Optimal' }
    ]);

    console.log("[StartupSeeder] Catalog items successfully validated and fully seeded!");

    // 3. Ensure Default Users exist
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    if (adminCount === 0) {
      console.log("[StartupSeeder] No admin users found. Seeding default users...");
      const ownerPassword = await bcrypt.hash('owner123', 10);
      const adminPassword = await bcrypt.hash('admin123', 10);
      const custPassword = await bcrypt.hash('pelanggan123', 10);
      const demoCustPassword = await bcrypt.hash('demo123', 10);

      await prisma.user.create({
        data: {
          email: 'owner@outrent.com',
          name: 'Pemilik Usaha (Owner)',
          password: ownerPassword,
          role: 'admin',
          isVerified: true,
          isDemo: false
        }
      });

      await prisma.user.create({
        data: {
          email: 'admin@outrent.com',
          name: 'Admin Utama',
          password: adminPassword,
          role: 'admin',
          isVerified: true,
          isDemo: true
        }
      });

      await prisma.user.create({
        data: {
          email: 'pelanggan@outrent.com',
          name: 'Rian Maulana (Pelanggan)',
          password: custPassword,
          role: 'customer',
          isVerified: true,
          isDemo: false,
          phone: '081122334455',
          address: 'Mataram, Lombok'
        }
      });

      const demoCust = await prisma.user.create({
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

      console.log("[StartupSeeder] Default users successfully seeded!");

      // 4. Create initial demo bookings if there are none
      const bookingCount = await prisma.booking.count();
      if (bookingCount === 0) {
        console.log("[StartupSeeder] No bookings found. Creating initial active demo bookings...");
        const itemTendaObj = await prisma.inventoryItem.findFirst({ where: { name: 'Tenda Eiger 4P' } });
        const itemTasObj = await prisma.inventoryItem.findFirst({ where: { name: 'Carrier Consina 60L' } });

        if (itemTendaObj && itemTasObj) {
          const tendaUnits = await prisma.inventoryUnit.findMany({ where: { inventoryItemId: itemTendaObj.id } });
          const tasUnits = await prisma.inventoryUnit.findMany({ where: { inventoryItemId: itemTasObj.id } });

          // ORD-DEMO-001: Completed
          if (tendaUnits[0] && tasUnits[0]) {
            await prisma.booking.create({
              data: {
                bookingNumber: 'ORD-DEMO-001',
                userId: demoCust.id,
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

          // ORD-DEMO-002: Ongoing
          if (tendaUnits[1]) {
            await prisma.booking.create({
              data: {
                bookingNumber: 'ORD-DEMO-002',
                userId: demoCust.id,
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

          // ORD-DEMO-003: Ready Pickup
          if (tendaUnits[2] && tasUnits[1]) {
            await prisma.booking.create({
              data: {
                bookingNumber: 'ORD-DEMO-003',
                userId: demoCust.id,
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
        }
        console.log("[StartupSeeder] Default bookings successfully seeded!");
      }
    }
  } catch (err: any) {
    console.error("[StartupSeeder] Error during startup seeding:", err);
  }
}
