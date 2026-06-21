import prisma from "./prisma.js";

async function diag() {
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

    console.log("=== ALL CATEGORIES IN DB ===");
    categories.forEach(cat => {
      console.log(`Category: ${cat.name} (ID: ${cat.id}) with ${cat.items.length} items`);
      cat.items.forEach(item => {
        console.log(`  - Item: ${item.name} (ID: ${item.id}) with ${item.units.length} available units`);
      });
    });

  } catch (err: any) {
    console.error("Diagnostic error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

diag();
