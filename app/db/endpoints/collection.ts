import { json } from "@remix-run/node";
import prisma from "app/db.server";

// Get all collections
export async function getCollections() {
  try {
    const collections = await prisma.collection.findMany({
      include: { products: true },
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
export async function createCollection(name: string) {
  try {
    const collection = await prisma.collection.create({
      data: { name },
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

// Delete a collection
export async function deleteCollection(id: string) {
  try {
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!collection) {
      throw new Response(JSON.stringify({ error: "Collection not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (collection.products.length > 0) {
      throw new Response(JSON.stringify({ error: "Cannot delete collection with existing products" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await prisma.collection.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ success: true, message: "Collection deleted successfully" }), {
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

// Update a collection
export async function updateCollection(id: string, name: string) {
  try {
    const collection = await prisma.collection.update({
      where: { id },
      data: { name },
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
