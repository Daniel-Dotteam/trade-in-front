import {
  Page,
  Card,
  FormLayout,
  TextField,
  Button,
  Text,
  Layout,
  Select,
} from "@shopify/polaris";
import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useSubmit, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import { deleteProduct } from "app/db/endpoints/product";
import prisma from "app/db.server";

type LoaderData = {
  productType: {
    id: string;
    name: string;
    products: Array<{
      id: string;
      name: string;
      price: number;
      type: 'FOR_SALE' | 'FOR_TRADE';
    }>;
  };
  collectionId: string | null;
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    await authenticate.admin(request);
    
    const url = new URL(request.url);
    const collectionId = url.searchParams.get('collectionId');
    
    console.log('Fetching product type:', params.id);
    
    const productType = await prisma.productType.findUnique({
      where: { id: params.id },
      include: { products: true }
    });

    if (!productType) {
      console.log('Product Type not found:', params.id);
      throw new Response("Product Type not found", { status: 404 });
    }

    console.log('Found product type:', productType);
    return json({ productType, collectionId });
  } catch (error) {
    console.error('Loader error:', error);
    throw new Response(
      JSON.stringify({ error: 'Failed to load product type' }), 
      { status: 500 }
    );
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  await authenticate.admin(request);
  
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "delete") {
    const productId = formData.get("productId") as string;
    try {
      const response = await deleteProduct(productId);
      if (!response.ok) {
        const error = await response.json();
        return json({ error: error.error }, { status: response.status });
      }
      return json({ success: true });
    } catch (error) {
      if (error instanceof Response) {
        const errorData = await error.json();
        return json({ error: errorData.error }, { status: error.status });
      }
      return json({ error: "An unexpected error occurred" }, { status: 500 });
    }
  }

  // Create product
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const type = formData.get("type") as "FOR_SALE" | "FOR_TRADE";

  return await prisma.product.create({
    data: {
      name,
      price,
      type,
      productTypeId: params.id as string
    }
  });
}

export default function ProductTypeDetail() {
  const { productType, collectionId } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("FOR_SALE");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("type", type);
    submit(formData, { method: "POST" });
    setName("");
    setPrice("");
    setType("FOR_SALE");
  };

  const handleDelete = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const formData = new FormData();
      formData.append("actionType", "delete");
      formData.append("productId", productId);
      submit(formData, { method: "POST", replace: true });
    }
  };

  return (
    <Page
      title={`Produsul: ${productType.name}`}
      backAction={{ content: "Înapoi", url: `/app/collection/${collectionId}` }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <form onSubmit={handleSubmit}>
              <FormLayout>
                <TextField
                  label="Numele modelului"
                  value={name}
                  onChange={setName}
                  autoComplete="off"
                />
                <TextField
                  label="Prețul"
                  value={price}
                  onChange={setPrice}
                  type="number"
                  autoComplete="off"
                />
                <Select
                  label="Tipul de vânzare"
                  options={[
                    {label: 'Pentru vânzare', value: 'FOR_SALE'},
                    {label: 'Pentru trade', value: 'FOR_TRADE'}
                  ]}
                  value={type}
                  onChange={setType}
                />
                <Button submit>Adaugă modelul</Button>
              </FormLayout>
            </form>
          </Card>
        </Layout.Section>

        <Layout.Section>
          {productType.products.map(product => (
            <Card key={product.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Text variant="headingMd" as="h2">{product.name}</Text>
                  <Text variant="bodyMd" as="p" >
                    {product.type === 'FOR_SALE' ? `${product.price.toFixed(2)} lei` : 'For Trade'}
                  </Text>
                </div>
                <Button 
                  onClick={() => handleDelete(product.id)}
                >
                  Șterge
                </Button>
              </div>
            </Card>
          ))}
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <Page>
        <Card>
          <Text variant="headingMd" as="h2">Error {error.status}</Text>
          <Text as="p">{error.data}</Text>
          <Button url="/app">Return to Home</Button>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <Card>
        <Text variant="headingMd" as="h2">Error</Text>
        <Text as="p">An unexpected error occurred.</Text>
        <Button url="/app">Return to Home</Button>
      </Card>
    </Page>
  );
}
