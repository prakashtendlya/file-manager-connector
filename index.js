



import express from 'express';  
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = path.join(__dirname, 'target');


const app = express();
const PORT = 3000;


app.use(express.json());



app.get('/', (req, res) => {
    res.send('File Manager API is alive!');
});


app.post('/files/:filename', (req, res) => {
    const filename = req.params.filename;
    const content = req.body.content || 'no content provided';

    if(!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
        console.log(`Created directory: ${targetDir}`);
    }

    const filePath = path.join(targetDir, filename);

    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).json({ error: 'Failed to write file' });
        }
        res.json({ message: `File '${filename}' created successfully` });
    });
});


app.get('/files', (req, res) => {
    fs.readdir(targetDir, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return res.status(500).json({ error: 'Failed to list files' });
        }
        res.json({ files });
    });
});

app.get('/files/:filename', (req, res) =>  {
    const filename = req.params.filename;
    const filePath = path.join(targetDir, filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found'});
    }

    fs.readFile(filePath, 'utf-8', (err, data) => {
        if(err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Failed to read file' });
        }
        res.json({ content: data });
    })
});


  app.put('/files/:filename', (req, res) => {
      const filename = req.params.filename;
      const filePath = path.join(targetDir, filename);
      const content = req.body.content || '';

      if (!fs.existsSync(filePath)) {
          return res.status(404).send('Cannot update: File not found');
      }

      fs.writeFile(filePath, content, (err) => {
          if (err) return res.status(500).send('Error updating file');
          res.send('File updated successfully');
      });
  });

  app.delete('/files/:filename', (req, res) => {
      const filename = req.params.filename;
      const filePath = path.join(targetDir, filename);

      if (!fs.existsSync(filePath)) {
          return res.status(404).send('Cannot delete: File not found');
      }

      fs.unlink(filePath, (err) => {
          if (err) return res.status(500).send('Error deleting file');
          res.send('File deleted successfully');
      });
  });


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

