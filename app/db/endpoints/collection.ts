import prisma from "app/db.server";
import { ProductSaleType } from "@prisma/client";

// Get all collections
export async function getCollections() {
  try {
    const collections = await prisma.collection.findMany({
      include: { 
        productTypes: {
          include: {
            products: true
          }
        }
      },
    });
    return new Response(JSON.stringify(collections), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch collections:", error);
    throw new Response(JSON.stringify({ error: "Failed to fetch collections" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Create a new collection
export async function createCollection(name: string, productSaleTypes: ProductSaleType[] = []) {
  try {
    const collection = await prisma.collection.create({
      data: { 
        name,
        productSaleTypes
      },
      include: {
        productTypes: true
      }
    });
    return new Response(JSON.stringify(collection), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to create collection:", error);
    throw new Response(JSON.stringify({ error: "Failed to create collection" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Update a collection
export async function updateCollection(id: string, data: { 
  name?: string, 
  productSaleTypes?: ProductSaleType[] 
}) {
  try {
    const collection = await prisma.collection.update({
      where: { id },
      data,
      include: {
        productTypes: {
          include: {
            products: true
          }
        }
      }
    });
    return new Response(JSON.stringify(collection), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to update collection:", error);
    throw new Response(JSON.stringify({ error: "Failed to update collection" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Delete a collection
export async function deleteCollection(id: string) {
  try {
    await prisma.collection.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Response) throw error;

    console.error("Failed to delete collection:", error);
    throw new Response(JSON.stringify({ error: "Failed to delete collection" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
