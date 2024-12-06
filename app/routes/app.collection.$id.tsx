import {
  Page,
  Card,
  FormLayout,
  TextField,
  Button,
  Text,
  Layout,
  ResourceList,
  ResourceItem,
  Box,
  BlockStack,
  Select,
} from "@shopify/polaris";
import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { ProductType } from "@prisma/client";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import prisma from "app/db.server";
import { deleteProduct } from "app/db/endpoints/product";

type LoaderData = {
  collection: {
    id: string;
    name: string;
    products: {
      id: string;
      name: string;
      price: number;
      type: ProductType;
    }[];
  };
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  
  const collection = await prisma.collection.findUnique({
    where: { id: params.id },
    include: {
      products: true,
    },
  });

  if (!collection) {
    throw new Response("Collection not found", { status: 404 });
  }

  return json({ collection });
}

export async function action({ request, params }: ActionFunctionArgs) {
  await authenticate.admin(request);
  
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const productId = formData.get("productId") as string;

  if (actionType === "delete") {
    await deleteProduct(productId);
  } else {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const type = formData.get("type") as ProductType;

    await prisma.product.create({
      data: {
        name,
        price,
        type,
        collectionId: params.id as string,
      },
    });
  }

  return json({ success: true });
}

export default function CollectionDetail() {
  const { collection } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState<ProductType>("FOR_SALE");

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
    const formData = new FormData();
    formData.append("actionType", "delete");
    formData.append("productId", productId);
    submit(formData, { method: "POST" });
  };

  return (
    <Page
      title={`Collection: ${collection.name}`}
      backAction={{ content: "Back", url: "/app" }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Card>
              <form onSubmit={handleSubmit}>
                <FormLayout>
                  <TextField
                    label="Product Name"
                    value={name}
                    onChange={setName}
                    autoComplete="off"
                  />
                  <TextField
                    label="Price"
                    value={price}
                    onChange={setPrice}
                    type="number"
                    autoComplete="off"
                  />
                  <Select
                    label="Type"
                    value={type}
                    onChange={(value) => setType(value as ProductType)}
                    options={[
                      { label: "For Sale", value: "FOR_SALE" },
                      { label: "For Trade", value: "FOR_TRADE" },
                    ]}
                  />
                  <Button submit >Add Product</Button>
                </FormLayout>
              </form>
            </Card>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Card>
              <Text variant="headingMd" as="h2">
                Products
              </Text>
              <div style={{ marginTop: "1rem" }}>
                <ResourceList
                  items={collection.products}
                  renderItem={(product) => (
                    <ResourceItem
                      id={product.id}
                      onClick={() => {}}
                    >
                      <BlockStack>
                        <Box>
                          <Text as="h3" variant="bodyMd" fontWeight="bold">{product.name}</Text>
                        </Box>
                        <Box>
                          <Text as="p" variant="bodyMd">${product.price}</Text>
                        </Box>
                        <Box>
                          <Text as="p" variant="bodyMd">{product.type}</Text>
                        </Box>
                        <Button onClick={() => handleDelete(product.id)}>Delete</Button>
                      </BlockStack>
                    </ResourceItem>
                  )}
                />
              </div>
            </Card>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
  