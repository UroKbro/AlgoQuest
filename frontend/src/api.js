const defaultBaseUrl = 'http://127.0.0.1:8000'

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl

let authToken = localStorage.getItem('algoquest-token')

export function setAuthToken(token) {
  authToken = token
  if (token) {
    localStorage.setItem('algoquest-token', token)
  } else {
    localStorage.removeItem('algoquest-token')
  }
}

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  return headers
}

/**
 * Generic Fetchers
 */

export async function getJson(path) {
  let response

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      headers: getHeaders()
    })
  } catch {
    throw new Error(`Unable to reach the backend at ${apiBaseUrl}. Make sure the API server is running.`)
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || `GET ${path} failed with status ${response.status}`)
  }
  return response.json()
}

export async function postJson(path, payload) {
  let response

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    })
  } catch {
    throw new Error(`Unable to reach the backend at ${apiBaseUrl}. Make sure the API server is running.`)
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    if (response.status === 422 && err.errors) {
      const errorMessages = err.errors.map(e => `${e.loc.join('.')} ${e.msg}`).join(', ')
      throw new Error(`Validation failed: ${errorMessages}`)
    }
    throw new Error(err.detail || `POST ${path} failed with status ${response.status}`)
  }
  return response.json()
}

export async function putJson(path, payload) {
  let response

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    })
  } catch {
    throw new Error(`Unable to reach the backend at ${apiBaseUrl}. Make sure the API server is running.`)
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    if (response.status === 422 && err.errors) {
      const errorMessages = err.errors.map(e => `${e.loc.join('.')} ${e.msg}`).join(', ')
      throw new Error(`Validation failed: ${errorMessages}`)
    }
    throw new Error(err.detail || `PUT ${path} failed with status ${response.status}`)
  }
  return response.json()
}

/**
 * Auth
 */

export async function login(username, password) {
  const data = await postJson('/api/auth/login', { username, password })
  setAuthToken(data.accessToken)
  return data
}

export async function signup(username, password) {
  const data = await postJson('/api/auth/signup', { username, password })
  setAuthToken(data.accessToken)
  return data
}

export function logout() {
  setAuthToken(null)
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

export async function fetchSimulations() {
  return getJson('/api/simulations')
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

export async function updateProject(projectId, payload, profileId = 'guest') {
  return putJson(`/api/projects/${projectId}?profile_id=${profileId}`, payload)
}

export async function exportProject(projectId, profileId = 'guest') {
  return postJson(`/api/projects/${projectId}/export?profile_id=${profileId}`, {})
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

/**
 * Notifications
 */

export async function fetchNotifications(profileId = 'guest', limit = 10) {
  return getJson(`/api/notifications?profile_id=${profileId}&limit=${limit}`)
}

export async function markNotificationRead(notificationId, profileId = 'guest') {
  return putJson(`/api/notifications/${notificationId}/read?profile_id=${profileId}`, {})
}
