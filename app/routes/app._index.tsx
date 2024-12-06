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
import { getCollections, createCollection } from "app/db/prisma.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  return getCollections();
}

export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  const formData = await request.formData();
  const name = formData.get("name") as string;
  return createCollection(name);
}

type Collection = {
  id: string;
  name: string;
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

  return (
    <Page>
      <Card>
        <FormLayout>
          <form onSubmit={handleSubmit}>
            <FormLayout>
              <TextField
                label="Collection Name"
                value={name}
                onChange={setName}
                autoComplete="off"
              />
              <Button submit>Create Collection</Button>
            </FormLayout>
          </form>
        </FormLayout>
      </Card>

      <Card>
        <Text variant="headingMd" as="h2">
          Collections
        </Text>
        <div style={{ marginTop: "1rem" }}>
          {collections?.map((collection: Collection) => (
            <Link key={collection.id} to={`/app/collection/${collection.id}`} style={{ textDecoration: 'none' }}>
              <Card >
                <Text as="h3" variant="bodyMd">
                  {collection.name}
                </Text>
              </Card>
            </Link>
          ))}
        </div>
      </Card>
    </Page>
  );
}
