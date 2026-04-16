const defaultBaseUrl = 'http://127.0.0.1:8000'

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl

/**
 * Generic Fetchers
 */

export async function getJson(path) {
  const response = await fetch(`${apiBaseUrl}${path}`)
  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`)
  }
  return response.json()
}

export async function postJson(path, payload) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    throw new Error(`POST ${path} failed with status ${response.status}`)
  }
  return response.json()
}

export async function putJson(path, payload) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    throw new Error(`PUT ${path} failed with status ${response.status}`)
  }
  return response.json()
}

/**
 * Static & Meta
 */

export async function fetchRealms() {
  return getJson('/api/realms')
}

export async function fetchLessons() {
  return getJson('/api/lessons')
}

export async function fetchAlgorithms() {
  return getJson('/api/algorithms')
}

/**
 * Progress & Settings
 */

export async function fetchSettings(profileId = 'guest') {
  return getJson(`/api/settings?profile_id=${profileId}`)
}

export async function updateSettings(settings, profileId = 'guest') {
  return putJson(`/api/settings?profile_id=${profileId}`, settings)
}

export async function fetchProgressSummary(profileId = 'guest') {
  return getJson(`/api/progress/summary?profile_id=${profileId}`)
}

export async function fetchLessonProgressList(profileId = 'guest') {
  return getJson(`/api/progress/lessons?profile_id=${profileId}`)
}

export async function updateLessonProgress(lessonSlug, update, profileId = 'guest') {
  return putJson(`/api/progress/lessons/${lessonSlug}?profile_id=${profileId}`, update)
}

export async function fetchPathAnalytics(profileId = 'guest') {
  return getJson(`/api/path/analytics?profile_id=${profileId}`)
}

/**
 * Workbench & Projects
 */

export async function fetchProjectBlueprints() {
  return getJson('/api/project-blueprints')
}

export async function fetchProjects(profileId = 'guest') {
  return getJson(`/api/projects?profile_id=${profileId}`)
}

export async function createProject(payload, profileId = 'guest') {
  return postJson(`/api/projects?profile_id=${profileId}`, payload)
}

/**
 * Forge
 */

export async function fetchChallenges(profileId = 'guest') {
  return getJson(`/api/forge/challenges?profile_id=${profileId}`)
}

export async function fetchPosters(profileId = 'guest') {
  return getJson(`/api/forge/posters?profile_id=${profileId}`)
}

export async function createPoster(payload, profileId = 'guest') {
  return postJson(`/api/forge/posters?profile_id=${profileId}`, payload)
}

/**
 * AI Broker
 */

export async function aiReviewLogic(code, focus, profileId = 'guest') {
  return postJson(`/api/ai/review-logic?profile_id=${profileId}`, { code, focus })
}

export async function aiSocraticAnchor(code, problemContext, userQuery, profileId = 'guest') {
  return postJson(`/api/ai/socratic-anchor?profile_id=${profileId}`, { code, problemContext, userQuery })
}

export async function aiIdeaToSyntax(description, profileId = 'guest') {
  return postJson(`/api/ai/idea-to-syntax?profile_id=${profileId}`, { description })
}
