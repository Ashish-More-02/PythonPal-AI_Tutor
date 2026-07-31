This is a Mermaid diagram explaining how the code context feature works end-to-end:

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Editor as Monaco Editor / Active File
    participant UI as PythonTutor Component (UI)
    participant Express as Express Backend (/ai/chat)
    participant Groq as Groq AI API

    Note over User, Editor: Student edits code or switches active file
    Editor->>UI: Active file & content updated in state
    UI->>UI: Auto-captures active file context chip (`fileName`, `content`)

    alt Student clicks X
        User->>UI: Clicks 'X' on context chip
        UI->>UI: Removes context chip from input box
    else Student keeps context
        User->>UI: Types query & presses Enter
        UI->>Express: POST /ai/chat { messages, codeContext: { fileName, content } }
    end

    Note over Express: GroqAIController & AI-chat-utils
    Express->>Express: Format `codeContext` into system prompt message
    Express->>Groq: groq.chat.completions.create(model, messages, stream=true)
    
    loop Streaming Response
        Groq-->>Express: Stream chunk delta text
        Express-->>UI: Chunk text via res.write()
        UI-->>User: Render live markdown response via Streamdown
    end
```

### Flow Breakdown:
1. **Auto-Capture**: `PythonTutor` automatically tracks the active file and its code in state to render the context chip above the prompt textarea.
2. **User Interaction**: The student can remove the context chip using the `X` button or re-add/refresh it using the `+ Context` button.
3. **Payload Delivery**: When submitting a message, the active `codeContext` payload `{ fileName, content }` is sent along with the chat messages to `POST /ai/chat`.
4. **Backend Processing**: `GroqAIController` passes `codeContext` to `buildContext()`, which wraps the file content in a formatted system prompt block for Groq AI.
5. **Streaming Output**: Groq streams back the response informed by the student's active code context, rendered in real time by Streamdown.