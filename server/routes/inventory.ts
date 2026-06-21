import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        items: {
          include: {
            units: {
              where: { status: "available" }
            }
          }
        }
      }
    });

    // Flatten logic for simple client access
    const products = categories.flatMap(c => 
      c.items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: c.name,
        price_per_day: item.pricePerDay,
        icon_name: item.icon,
        available_stock: item.units.length,
        total_stock: item.units.length // simplified
      }))
    );
    
    res.json({ products });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: req.params.id },
      include: { category: true, units: true }
    });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
