// this function converts flat array into nested array
export function buildFileTree(nodes = []) {
  if (!Array.isArray(nodes)) return [];

  const nodeMap = {}; // normal js object
  const rootNodes = [];

  // Step 1: Initialize all items into an easily searchable map
  nodes.forEach(node => {
    nodeMap[node._id] = { ...node, children: [] };
  });

  // prints a deep snapshot , which shows that childern are not mapped to parents right now
  console.log(JSON.parse(JSON.stringify(nodeMap)));

  // Step 2: Wire parents and children together
  nodes.forEach(node => {
    const mappedNode = nodeMap[node._id];
    if (node.parentId) {
      const parent = nodeMap[node.parentId];
      if (parent) {
        parent.children.push(mappedNode);
      } else {
        // Fallback to root if parent isn't found
        rootNodes.push(mappedNode);
      }
    } else {
      rootNodes.push(mappedNode);
    }
  });

  // Recursive sort function: folders first, then files, sorted alphabetically by name
  const sortTreeNodes = (items) => {
    items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return (a.name || '').localeCompare(b.name || '');
    });
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        sortTreeNodes(item.children);
      }
    });
  };

  sortTreeNodes(rootNodes);

  return rootNodes;
}


// example output of rootNodes -> Nested array of objects.


// [
//     {
//         "_id": "6a6a1e672e7735e982d5444a",
//         "userId": "6a6314f175ebf44c2bfdfa64",
//         "name": "src",
//         "path": "/src",
//         "type": "folder",
//         "parentId": null,
//         "content": "",
//         "language": "plaintext",
//         "createdAt": "2026-07-29T15:38:15.063Z",
//         "updatedAt": "2026-07-29T15:38:15.063Z",
//         "__v": 0,
//         "children": [
//             {
//                 "_id": "6a6a1ef72e7735e982d54450",
//                 "userId": "6a6314f175ebf44c2bfdfa64",
//                 "name": "sample.py",
//                 "path": "/src/sample.py",
//                 "type": "file",
//                 "parentId": "6a6a1e672e7735e982d5444a",
//                 "content": "hello.py ",
//                 "language": "python",
//                 "createdAt": "2026-07-29T15:40:39.192Z",
//                 "updatedAt": "2026-07-30T14:00:36.257Z",
//                 "__v": 0,
//                 "children": []
//             }
//         ]
//     },
//     {
//         "_id": "6a6a1d57d353d01513ca0c00",
//         "userId": "6a6314f175ebf44c2bfdfa64",
//         "name": "main.py",
//         "path": "/main.py",
//         "type": "file",
//         "parentId": null,
//         "content": "print(\"hello world this is my code\")!",
//         "language": "python",
//         "createdAt": "2026-07-29T15:33:43.896Z",
//         "updatedAt": "2026-07-30T15:30:53.128Z",
//         "__v": 0,
//         "children": []
//     }
// ]
