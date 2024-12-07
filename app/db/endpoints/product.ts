import prisma from "app/db.server";
import { ProductSaleType } from "@prisma/client";

// Create a new product
export async function createProduct(data: { 
  name: string, 
  price: number, 
  productTypeId: string, 
  type: ProductSaleType 
}) {
  try {
    const product = await prisma.product.create({
      data,
      include: {
        productType: {
          include: {
            collection: true
          }
        }
      }
    });
    return new Response(JSON.stringify(product), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to create product:", error);
    throw new Response(JSON.stringify({ error: "Failed to create product" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Get all products
export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        productType: {
          include: {
            collection: true
          }
        }
      },
    });
    return new Response(JSON.stringify(products), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw new Response(JSON.stringify({ error: "Failed to fetch products" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Get a single product by ID
export async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        productType: {
          include: {
            collection: true
          }
        }
      },
    });

    if (!product) {
      throw new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(product), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    
    console.error("Failed to fetch product:", error);
    throw new Response(JSON.stringify({ error: "Failed to fetch product" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Update a product
export async function updateProduct(id: string, data: { 
  name?: string, 
  price?: number, 
  productTypeId?: string,
  type?: ProductSaleType 
}) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        productType: {
          include: {
            collection: true
          }
        }
      }
    });
    return new Response(JSON.stringify(product), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to update product:", error);
    throw new Response(JSON.stringify({ error: "Failed to update product" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Delete a product
export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ success: true, message: "Product deleted successfully" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to delete product:", error);
    throw new Response(JSON.stringify({ error: "Failed to delete product" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
