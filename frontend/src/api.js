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
