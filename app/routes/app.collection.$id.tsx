import {
  Page,
  Card,
  FormLayout,
  TextField,
  Button,
  Text,
  Layout,
} from "@shopify/polaris";
import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import prisma from "app/db.server";
import { deleteProductType, createProductType } from "app/db/prisma.server";

type LoaderData = {
  collection: {
    id: string;
    name: string;
    productTypes: Array<{
      id: string;
      name: string;
      products: Array<{
        id: string;
        name: string;
        price: number;
      }>;
    }>;
  };
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  
  const collection = await prisma.collection.findUnique({
    where: { id: params.id },
    include: {
      productTypes: {
        include: {
          products: true
        }
      }
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

  if (actionType === "delete") {
    const productTypeId = formData.get("productTypeId") as string;
    return deleteProductType(productTypeId);
  }

  // Create product type
  const name = formData.get("name") as string;
  return createProductType({ 
    name, 
    collectionId: params.id as string 
  });
}

export default function CollectionDetail() {
  const { collection } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    submit(formData, { method: "POST" });
    setName("");
  };

  const handleDelete = (productTypeId: string) => {
    if (confirm("Are you sure you want to delete this product type? All associated products will be deleted.")) {
      const formData = new FormData();
      formData.append("actionType", "delete");
      formData.append("productTypeId", productTypeId);
      submit(formData, { method: "POST" });
    }
  };

  return (
    <Page
      title={`Categorie: ${collection.name}`}
      backAction={{ content: "Înapoi", url: "/app" }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <form onSubmit={handleSubmit}>
              <FormLayout>
                <TextField
                  label="Numele tipului de produs"
                  value={name}
                  onChange={setName}
                  autoComplete="off"
                />
                <Button submit>Adaugă tipul de produs</Button>
              </FormLayout>
            </form>
          </Card>
        </Layout.Section>

        <Layout.Section>
          {collection.productTypes.map(productType => (
            <Card key={productType.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Button
                    variant="plain"
                    url={`/app/product_type/${productType.id}?collectionId=${collection.id}`}
                    textAlign="left"
                  >
                    {productType.name}
                  </Button>
                  <Text variant="bodyMd" as="p" >
                    {productType.products.length} produse
                  </Text>
                </div>
                <Button 
                  onClick={() => handleDelete(productType.id)}
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
  