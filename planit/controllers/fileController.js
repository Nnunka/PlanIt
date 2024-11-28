const db = require("../config/db");
const path = require("path");
const fs = require("fs");

// Fetch files for a task
exports.getFilesForTask = (req, res) => {
  const taskId = req.params.taskId;

  const query = "SELECT file_id, file_path FROM files WHERE file_task_id = ?";
  db.query(query, [taskId], (err, results) => {
    if (err) {
      console.error("Error fetching files:", err);
      return res.status(500).json({ error: "Server error" });
    }

    // Remove date prefix for display purposes
    const files = results.map((file) => {
      const originalName = file.file_path.split("-").slice(1).join("-");
      return {
        file_id: file.file_id,
        file_name: originalName, // Display original name
        file_path: file.file_path,
      };
    });

    res.status(200).json({ files });
  });
};

// Upload a file
exports.uploadFile = (req, res) => {
  const taskId = req.params.taskId;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = `/uploads/${req.file.filename}`;

  const query = "INSERT INTO files (file_task_id, file_path) VALUES (?, ?)";
  db.query(query, [taskId, filePath], (err, result) => {
    if (err) {
      console.error("Error saving file to database:", err);
      return res.status(500).json({ error: "Server error" });
    }

    const originalName = req.file.filename.split("-").slice(1).join("-"); // Remove date prefix
    res.status(200).json({
      success: true,
      file: { id: result.insertId, fileName: originalName, filePath },
    });
  });
};

// Delete a file
exports.deleteFile = (req, res) => {
  const fileId = req.params.fileId;

  const query = "DELETE FROM files WHERE file_id = ?";
  db.query(query, [fileId], (err, result) => {
    if (err) {
      console.error("Error deleting file:", err);
      return res.status(500).json({ error: "Server error" });
    }
    res.status(200).json({ success: true });
  });
};

exports.downloadFile = (req, res) => {
  const fileId = req.params.fileId;

  // Fetch the file path from the database
  const query = "SELECT file_path FROM files WHERE file_id = ?";
  db.query(query, [fileId], (err, results) => {
    if (err) {
      console.error("Error fetching file:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    const filePath = `public${results[0].file_path}`; // Get the full path to the file
    const originalName = results[0].file_path.split("-").slice(1).join("-"); // Extract original name

    // Send the file for download
    res.download(filePath, originalName, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error downloading file");
      }
    });
  });
};
