# How the Learn Controller Works

This document explains `Backend/controllers/LearnController.js` in simple, plain terms. 

This controller manages PythonPal's guided learning track (lessons and projects). It handles fetching the curriculum, creating files in the learner's browser IDE, checking their code with AI, and saving progress.

---

## The 5 Functions at a Glance

1. **`getCurriculum`** — Loads all lessons/projects and shows the student's progress bars on the dashboard.
2. **`openItem`** — Prepares a lesson/project when clicked (creates the file in the IDE and tracks start time).
3. **`ensureItemFile`** — A safety helper that creates the folder and Python file without overwriting the student's existing code.
4. **`checkStep`** — Sends student code and output to the AI tutor (Codey) via Groq to see if they completed the exercise step.
5. **`completeItem`** — One-click completion for reading-only slide decks (like "Why Python?").

---

## 1. `getCurriculum(req, res)`

**Endpoint:** `GET /api/learn`  
**Purpose:** Powers the Learn dashboard.

### How it works:
1. **Finds user progress:** Looks up all progress entries in the `LearnProgress` collection in MongoDB for the logged-in user.
2. **Creates a lookup map:** Turns that list into a simple object keyed by ID so it doesn't have to scan the database repeatedly.
3. **Merges with curriculum files:** Goes through every lesson from `lessons.js` and every project from `projects.js`:
   - Calculates total steps required (`totalSteps`).
   - Counts how many of those steps the user has finished (`completedSteps`).
   - Checks if the user has opened it before (`started: true/false`).
   - Records when they last opened it (`lastOpenedAt`).
4. **Sends back summary:** Returns clean lists of `lessons` and `projects` ready for the frontend to render progress bars and "Continue" badges.

### Database Query & Data Example

#### Query
```javascript
const progressRows = await LearnProgress.find({ userId });
```
- **Collection:** `learnprogresses`
- **Filter:** `{ userId: ObjectId("65f1a2b3c4d5e6f7a8b9c0d1") }`

#### Data Returned by Query (`progressRows`)
Returns a flat array of all progress records belonging to this user:
```json
[
  {
    "_id": "67cb1234abcd000100000001",
    "userId": "65f1a2b3c4d5e6f7a8b9c0d1",
    "itemId": "why-python",
    "completedSteps": ["read"],
    "createdAt": "2026-10-01T09:00:00.000Z",
    "updatedAt": "2026-10-01T09:05:00.000Z",
    "__v": 0
  },
  {
    "_id": "67cb1234abcd000100000002",
    "userId": "65f1a2b3c4d5e6f7a8b9c0d1",
    "itemId": "print-variables",
    "completedSteps": ["step-1"],
    "createdAt": "2026-10-02T10:15:00.000Z",
    "updatedAt": "2026-10-02T10:30:00.000Z",
    "__v": 0
  }
]
```

#### Intermediate Transformation (`progressById`)
The array is converted into an in-memory dictionary lookup map:
```javascript
const progressById = Object.fromEntries(progressRows.map((p) => [p.itemId, p]));
```
Data looks like:
```json
{
  "why-python": {
    "_id": "67cb1234abcd000100000001",
    "userId": "65f1a2b3c4d5e6f7a8b9c0d1",
    "itemId": "why-python",
    "completedSteps": ["read"],
    "updatedAt": "2026-10-01T09:05:00.000Z"
  },
  "print-variables": {
    "_id": "67cb1234abcd000100000002",
    "userId": "65f1a2b3c4d5e6f7a8b9c0d1",
    "itemId": "print-variables",
    "completedSteps": ["step-1"],
    "updatedAt": "2026-10-02T10:30:00.000Z"
  }
}
```

#### Final API Response
```json
{
  "success": true,
  "lessons": [
    {
      "id": "why-python",
      "title": "Why Python?",
      "description": "Meet Python, see why it rules the world, and say hi to Codey.",
      "format": "slides",
      "totalSteps": 1,
      "completedSteps": 1,
      "started": true,
      "lastOpenedAt": "2026-10-01T09:05:00.000Z"
    },
    {
      "id": "print-variables",
      "title": "Printing & Variables",
      "description": "Teach Python to talk, do math, and remember things with variables.",
      "format": "exercises",
      "totalSteps": 3,
      "completedSteps": 1,
      "started": true,
      "lastOpenedAt": "2026-10-02T10:30:00.000Z"
    },
    {
      "id": "strings-numbers",
      "title": "Strings & Numbers",
      "description": "Learn to manipulate text and work with integers and floats.",
      "format": "exercises",
      "totalSteps": 3,
      "completedSteps": 0,
      "started": false,
      "lastOpenedAt": null
    }
  ],
  "projects": [
    {
      "id": "mad-libs",
      "title": "Mad Libs Generator",
      "description": "Build a funny story generator with user inputs.",
      "format": "exercises",
      "totalSteps": 4,
      "completedSteps": 0,
      "started": false,
      "lastOpenedAt": null
    }
  ]
}
```

