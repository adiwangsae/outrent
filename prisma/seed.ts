import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const custPassword = await bcrypt.hash('cust123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@outrent.com' },
    update: { isDemo: true },
    create: {
      email: 'admin@outrent.com',
      name: 'Admin Utama',
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      isDemo: true
    }
  });

  const cust = await prisma.user.upsert({
    where: { email: 'budi@example.com' },
    update: { isDemo: true },
    create: {
      email: 'budi@example.com',
      name: 'Budi Santoso',
      password: custPassword,
      role: 'customer',
      isVerified: true,
      isDemo: true
    }
  });

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
  const itemCount = await prisma.inventoryItem.count();
  if (itemCount > 5) {
    console.log('Database already seeded with enough items, skipping items creation.');
    return;
  }

  const createItem = async (categoryId: string, name: string, description: string, pricePerDay: number, icon: string, prefixes: string[]) => {
    const existing = await prisma.inventoryItem.findFirst({ where: { name } });
    if (existing) return existing;

    return await prisma.inventoryItem.create({
      data: {
        categoryId,
        name,
        description,
        pricePerDay,
        icon,
        units: {
          create: prefixes.map(prefix => ({ unitCode: prefix }))
        }
      }
    });
  };

  await createItem(catTenda.id, 'Tenda Eiger 4P', 'Tenda dome double layer', 65000, 'Tent', ['TEN-EIG-4P-001', 'TEN-EIG-4P-002', 'TEN-EIG-4P-003']);
  await createItem(catTas.id, 'Carrier Consina 60L', 'Tas carrier 60 liter dengan raincover', 40000, 'Backpack', ['BAG-CON-60-001', 'BAG-CON-60-002']);
  await createItem(catTenda.id, 'Tenda Great Outdoor 2P', 'Tenda dome ringan kapasitas 2 orang', 45000, 'Tent', ['TEN-GO-2P-001', 'TEN-GO-2P-002']);
  await createItem(catMasak.id, 'Nesting Set Bulat', 'Satu set alat masak nesting aluminium', 15000, 'Flame', ['MSK-NST-001', 'MSK-NST-002', 'MSK-NST-003', 'MSK-NST-004']);
  await createItem(catMasak.id, 'Kompor Lipat Kotak', 'Kompor gas mini lipat untuk camping', 12000, 'Flame', ['MSK-KMP-001', 'MSK-KMP-002', 'MSK-KMP-003']);
  await createItem(catLampu.id, 'Headlamp Energizer', 'Headlamp terang dengan mode merah', 10000, 'Flashlight', ['LMP-HDL-001', 'LMP-HDL-002']);
  await createItem(catTidur.id, 'Sleeping Bag Polar', 'SB hangat bahan inner polar tebal', 18000, 'Package', ['TDR-SB-001', 'TDR-SB-002', 'TDR-SB-003']);
  await createItem(catTidur.id, 'Matras Foil', 'Matras alumunium foil tahan dingin', 6000, 'Package', ['TDR-MTR-001', 'TDR-MTR-002', 'TDR-MTR-003']);

  console.log('Seed completed', { admin, cust });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
