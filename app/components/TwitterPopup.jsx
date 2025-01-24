import React, { useState } from "react";
import { Modal, TextField, Button } from "@shopify/polaris";

export default function TwitterPopup({ active, onClose, onSubmit }) {
  const [twitterUrl, setTwitterUrl] = useState("");

  return (
    <Modal
      open={active}
      onClose={onClose}
      title="Enter your Twitter profile"
      primaryAction={{
        content: "Get Recommendations",
        onAction: () => onSubmit(twitterUrl),
      }}
    >
      <Modal.Section>
        <TextField
          label="Twitter Profile URL"
          value={twitterUrl}
          onChange={(newValue) => setTwitterUrl(newValue)}
          placeholder="https://twitter.com/your_handle"
        />
      </Modal.Section>
    </Modal>
  );
}