---

## 2. `openItem(req, res)`

**Endpoint:** `POST /api/learn/:itemId/open`  
**Purpose:** Prepares everything when a student clicks on a lesson or project card to start learning.

### How it works:
1. **Validates the item:** Searches `lessons` and `projects` using `getItem(itemId)`. If the ID doesn't exist, returns 404.
2. **Sets up their file:**
   - If the lesson is just slides (e.g. `why-python`), no code file is needed (`file = null`).
   - If it's a coding lesson or project, it calls `ensureItemFile` to make sure the student has a `.py` file ready in their IDE.
3. **Touches progress:** Finds or creates a `LearnProgress` record in MongoDB. Even if the user already started, this operation touches `updatedAt`, which powers the "recently worked on" sorting.
4. **Sends back sanitized data:** Returns the student's progress, the file object, and the lesson data sanitized via `toPublicItem()` (so secret AI grading goals are stripped out).

### Database Query & Data Example

#### Query
```javascript
const progress = await LearnProgress.findOneAndUpdate(
  { userId, itemId: item.id },
  { $setOnInsert: { completedSteps: [] } },
  { upsert: true, new: true }
);
```
- **Collection:** `learnprogresses`
- **Filter:** `{ userId: ObjectId("65f1a2b3c4d5e6f7a8b9c0d1"), itemId: "print-variables" }`
- **Update Operators:**
  - `$setOnInsert: { completedSteps: [] }` sets the empty step list only on initial creation.
  - `{ upsert: true, new: true }` creates the document if missing and returns the updated document.
  - Automatically updates `updatedAt` timestamp on every call.

#### Data Returned by Query (`progress`)
**Case 1: First time opening the lesson**
```json
{
  "_id": "67cb1234abcd000100000002",
  "userId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "itemId": "print-variables",
  "completedSteps": [],
  "createdAt": "2026-10-06T12:00:00.000Z",
  "updatedAt": "2026-10-06T12:00:00.000Z",
  "__v": 0
}
```

**Case 2: Re-opening an in-progress lesson**
Existing completed steps are retained, and `updatedAt` is bumped:
```json
{
  "_id": "67cb1234abcd000100000002",
  "userId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "itemId": "print-variables",
  "completedSteps": ["step-1"],
  "createdAt": "2026-10-02T10:14:00.000Z",
  "updatedAt": "2026-10-06T12:05:00.000Z",
  "__v": 0
}
```

#### Final API Response
```json
{
  "success": true,
  "item": {
    "id": "print-variables",
    "kind": "lesson",
    "title": "Printing & Variables",
    "description": "Teach Python to talk, do math, and remember things with variables.",
    "format": "exercises",
    "lessonNumber": 1,
    "next": { "id": "strings-numbers", "title": "Strings & Numbers" },
    "steps": [
      {
        "id": "step-1",
        "title": "Say hello to the world",
        "task": "Print 'Hello, world!' to the screen.",
        "hint": "Use the print() function with quotation marks."
      },
      {
        "id": "step-2",
        "title": "Create a variable",
        "task": "Create a variable named 'score' and set it to 10.",
        "hint": "Write: score = 10"
      }
    ]
  },
  "completedSteps": ["step-1"],
  "file": {
    "_id": "67cb1234abcd000200000020",
    "userId": "65f1a2b3c4d5e6f7a8b9c0d1",
    "name": "print-variables.py",
    "path": "/lessons/print-variables.py",
    "type": "file",
    "parentId": "67cb1234abcd000200000010",
    "content": "# Step 1: Print your name!\nprint('Hello Codey!')\n",
    "language": "python",
    "createdAt": "2026-10-02T10:14:00.000Z",
    "updatedAt": "2026-10-02T10:14:00.000Z",
    "__v": 0
  }
}
```

---

## 3. `ensureItemFile(userId, item, kind)`

**Helper function** (used internally by `openItem`)  
**Purpose:** Creates the folder and scratch Python file in the student's virtual IDE file tree (stored in MongoDB under `IDENode`).

