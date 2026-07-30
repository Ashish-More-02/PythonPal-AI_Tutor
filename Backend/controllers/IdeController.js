const IDENode = require('../models/IDE_Nodes');

// Helper to deduce language based on file extension for Monaco
const getLanguageFromExtension = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    js: 'javascript', ts: 'typescript', py: 'python', 
    html: 'html', css: 'css', json: 'json', md: 'markdown'
  };
  return map[ext] || 'plaintext';
};

// 1. Fetch the entire file tree structure
exports.getWorkspaceTree = async (req, res) => {
  const userId = req.user.userId;
  try {
    // Fetch all nodes to let the frontend build the nested visual tree
    const nodes = await IDENode.find({userId:userId}).sort({ type: 1, name: 1 }); // Folders first, then alphabetically
    return res.status(200).json({ success: true, data: nodes });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Create a new file or folder
exports.createNode = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, path, type, parentId } = req.body;

    const nodeData = {
      userId,
      name,
      path,
      type,
      parentId: parentId || null
    };

    if (type === 'file') {
      nodeData.content = '';
      nodeData.language = getLanguageFromExtension(name);
    }

    const newNode = await IDENode.create(nodeData);
    return res.status(201).json({ success: true, data: newNode });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'A file or folder already exists at this path.' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Save file content (Triggered by Monaco save action)
exports.saveFileContent = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { content } = req.body;

    // used $set for partial updates or targetted updates
    const updatedFile = await IDENode.findOneAndUpdate(
      { _id: id, type: 'file', userId },
      { $set: { content } },
      { new: true }
    );

    if (!updatedFile) {
      return res.status(404).json({ success: false, error: 'File not found.' });
    }

    return res.status(200).json({ success: true, data: updatedFile });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 4. Rename or Move a file/folder (Updates children paths recursively)
exports.updateNodeStructure = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, newPath } = req.body;

    const originalNode = await IDENode.findOne({_id:id, userId:userId});
    if (!originalNode) {
      return res.status(404).json({ success: false, error: 'Node not found.' });
    }

    const oldPath = originalNode.path;

    // Update target item metadata
    originalNode.name = name || originalNode.name;
    originalNode.path = newPath;
    await originalNode.save();

    // If it's a folder, cascadingly update all children starting with oldPath prefix
    if (originalNode.type === 'folder') {
      const children = await IDENode.find({ userId, path: new RegExp(`^${oldPath}/`) });
      
      const bulkOps = children.map(child => {
        const updatedChildPath = child.path.replace(oldPath, newPath);
        return {
          updateOne: {
            filter: { _id: child._id ,userId},
            update: { $set: { path: updatedChildPath } }
          }
        };
      });

      if (bulkOps.length > 0) {
        await IDENode.bulkWrite(bulkOps);
      }
    }

    return res.status(200).json({ success: true, message: 'Structure updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 5. Delete a file or folder (Deletes all nested children)
exports.deleteNode = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const targetNode = await IDENode.findOne({_id:id, userId});

    if (!targetNode) {
      return res.status(404).json({ success: false, error: 'Node not found.' });
    }

    if (targetNode.type === 'file') {
      await IDENode.deleteOne({_id:id, userId});
    } else {
      // Delete the folder and all children whose paths match its subpath
      await IDENode.deleteMany({
        userId,
        $or: [
          { _id: id },
          { path: new RegExp(`^${targetNode.path}/`) }
        ]
      });
    }

    return res.status(200).json({ success: true, message: 'Deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
