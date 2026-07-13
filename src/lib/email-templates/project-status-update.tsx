import * as React from "react";
import { Body, Button, Container, Heading, Html, Preview, Text } from "@react-email/components";
import { brand, styles } from "./_brand";
import { BrandHead } from "./_head";
import type { TemplateEntry } from "./registry";

interface Props {
  name?: string;
  status?: string;
  projectUrl?: string;
  note?: string;
}

const ProjectStatusEmail = ({ name, status, projectUrl, note }: Props) => (
  <Html lang="en" dir="ltr">
    <BrandHead />
    <Preview>Update on your project</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.brand}>{brand.siteName}</Text>
        <Heading style={styles.h1}>Project update{name ? `, ${name}` : ""}</Heading>
        <Text style={styles.text}>
          Your project moved to <strong>{status ?? "a new stage"}</strong>.
        </Text>
        {note && <Text style={styles.textInk}>{note}</Text>}
        {projectUrl && (
          <Button style={styles.button} href={projectUrl}>
            View project
          </Button>
        )}
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: ProjectStatusEmail,
  subject: (d) => `Project update: ${d.status ?? "new stage"}`,
  displayName: "Project status update",
  previewData: { name: "Alex", status: "In implementation", projectUrl: "https://filro.site/dashboard" },
} satisfies TemplateEntry;

export default ProjectStatusEmail;