### How it works:
1. **Finds or creates the parent folder:**
   - Looks for `/lessons` or `/projects` for this user.
   - If it doesn't exist yet, it creates it using `upsert: true`.
   - **Safety check:** If the student previously created a regular *file* named `lessons` or `projects` in Free Practice, it returns an error asking them to rename it so a folder can be created.
2. **Finds or creates the Python file (`/lessons/<id>.py`):**
   - Uses MongoDB's `$setOnInsert` operator.
   - **Why this matters:** `$setOnInsert` injects `starterCode` **only when creating the file for the very first time**. If the student opens the lesson tomorrow, it finds the existing file and leaves their written code untouched.
3. **Returns the file node:** Returns the file data so the frontend editor can open it immediately.

### Database Query & Data Example

This helper runs **two consecutive queries** against the `IDENode` collection:

#### Query 1: Ensure Parent Folder Exists
```javascript
const folder = await IDENode.findOneAndUpdate(
  { userId, path: `/${folderName}` },
  { $setOnInsert: { name: folderName, type: "folder", parentId: null } },
  { upsert: true, new: true }
);
```
- **Collection:** `idenodes`
- **Filter:** `{ userId: ObjectId("65f1a2b3c4d5e6f7a8b9c0d1"), path: "/lessons" }`
- **Data Returned (`folder`):**
```json
{
  "_id": "67cb1234abcd000200000010",
  "userId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "name": "lessons",
  "path": "/lessons",
  "type": "folder",
  "parentId": null,
  "content": "",
  "language": "plaintext",
  "createdAt": "2026-10-02T10:14:00.000Z",
  "updatedAt": "2026-10-02T10:14:00.000Z",
  "__v": 0
}
```

#### Query 2: Ensure Python File Exists
```javascript
const file = await IDENode.findOneAndUpdate(
  { userId, path: `/${folderName}/${fileName}` },
  {
    $setOnInsert: {
      name: fileName,
      type: "file",
      parentId: folder._id,
      content: item.starterCode,
      language: "python",
    },
  },
  { upsert: true, new: true }
);
```
- **Collection:** `idenodes`
- **Filter:** `{ userId: ObjectId("65f1a2b3c4d5e6f7a8b9c0d1"), path: "/lessons/print-variables.py" }`

**Data Returned (`file`) on First Open:**
`$setOnInsert` populates the default `starterCode` from the curriculum:
```json
{
  "_id": "67cb1234abcd000200000020",
  "userId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "name": "print-variables.py",
  "path": "/lessons/print-variables.py",
  "type": "file",
  "parentId": "67cb1234abcd000200000010",
  "content": "# Write your code below\nprint(\"Hello!\")\n",
  "language": "python",
  "createdAt": "2026-10-02T10:14:00.000Z",
  "updatedAt": "2026-10-02T10:14:00.000Z",
  "__v": 0
}
```

**Data Returned (`file`) on Subsequent Opens:**
The document matches, so `$setOnInsert` is skipped. The student's modified code is returned intact:
```json
{
  "_id": "67cb1234abcd000200000020",
  "userId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "name": "print-variables.py",
  "path": "/lessons/print-variables.py",
  "type": "file",
  "parentId": "67cb1234abcd000200000010",
  "content": "# Write your code below\nname = 'Codey'\nprint('Hello', name)\n",
  "language": "python",
  "createdAt": "2026-10-02T10:14:00.000Z",
  "updatedAt": "2026-10-02T10:25:00.000Z",
  "__v": 0
}
```

---

## 4. `checkStep(req, res)`

**Endpoint:** `POST /api/learn/:itemId/steps/:stepId/check`  
**Body:** `{ code: string, output?: string }`  
**Purpose:** Uses AI (Codey) to evaluate if the student's code fulfills the step's requirements.

### How it works:
1. **Validates step and input:**
   - Finds the step in the curriculum. The `task` and `goal` are retrieved directly from the server's files, never trusted from the client request.
   - Rejects empty code or code exceeding 20,000 characters.
   - Caps terminal output to 5,000 characters so runaway loops don't burn AI tokens.
2. **Calls Groq AI (`openai/gpt-oss-120b`):**
   - Sends the system prompt (`reviewPrompt_txt`) and instructions:
     - What the student was asked to do (`step.task`).
     - What the secret passing criteria is (`step.goal`).
     - The student's code and terminal output.
   - Requests structured JSON: `{ passed: boolean, feedback: string, hint?: string }`.
