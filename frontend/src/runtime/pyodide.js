const pyodideVersion = '0.27.5'
const pyodideScriptUrl = `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/pyodide.js`

let pyodideLoadPromise

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`)

    if (existingScript) {
      if (window.loadPyodide) {
        resolve()
        return
      }

      existingScript.addEventListener('load', resolve, { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Unable to load Pyodide script.')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Unable to load Pyodide script.'))
    document.head.append(script)
  })
}

async function loadPyodideInstance() {
  await loadScript(pyodideScriptUrl)

  if (!window.loadPyodide) {
    throw new Error('Pyodide loader was not attached to window.')
  }

  const pyodide = await window.loadPyodide()
  await pyodide.runPythonAsync('import sys, io, traceback')
  return pyodide
}

export function getPyodide() {
  if (!pyodideLoadPromise) {
    pyodideLoadPromise = loadPyodideInstance()
  }

  return pyodideLoadPromise
}

export async function runPythonCode(code) {
  const pyodide = await getPyodide()
  pyodide.globals.set('__algoquest_code', code)

  const resultProxy = await pyodide.runPythonAsync(`
import io
import sys
import traceback

_stdout = io.StringIO()
_stderr = io.StringIO()
_globals = {"__name__": "__main__"}
_previous_stdout = sys.stdout
_previous_stderr = sys.stderr
sys.stdout = _stdout
sys.stderr = _stderr

try:
    exec(__algoquest_code, _globals)
    {
        "status": "ok",
        "stdout": _stdout.getvalue(),
        "stderr": _stderr.getvalue(),
    }
except Exception:
    traceback.print_exc(file=_stderr)
    {
        "status": "error",
        "stdout": _stdout.getvalue(),
        "stderr": _stderr.getvalue(),
    }
finally:
    sys.stdout = _previous_stdout
    sys.stderr = _previous_stderr
  `)

  const result = resultProxy?.toJs ? resultProxy.toJs({ dict_converter: Object.fromEntries }) : resultProxy
  resultProxy?.destroy?.()
  pyodide.globals.delete('__algoquest_code')
  return result
}
