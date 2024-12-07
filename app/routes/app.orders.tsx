import {
  Page,
  Card,
  DataTable,
  Link,
  Badge,
  Text,
  EmptyState,
  Button,
  Modal,
  ButtonGroup,
} from "@shopify/polaris";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getOrders, deleteOrder, updateOrderStatus } from "../db/prisma.server";
import { ProductSaleType, OrderStatus } from "@prisma/client";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return getOrders();
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  const formData = await request.formData();
  const orderId = formData.get("orderId") as string;
  
  if (request.method === "DELETE") {
    return deleteOrder(orderId);
  }
  
  if (request.method === "PATCH") {
    const status = formData.get("status") as OrderStatus;
    return updateOrderStatus(orderId, status);
  }
}

type Order = {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  saleProduct?: {
    name: string;
    price: number;
    type: ProductSaleType;
    productType: {
      name: string;
      collection: {
        name: string;
      };
    };
  };
  tradeProduct?: {
    name: string;
    productType: {
      name: string;
      collection: {
        name: string;
      };
    };
  };
};

export default function Orders() {
  const orders = useLoaderData<Order[]>();
  const submit = useSubmit();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    if (!selectedOrder) return;
    const formData = new FormData();
    formData.append("orderId", selectedOrder.id);
    submit(formData, { method: "DELETE" });
    setShowDeleteModal(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("status", status);
    submit(formData, { method: "PATCH" });
  };

  const getStatusBadge = (status: OrderStatus) => {
    const toneMap = {
      PENDING: 'warning',
      COMPLETED: 'success',
      CANCELLED: 'critical'
    } as const;

    const labelMap = {
      PENDING: 'În așteptare',
      COMPLETED: 'Finalizat',
      CANCELLED: 'Anulat'
    };

    return <Badge tone={toneMap[status]}>{labelMap[status]}</Badge>;
  };

  const rows = orders.map((order) => [
    order.customerName,
    order.customerPhone,
    new Date(order.date).toLocaleDateString('ro-RO'),
    order.saleProduct?.name || '-',
    order.tradeProduct?.name || '-',
    getStatusBadge(order.status),
    <ButtonGroup>
      {order.status === 'PENDING' && (
        <>
          <Button
            size="slim"
            tone="success"
            onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
          >
            Finalizează
          </Button>
          <Button
            size="slim"
            tone="critical"
            onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
          >
            Anulează
          </Button>
        </>
      )}
      <Button
        size="slim"
        tone="critical"
        onClick={() => {
          setSelectedOrder(order);
          setShowDeleteModal(true);
        }}
      >
        Șterge
      </Button>
    </ButtonGroup>
  ]);

  if (!orders?.length) {
    return (
      <Page>
        <Card>
          <EmptyState
            heading="Nu există comenzi"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>Nu au fost găsite comenzi în sistem.</p>
          </EmptyState>
        </Card>
      </Page>
    );
  }

  return (
    <Page title="Comenzi">
      <Card>
        <DataTable
          columnContentTypes={[
            'text',
            'text',
            'text',
            'text',
            'text',
            'text',
            'text'
          ]}
          headings={[
            'Nume Client',
            'Telefon',
            'Data',
            'Produs Vânzare',
            'Produs Trade-in',
            'Status',
            'Acțiuni'
          ]}
          rows={rows}
        />
      </Card>

      <Modal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedOrder(null);
        }}
        title="Confirmare ștergere"
        primaryAction={{
          content: 'Șterge',
          destructive: true,
          onAction: handleDelete,
        }}
        secondaryActions={[
          {
            content: 'Anulează',
            onAction: () => {
              setShowDeleteModal(false);
              setSelectedOrder(null);
            },
          },
        ]}
      >
        <Modal.Section>
          <Text as="h2">
            Sigur doriți să ștergeți comanda pentru {selectedOrder?.customerName}?
            Această acțiune nu poate fi anulată.
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