3. **Evaluates result:**
   - Strictly verifies `review.passed === true` (a string `"true"` or `"false"` won't accidentally pass).
4. **Saves progress on pass:**
   - If passed, updates MongoDB using `$addToSet: { completedSteps: stepId }` (adds the step ID without duplicating it if clicked twice).
5. **Returns response:** Returns `passed`, encouraging `feedback`, a friendly `hint` (if failed), and the updated `completedSteps` list.

### Database Query & Data Example

The query executed depends on whether the AI marked `review.passed === true`:

#### Branch A: The student PASSED (`passed === true`)
```javascript
const progress = await LearnProgress.findOneAndUpdate(
  { userId, itemId },
  { $addToSet: { completedSteps: stepId } },
  { upsert: true, new: true }
);
```
- **Collection:** `learnprogresses`
- **Filter:** `{ userId: ObjectId("65f1a2b3c4d5e6f7a8b9c0d1"), itemId: "print-variables" }`
- **Update Operator:** `$addToSet: { completedSteps: "step-2" }`
  - Adds `"step-2"` into the array if it isn't there already. If already present, it avoids duplicate entries.

**Data Returned by Query (`progress`):**
```json
{
  "_id": "67cb1234abcd000100000002",
  "userId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "itemId": "print-variables",
  "completedSteps": ["step-1", "step-2"],
  "createdAt": "2026-10-02T10:14:00.000Z",
  "updatedAt": "2026-10-06T12:15:30.000Z",
  "__v": 0
}
```

**Final API Response:**
```json
{
  "success": true,
  "passed": true,
  "feedback": "Great job! You created the variable and printed it out.",
  "hint": "",
  "completedSteps": ["step-1", "step-2"]
}
```

#### Branch B: The student did NOT pass (`passed === false`)
```javascript
const progress = await LearnProgress.findOne({ userId, itemId });
```
- **Collection:** `learnprogresses`
- **Filter:** `{ userId: ObjectId("65f1a2b3c4d5e6f7a8b9c0d1"), itemId: "print-variables" }`
- **Behavior:** Read-only lookup. Does **not** modify `completedSteps`.

**Data Returned by Query (`progress`):**
```json
{
  "_id": "67cb1234abcd000100000002",
  "userId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "itemId": "print-variables",
  "completedSteps": ["step-1"],
  "createdAt": "2026-10-02T10:14:00.000Z",
  "updatedAt": "2026-10-02T10:14:00.000Z",
  "__v": 0
}
```

**Final API Response:**
```json
{
  "success": true,
  "passed": false,
  "feedback": "Almost there! Make sure to set score equal to 10.",
  "hint": "Try writing `score = 10` on a new line.",
  "completedSteps": ["step-1"]
}
```

---

## 5. `completeItem(req, res)`

**Endpoint:** `POST /api/learn/:itemId/complete`  
**Purpose:** Marks reading-only slide lessons as complete.

### How it works:
1. **Validates item & format:**
   - Looks up the item. If not found, returns 404.
   - Checks `isSlides(item)`. If someone tries to call this on an exercise lesson (trying to bypass the AI code checker), it rejects the request with a 400 error.
2. **Marks complete:**
   - Slides have no code steps, so it marks the dummy step `READ_STEP_ID` (`"read"`) as completed in `LearnProgress` using `$addToSet`.
3. **Returns updated progress:** Returns `{ success: true, completedSteps: progress.completedSteps }`.

### Database Query & Data Example

#### Query
```javascript
const progress = await LearnProgress.findOneAndUpdate(
  { userId, itemId: found.item.id },
  { $addToSet: { completedSteps: READ_STEP_ID } },
  { upsert: true, new: true }
);
```
- **Collection:** `learnprogresses`
- **Filter:** `{ userId: ObjectId("65f1a2b3c4d5e6f7a8b9c0d1"), itemId: "why-python" }`
- **Update Operator:** `$addToSet: { completedSteps: "read" }`
  - Adds `"read"` to the array if missing. If the learner re-clicks "Complete", it won't duplicate the entry.

#### Data Returned by Query (`progress`)
```json
{
  "_id": "67cb1234abcd000100000001",
  "userId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "itemId": "why-python",
  "completedSteps": ["read"],
  "createdAt": "2026-10-01T09:00:00.000Z",
  "updatedAt": "2026-10-06T12:20:00.000Z",
  "__v": 0
}
```

#### Final API Response
```json
{
  "success": true,
  "completedSteps": ["read"]
}
```

