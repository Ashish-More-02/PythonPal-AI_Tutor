const express = require('express');
const router = express.Router();
const ideController = require('../controllers/IdeController');
const { checkJWTtoken } = require('../middleware/CommonMiddleware');

router.use(checkJWTtoken);

// Get whole directory structure
router.get('/workspace', ideController.getWorkspaceTree);

// Create new file/folder
router.post('/nodes', ideController.createNode);

// Save code changes inside a file
router.put('/files/:id/save', ideController.saveFileContent);

// Rename/Move a file or folder
router.put('/nodes/:id/move', ideController.updateNodeStructure);

// Delete file or folder
router.delete('/nodes/:id', ideController.deleteNode);

module.exports = router;
