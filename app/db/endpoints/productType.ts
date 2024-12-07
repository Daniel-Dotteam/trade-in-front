import prisma from "app/db.server";

// Create a new product type
export async function createProductType(data: { name: string, collectionId: string }) {
  try {
    const productType = await prisma.productType.create({
      data,
      include: {
        collection: true,
      },
    });
    return new Response(JSON.stringify(productType), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to create product type:", error);
    throw new Response(JSON.stringify({ error: "Failed to create product type" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Get all product types
export async function getProductTypes() {
  try {
    const productTypes = await prisma.productType.findMany({
      include: {
        collection: true,
        products: true,
      },
    });
    return new Response(JSON.stringify(productTypes), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch product types:", error);
    throw new Response(JSON.stringify({ error: "Failed to fetch product types" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Get product types by collection
export async function getProductTypesByCollection(collectionId: string) {
  try {
    const productTypes = await prisma.productType.findMany({
      where: {
        collectionId,
      },
      include: {
        products: true,
      },
    });
    return new Response(JSON.stringify(productTypes), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch product types:", error);
    throw new Response(JSON.stringify({ error: "Failed to fetch product types" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Update a product type
export async function updateProductType(id: string, data: { name?: string, collectionId?: string }) {
  try {
    const productType = await prisma.productType.update({
      where: { id },
      data,
      include: {
        collection: true,
      },
    });
    return new Response(JSON.stringify(productType), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to update product type:", error);
    throw new Response(JSON.stringify({ error: "Failed to update product type" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Delete a product type
export async function deleteProductType(id: string) {
  try {
    await prisma.productType.delete({
      where: { id },
    });
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to delete product type:", error);
    throw new Response(JSON.stringify({ error: "Failed to delete product type" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 