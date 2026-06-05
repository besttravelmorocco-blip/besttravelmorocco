import { settingsStore } from "./localStore";
import { sbTourStore, sbBlogStore, sbTestimonialStore } from "./supabaseStore";


interface PublishConfig {
  githubToken: string;
  repoOwner: string;
  repoName: string;
  vercelHook?: string;
}

export function getPublishConfig(): PublishConfig {
  try {
    const raw = localStorage.getItem("btm_publish_config");
    return raw ? JSON.parse(raw) : { githubToken: "", repoOwner: "besttravelmorocco-blip", repoName: "btm" };
  } catch {
    return { githubToken: "", repoOwner: "besttravelmorocco-blip", repoName: "btm" };
  }
}

export function savePublishConfig(cfg: PublishConfig) {
  localStorage.setItem("btm_publish_config", JSON.stringify(cfg));
}

async function githubRequest(
  method: string,
  path: string,
  token: string,
  body?: object
): Promise<Response> {
  return fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function upsertFile(
  token: string,
  owner: string,
  repo: string,
  filePath: string,
  content: string,
  message: string
): Promise<void> {
  const encoded = btoa(new TextEncoder().encode(content).reduce((s, b) => s + String.fromCharCode(b), ""));

  // Try to get current SHA (file may not exist yet)
  const getRes = await githubRequest("GET", `/repos/${owner}/${repo}/contents/${filePath}`, token);
  const sha: string | undefined = getRes.ok ? (await getRes.json()).sha : undefined;

  const putRes = await githubRequest("PUT", `/repos/${owner}/${repo}/contents/${filePath}`, token, {
    message,
    content: encoded,
    ...(sha ? { sha } : {}),
  });

  if (!putRes.ok) {
    const err = await putRes.json();
    throw new Error(err.message || `Failed to update ${filePath}`);
  }
}

export interface PublishResult {
  success: boolean;
  files: string[];
  deployTriggered: boolean;
  error?: string;
}

export async function publishToWebsite(
  onProgress: (msg: string) => void
): Promise<PublishResult> {
  const cfg = getPublishConfig();

  if (!cfg.githubToken) {
    return { success: false, files: [], deployTriggered: false, error: "No GitHub token configured. Go to Settings → Publish." };
  }

  const files: string[] = [];

  try {
    const now = new Date().toISOString().slice(0, 10);
    const msg = `Admin publish ${now}`;

    // Tours
    onProgress("Publishing tours…");
    const tours = await sbTourStore.getAll();
    await upsertFile(cfg.githubToken, cfg.repoOwner, cfg.repoName, "data/tours.json", JSON.stringify(tours, null, 2), msg);
    files.push("data/tours.json");

    // Blog posts
    onProgress("Publishing blog posts…");
    const posts = await sbBlogStore.getAll();
    await upsertFile(cfg.githubToken, cfg.repoOwner, cfg.repoName, "data/blog.json", JSON.stringify(posts, null, 2), msg);
    files.push("data/blog.json");

    // Testimonials
    onProgress("Publishing testimonials…");
    const testimonials = await sbTestimonialStore.getAll();
    await upsertFile(cfg.githubToken, cfg.repoOwner, cfg.repoName, "data/testimonials.json", JSON.stringify(testimonials, null, 2), msg);
    files.push("data/testimonials.json");

    // Settings
    onProgress("Publishing settings…");
    const settings = settingsStore.get();
    await upsertFile(cfg.githubToken, cfg.repoOwner, cfg.repoName, "data/settings.json", JSON.stringify(settings, null, 2), msg);
    files.push("data/settings.json");

    // Trigger Vercel redeploy
    let deployTriggered = false;
    if (cfg.vercelHook) {
      onProgress("Triggering Vercel redeploy…");
      const hookRes = await fetch(cfg.vercelHook, { method: "POST" });
      deployTriggered = hookRes.ok;
    }

    onProgress(deployTriggered ? "Published & deploy triggered!" : "Published to GitHub!");
    return { success: true, files, deployTriggered };
  } catch (err: any) {
    return { success: false, files, deployTriggered: false, error: err.message };
  }
}
