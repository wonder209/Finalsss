const express = require('express');
const { exec } = require('yt-dlp-exec');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR);
}

const HTML_TEMPLATE = () => `
<!DOCTYPE html>
<html>
<head>
    <title>Wonder Downloader</title>
    <style>
        body { background:#0a0a12; color:white; text-align:center; font-family: sans-serif; padding-top:50px; }
        .card { display:inline-block; background:#161625; padding:30px; border-radius:15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        input { padding:12px; width:280px; border-radius:5px; border:none; margin-bottom: 10px; color:black; }
        button { background:#00c853; color:white; border:none; padding:12px 25px; cursor:pointer; border-radius:5px; font-weight:bold; }
        .loader { display: none; border: 4px solid #f3f3f3; border-top: 4px solid #00c853; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="card">
        <h2>WONDER DOWNLOADER</h2>
        <form id="dl-form" method="POST" action="/download">
            <input type="text" name="url" placeholder="Paste TikTok link" required>
            <br>
            <button type="submit" id="btn">Download Video</button>
        </form>
        <div class="loader" id="spinner"></div>
    </div>
    <script>
        document.getElementById('dl-form').onsubmit = function() {
            document.getElementById('btn').style.display = 'none';
            document.getElementById('spinner').style.display = 'block';
        };
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(HTML_TEMPLATE()));

app.post('/download', async (req, res) => {
    const videoUrl = req.body.url;
    const fileName = `${uuidv4()}.mp4`;
    const filePath = path.join(DOWNLOAD_DIR, fileName);

    try {
        await exec(videoUrl, {
            output: filePath,
            format: 'best',
            noCheckCertificates: true
        });

        res.download(filePath, 'video.mp4', () => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
    } catch (err) {
        res.status(500).send("Error downloading video.");
    }
});

app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
