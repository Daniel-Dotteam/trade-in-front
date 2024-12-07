import {
  Page,
  Card,
  FormLayout,
  TextField,
  Button,
  Text,
} from "@shopify/polaris";
import { useLoaderData, useSubmit, Link } from "@remix-run/react";
import { useState } from "react";
import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getCollections, createCollection, deleteCollection } from "app/db/prisma.server";
import { ProductSaleType } from "@prisma/client";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return getCollections();
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  const formData = await request.formData();
  
  if (request.method === "DELETE") {
    const collectionId = formData.get("collectionId") as string;
    return deleteCollection(collectionId);
  }
  
  const name = formData.get("name") as string;
  const productSaleTypes = [ProductSaleType.FOR_SALE, ProductSaleType.FOR_TRADE];
  return createCollection(name, productSaleTypes);
}

type Collection = {
  id: string;
  name: string;
  productTypes: Array<{
    id: string;
    name: string;
    products: Array<{
      id: string;
      name: string;
      price: number;
      type: ProductSaleType;
    }>;
  }>;
};

export default function Index() {
  const collections = useLoaderData<Collection[]>();
  const submit = useSubmit();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    submit(formData, { method: "POST" });
    setName(""); // Clear input after submission
  };

  const handleDelete = (collectionId: string) => {
    if (confirm("Sigur doriți să ștergeți această categorie? Toate produsele asociate vor fi șterse.")) {
      const formData = new FormData();
      formData.append("collectionId", collectionId);
      submit(formData, { method: "DELETE" });
    }
  };

  return (
    <Page>
      <Card>
        <FormLayout>
          <form onSubmit={handleSubmit}>
            <FormLayout>
              <TextField
                label="Denumirea Categoriei"
                value={name}
                onChange={setName}
                autoComplete="off"
              />
              <Button submit>Crează Categoria</Button>
            </FormLayout>
          </form>
        </FormLayout>
      </Card>

      <Card>
        <Text variant="headingMd" as="h2">
          Categorii
        </Text>
        <div style={{ marginTop: "1rem", gap: "1rem", display: "flex", flexDirection: "column" }}>
          {collections?.map((collection: Collection) => (
            <Card key={collection.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Link to={`/app/collection/${collection.id}`} style={{ textDecoration: 'none' }}>
                  <Text as="h3" variant="bodyMd">
                    {collection.name}
                  </Text>
                </Link>
                <Button  onClick={() => handleDelete(collection.id)}>
                  Șterge
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </Page>
  );
}
