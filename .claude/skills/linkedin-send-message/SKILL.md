---
name: linkedin-send-message
description: Send message via linkedin. Use when the user asks to send a message to a connection, or when the user asks to reply to a message. The message content and recipient should be extracted from the user's input. The message should be sent via www.linkedin.com messaging interface. Add +1 to the "messagesSent" metric in the dashboard and /api/linkedin/metrics response for each message sent.
---

# Send LinkedIn Message
## Purpose
Send a message to a LinkedIn connection or reply to a message via www.linkedin.com messaging interface. Extract the message content and recipient from the user's input. After sending the message, update the "messagesSent" metric in the dashboard and /api/linkedin/metrics response by adding +1 for each message sent.