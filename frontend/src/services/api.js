const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new Error("Cannot reach the SkillSync API. Make sure the Flask server is running.");
  }
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status}).`);
  return body;
}

export const api = {
  health: () => request("/health"),
  careers: () => request("/careers"),
  predict: (profile) => request("/predict", { method: "POST", body: JSON.stringify(profile) }),
  skillGap: (role, skills) => request("/skill-gap", { method: "POST", body: JSON.stringify({ role, skills }) }),
  metrics: () => request("/model-metrics"),
  roadmap: (role, skills) => request(`/roadmap?role=${encodeURIComponent(role)}&skills=${encodeURIComponent(skills.join(","))}`),
};
