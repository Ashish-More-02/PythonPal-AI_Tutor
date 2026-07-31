
### 1. Component Hierarchy & Data Flow

```mermaid
graph TD
    subgraph PythonTutor Component ["PythonTutor.jsx (Parent State Container)"]
        RawNodes["rawNodes State <br/><i>(Flat Array from MongoDB)</i>"]
        UseMemo["useMemo(buildFileTree)"]
        TreeNodes["treeNodes <br/><i>(Nested Tree Structure)</i>"]
        
        RawNodes --> UseMemo
        UseMemo --> TreeNodes
    end

    subgraph FileTree Component ["FileTree.jsx (Explorer Sidebar)"]
        FolderState["expandedFolders State <br/><i>{ folderId: true/false }</i>"]
        RecursiveRender["renderTreeNodes(treeNodes) <br/><i>(Recursive Function)</i>"]
        ContextMenu["CustomContextMenu.jsx <br/><i>(Right-Click Menu)</i>"]
        
        FolderState --> RecursiveRender
    end

    subgraph Editor Component ["CodeEditor.jsx"]
        Monaco["Monaco Editor <br/><i>(Displays Active File Content)</i>"]
    end

    TreeNodes -- Passed as prop: tree --> RecursiveRender
    RecursiveRender -- Right Click --> ContextMenu
    RecursiveRender -- File Selected --> PythonTutor
    PythonTutor -- activeFile content --> Monaco
```

---

### 2. Step-by-Step Flow: From Database to Screen

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Backend as Backend / MongoDB
    participant PythonTutor as PythonTutor.jsx
    participant TreeBuilder as treeBuilder.js
    participant FileTree as FileTree.jsx
    participant CodeEditor as CodeEditor.jsx

    User->>PythonTutor: Loads Page
    PythonTutor->>Backend: GET /api/ide/workspace (fetchWorkspace)
    Backend-->>PythonTutor: Returns flat list of rawNodes
    
    PythonTutor->>TreeBuilder: buildFileTree(rawNodes)
    Note over TreeBuilder: Groups items by parentId<br/>and nests them into children arrays
    TreeBuilder-->>PythonTutor: Returns nested treeNodes array
    
    PythonTutor->>FileTree: Pass tree={treeNodes}
    Note over FileTree: renderTreeNodes() maps root nodes.<br/>If node is expanded folder, recursively<br/>calls renderTreeNodes(node.children)
    FileTree-->>User: Renders File Explorer Tree in Sidebar

    User->>FileTree: Clicks on "main.py"
    FileTree->>PythonTutor: onSelectFile(fileNode)
    PythonTutor->>PythonTutor: setActiveFile(fileNode) & setValue(fileNode.content)
    PythonTutor->>CodeEditor: Pass value to Monaco Editor
    CodeEditor-->>User: Displays code content in Editor
```

---

### Summary of Component Responsibilities

1. **PythonTutor.jsx (Central Coordinator):**
   * Fetches raw flat array data from backend (`rawNodes`).
   * Uses `buildFileTree` wrapped in `useMemo` to construct `treeNodes`.
   * Manages active file state (`activeFile`) and code editor state (`value`).

2. **treeBuilder.js (Helper Utility):**
   * Pure function that maps flat database entries into nested tree nodes with `children: [...]`.
   * Sorts items (folders first, then files alphabetically).

3. **`FileTree.jsx` (Interactive Tree View):**
   * Receives `tree` (`treeNodes`).
   * Manages local UI states like `expandedFolders` (which folders are open/closed) and `contextMenu`.
   * Uses `renderTreeNodes` recursively to display nested items.

4. **`CodeEditor.jsx` (Editor Display):**
   * Renders the active file's source code in the Monaco Editor.