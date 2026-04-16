const defaultBaseUrl = 'http://127.0.0.1:8000'

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl

export async function getJson(path) {
  const response = await fetch(`${apiBaseUrl}${path}`)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export async function fetchRealms() {
  return getJson('/api/realms')
}

export async function fetchLessons() {
  return getJson('/api/lessons')
}

export async function fetchAlgorithms() {
  return getJson('/api/algorithms')
}

export async function fetchProgressSummary() {
  return getJson('/api/progress/summary')
}

export async function fetchPathAnalytics() {
  return getJson('/api/path/analytics')
}

export async function fetchProjectBlueprints() {
  return getJson('/api/project-blueprints')
}

export async function fetchProjects() {
  return getJson('/api/projects')
}

export async function fetchChallenges() {
  return getJson('/api/challenges')
}

export async function postJson(path, payload) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export async function aiReviewLogic(code, focus) {
  return postJson('/api/ai/review-logic', { code, focus })
}

export async function aiSocraticAnchor(code, problemContext, userQuery) {
  return postJson('/api/ai/socratic-anchor', { code, problemContext, userQuery })
}

export async function aiIdeaToSyntax(description) {
  return postJson('/api/ai/idea-to-syntax', { description })
}
