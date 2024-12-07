import prisma from "app/db.server";
import { OrderStatus } from "@prisma/client";

// Get all orders
export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        saleProduct: {
          include: {
            productType: {
              include: {
                collection: true
              }
            }
          }
        },
        tradeProduct: {
          include: {
            productType: {
              include: {
                collection: true
              }
            }
          }
        }
      }
    });
    return new Response(JSON.stringify(orders), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw new Response(JSON.stringify({ error: "Failed to fetch orders" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Create a new order
export async function createOrder(data: {
  customerName: string;
  customerPhone: string;
  saleProductId?: string;
  tradeProductId?: string;
  status?: OrderStatus;
}) {
  try {
    const order = await prisma.order.create({
      data,
      include: {
        saleProduct: {
          include: {
            productType: {
              include: {
                collection: true
              }
            }
          }
        },
        tradeProduct: {
          include: {
            productType: {
              include: {
                collection: true
              }
            }
          }
        }
      }
    });
    return new Response(JSON.stringify(order), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to create order:", error);
    throw new Response(JSON.stringify({ error: "Failed to create order" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Get order by ID
export async function getOrder(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        saleProduct: {
          include: {
            productType: {
              include: {
                collection: true
              }
            }
          }
        },
        tradeProduct: {
          include: {
            productType: {
              include: {
                collection: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      throw new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(order), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Response) throw error;

    console.error("Failed to fetch order:", error);
    throw new Response(JSON.stringify({ error: "Failed to fetch order" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Update an order
export async function updateOrder(id: string, data: {
  customerName?: string;
  customerPhone?: string;
  saleProductId?: string;
  tradeProductId?: string;
  status?: OrderStatus;
}) {
  try {
    const order = await prisma.order.update({
      where: { id },
      data,
      include: {
        saleProduct: {
          include: {
            productType: {
              include: {
                collection: true
              }
            }
          }
        },
        tradeProduct: {
          include: {
            productType: {
              include: {
                collection: true
              }
            }
          }
        }
      }
    });
    return new Response(JSON.stringify(order), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to update order:", error);
    throw new Response(JSON.stringify({ error: "Failed to update order" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Delete order (only when explicitly requested)
export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Response) throw error;

    console.error("Failed to delete order:", error);
    throw new Response(JSON.stringify({ error: "Failed to delete order" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Update order status
export async function updateOrderStatus(id: string, status: OrderStatus) {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        saleProduct: {
          include: {
            productType: {
              include: {
                collection: true
              }
            }
          }
        },
        tradeProduct: {
          include: {
            productType: {
              include: {
                collection: true
              }
            }
          }
        }
      }
    });
    return new Response(JSON.stringify(order), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw new Response(JSON.stringify({ error: "Failed to update order status" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
