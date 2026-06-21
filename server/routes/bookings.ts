import { Router } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.js";
import prisma from "../prisma.js";

const router = Router();

router.post("/", authenticate, async (req: AuthRequest, res) => {
  const { startDate, endDate, items } = req.body; 
  // items: array of { productId, qty }
  
  if (!startDate || !endDate || !items || !items.length) {
    return res.status(400).json({ error: "Invalid booking data" });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ error: "Invalid dates provided." });
  }

  const todayObj = new Date();
  todayObj.setHours(0, 0, 0, 0);

  const pickupDateObj = new Date(start);
  pickupDateObj.setHours(0, 0, 0, 0);

  const diffTime = pickupDateObj.getTime() - todayObj.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

  if (diffDays < 2) {
    return res.status(400).json({ error: "Pemesanan harus dilakukan minimal 2 hari sebelum tanggal pengambilan." });
  }

  if (end <= start) {
    return res.status(400).json({ error: "Tanggal kembali harus lebih besar dari tanggal pengambilan." });
  }

  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
    if (!user) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan." });
    }
    const isDemo = user.isDemo === true;
    const isVerified = user.isVerified === true;

    if (!isDemo && !isVerified) {
      return res.status(403).json({ error: "Upload identitas terlebih dahulu sebelum melakukan penyewaan." });
    }

    const bookingNumber = "ORD-" + Date.now();
    let totalPrice = 0;
    const reservedUnits = [];

    // Validasi stok & booking items
    for (const item of items) {
      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: { id: item.productId },
        include: { units: { where: { status: "available" } } }
      });

      if (!inventoryItem) throw new Error("Item " + item.productId + " tidak ditemukan");
      if (inventoryItem.units.length < item.qty) throw new Error("Stok tidak cukup untuk " + inventoryItem.name);

      const selectedUnits = inventoryItem.units.slice(0, item.qty);
      reservedUnits.push(...selectedUnits.map(u => ({ unitId: u.id, pricePerDay: inventoryItem.pricePerDay })));
      totalPrice += inventoryItem.pricePerDay * item.qty * totalDays;
    }

    // Buat booking
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          bookingNumber,
          userId: user.id,
          startDate: start,
          endDate: end,
          totalDays,
          totalPrice,
          status: "waiting_payment", // skipped verification since user is verified
          items: {
            create: reservedUnits.map(ru => ({
              unitId: ru.unitId,
              pricePerDay: ru.pricePerDay
            }))
          }
        }
      });

      // Update unit status
      for (const ru of reservedUnits) {
        await tx.inventoryUnit.update({
          where: { id: ru.unitId },
          data: { status: "booked" } // "booked" or "reserved"
        });
      }

      return newBooking;
    });

    res.json({ bookingId: booking.id, bookingNumber: booking.bookingNumber, totalPrice });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/:id/cancel", authenticate, async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const booking = await prisma.booking.findFirst({
      where: { id, userId: req.user?.id },
      include: { items: true }
    });

    if (!booking) {
      return res.status(404).json({ error: "Pesanan tidak ditemukan" });
    }

    if (booking.status !== "waiting_payment" && booking.status !== "pending") {
      return res.status(400).json({ error: "Hanya pesanan pending yang bisa dibatalkan." });
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: { status: "cancelled" }
      });

      // Release the units back to available status
      for (const item of booking.items) {
        await tx.inventoryUnit.update({
          where: { id: item.unitId },
          data: { status: "available" }
        });
      }

      await tx.notification.create({
        data: {
          userId: req.user!.id,
          title: "Pesanan Dibatalkan",
          message: `Pesanan ${booking.bookingNumber} berhasil dibatalkan oleh Anda.`,
          type: "warning"
        }
      });
    });

    res.json({ success: true, message: "Pemesanan berhasil dibatalkan" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my-bookings", authenticate, async (req: AuthRequest, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user?.id },
      include: {
        items: {
          include: {
            unit: {
              include: { inventoryItem: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    // Transform to match old API for smooth testing
    const mapped = bookings.map(b => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      start_date: b.startDate,
      end_date: b.endDate,
      total_price: b.totalPrice,
      status: b.status,
      created_at: b.createdAt
    }));
    res.json({ bookings: mapped });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
