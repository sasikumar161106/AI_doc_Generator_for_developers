import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get connected GenAI client
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  return new GoogleGenAI({ apiKey });
}

// API Routes
app.post("/api/docs/generate", async (req, res) => {
  try {
    const { code, filename, context } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: "Code content is required" });
    }

    const ai = getGenAI();
    
    const prompt = `You are an expert technical documentation generator.
Your task is to analyze the following code snippet and generate clear, comprehensive Markdown documentation for it.

File Name (optional): ${filename || 'Unknown'}
Context (optional): ${context || 'None provided'}

Guidelines:
1. Provide a brief overview of what this code does.
2. Document all functions, inputs, outputs, and side effects.
3. Include a usage example if applicable.
4. Keep the documentation professional, structured, and easy to read.
5. Use markdown formatting exclusively.
6. Do not wrap the response with \`\`\`markdown, just return raw markdown.

Source Code:
\`\`\`
${code}
\`\`\`
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const markdownDoc = response.text;
    res.json({ document: markdownDoc });
  } catch (error: any) {
    console.error("Documentation generation error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate documentation",
      details: error.statusText
    });
  }
});

app.get("/api/github/user", async (req, res) => {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return res.status(400).json({ error: "GITHUB_TOKEN is not set in environment" });

    const headers = {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "DocSync-App"
    };

    const userRes = await fetch("https://api.github.com/user", { headers });
    if (!userRes.ok) throw new Error("Failed to fetch user");
    const user = await userRes.json();
    res.json({ login: user.login, avatar_url: user.avatar_url, name: user.name, email: user.email });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/github/repos", async (req, res) => {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return res.status(400).json({ error: "GITHUB_TOKEN is not set in environment" });

    const headers = {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "DocSync-App"
    };

    const reposRes = await fetch("https://api.github.com/user/repos?sort=updated&per_page=20", { headers });
    if (!reposRes.ok) throw new Error("Failed to fetch repos: " + await reposRes.text());
    const repos = await reposRes.json();
    res.json(repos);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/docs/generate-repo", async (req, res) => {
  try {
    const { repoFullName } = req.body;
    const token = process.env.GITHUB_TOKEN;
    if (!token) return res.status(400).json({ error: "GITHUB_TOKEN is not set in environment" });

    const headers = {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "DocSync-App"
    };

    // 1. Get default branch
    const repoRes = await fetch(`https://api.github.com/repos/${repoFullName}`, { headers });
    if (!repoRes.ok) throw new Error("Failed to fetch repo info");
    const repoInfo = await repoRes.json();
    const branch = repoInfo.default_branch;

    // 2. Get git tree recursively
    const treeRes = await fetch(`https://api.github.com/repos/${repoFullName}/git/trees/${branch}?recursive=1`, { headers });
    if (!treeRes.ok) throw new Error("Failed to fetch repo tree");
    const treeData = await treeRes.json();
    
    if (!treeData.tree || treeData.tree.length === 0) {
      return res.status(400).json({ error: "Repository is empty" });
    }

    // Filter out node_modules, dist, build, pictures, lockfiles, etc.
    const filePaths = treeData.tree
      .filter((file: any) => file.type === 'blob')
      .map((file: any) => file.path)
      .filter((path: string) => !path.match(/(node_modules|dist|build|\.(jpg|png|gif|svg|ico|pdf|zip|mp4)|package-lock\.json|yarn\.lock)/i))
      .filter((path: string) => !path.includes('/.')) // exclude hidden files/folders
      .slice(0, 15); // Limit to top 15 files to avoid massive payloads for this demo

    let allContents = "";
    for (const path of filePaths) {
      const fileRes = await fetch(`https://raw.githubusercontent.com/${repoFullName}/${branch}/${path}`, { headers });
      if (fileRes.ok) {
         const content = await fileRes.text();
         allContents += `\n\n--- File: ${path} ---\n\`\`\`\n${content}\n\`\`\`\n`;
      }
    }

    if (!allContents) {
       return res.status(400).json({ error: "No suitable code files found to analyze" });
    }

    const ai = getGenAI();
    const prompt = `You are an expert technical documentation generator.
Your task is to analyze the following repository files and generate a comprehensive \`README.md\` style documentation for the entire project.

Repository: ${repoFullName}

Guidelines:
1. Provide a project overview.
2. Document the structure and main components/features based on the files.
3. Suggest usage or setup instructions if apparent.
4. Keep the documentation professional, structured, and easy to read.
5. Use markdown formatting exclusively.
6. Do not wrap the response with \`\`\`markdown, just return raw markdown.

Source Files Analyzed:
${allContents}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ document: response.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/github/commit", async (req, res) => {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return res.status(400).json({ error: "GITHUB_TOKEN is not set in environment" });
    const { repo, path, content, message } = req.body;

    if (!repo || !path || !content) {
      return res.status(400).json({ error: "Missing required fields (repo, path, content)" });
    }

    const headers = {
       "Authorization": `Bearer ${token}`,
       "Accept": "application/vnd.github.v3+json",
       "User-Agent": "DocSync-App",
       "Content-Type": "application/json"
    };

    // 1. Get file SHA if it exists so we can update it
    let sha = undefined;
    const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, { headers });
    if (getRes.ok) {
      const getJson = await getRes.json();
      sha = getJson.sha;
    }

    // 2. Base64 encode content
    const b64Content = Buffer.from(content).toString('base64');

    // 3. PUT request
    const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: message || `Update docs for ${path}`,
        content: b64Content,
        sha
      })
    });

    if (!putRes.ok) {
       throw new Error("Failed to commit file: " + await putRes.text());
    }
    
    res.json({ success: true, url: (await putRes.json()).content.html_url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
