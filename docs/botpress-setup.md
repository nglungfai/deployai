# Botpress scheduling agent

The home page's booking section (`#book`) is designed to host DeployAI's own Botpress appointment setter.

## Connect the live bot

1. In Botpress, open the bot and go to **Webchat → Deploy Settings**.
2. Under **Chat interface**, choose **Embedded** and set the **Element ID** to `bp-embedded-webchat`. Save.
3. Copy the bot's config **script URL**.
4. In `index.html`, near the bottom, paste it into:

   ```html
   window.DEPLOYAI_BOTPRESS = { configUrl: "PASTE_URL_HERE" };
   ```

5. Commit to `main`.

When `configUrl` is set, `deployai.js` loads Botpress Webchat v3.3, opens it inside the booking section, and hides the built-in preview, the CRM record panel and the floating "Talk to our agent" button.

Use `assets/deployai-icon-512.png` as the bot avatar.

## Recommended flow (mirrors the built-in preview)

1. Ask what the visitor wants to automate first (website inquiries, phone calls, back-office workflows).
2. Ask the business type.
3. Ask weekly inquiry or call volume.
4. Only after qualifying, offer open 15-minute consultation slots.
5. Collect an email for the calendar invite.
6. Book into Google Calendar and create or update the HubSpot contact.

## Without Botpress

If `configUrl` is empty or Botpress fails to load, the built-in preview runs. It states that it sends nothing.
