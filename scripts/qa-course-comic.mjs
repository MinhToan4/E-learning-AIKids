import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const baseUrl = process.env.QA_BASE_URL ?? 'http://localhost:8080'
const chromePath = process.env.CHROME_PATH ??
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const debugPort = 9225
const profile = join(tmpdir(), `aikids-chrome-qa-${process.pid}`)
const screenshotPath = resolve('artifacts/qa/course-comic.png')

mkdirSync(profile, { recursive: true })
mkdirSync(resolve('artifacts/qa'), { recursive: true })

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--disable-gpu',
  'about:blank',
], { stdio: 'ignore', windowsHide: true })

async function waitForChrome() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://localhost:${debugPort}/json/version`)
      if (response.ok) return
    } catch {
      // Chrome needs a brief startup window on CI and Windows desktops.
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 250))
  }
  throw new Error('Chrome debugging endpoint did not become ready')
}

async function createRpc(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl)
  await new Promise((resolveOpen, rejectOpen) => {
    socket.onopen = resolveOpen
    socket.onerror = rejectOpen
  })
  let nextId = 1
  const pending = new Map()
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data)
    const request = pending.get(message.id)
    if (!request) return
    pending.delete(message.id)
    if (message.error) request.reject(new Error(message.error.message))
    else request.resolve(message.result)
  }
  return {
    call(method, params = {}) {
      return new Promise((resolveCall, rejectCall) => {
        const id = nextId
        nextId += 1
        pending.set(id, { resolve: resolveCall, reject: rejectCall })
        socket.send(JSON.stringify({ id, method, params }))
      })
    },
    close() { socket.close() },
  }
}

try {
  await waitForChrome()
  const login = await fetch(`${baseUrl}/api/auth/login/student`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ nickname: 'SaoMay', avatarId: 'avatar-star' }),
  })
  const token = /aikids_session=([^;]+)/.exec(login.headers.get('set-cookie') ?? '')?.[1]
  if (!login.ok || !token) throw new Error('Student QA login failed')
  const onboarding = await fetch(`${baseUrl}/api/auth/me`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      cookie: `aikids_session=${token}`,
    },
    body: JSON.stringify({ onboarded: true, goal: 'comic' }),
  })
  if (!onboarding.ok) throw new Error('Student QA onboarding failed')

  const page = await fetch(
    `http://localhost:${debugPort}/json/new?${encodeURIComponent(`${baseUrl}/`)}`,
    { method: 'PUT' },
  ).then((response) => response.json())
  const rpc = await createRpc(page.webSocketDebuggerUrl)
  await rpc.call('Network.enable')
  await rpc.call('Network.setCookie', {
    name: 'aikids_session',
    value: token,
    url: baseUrl,
    httpOnly: true,
    sameSite: 'Lax',
  })
  await rpc.call('Page.enable')
  await rpc.call('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await rpc.call('Page.navigate', { url: `${baseUrl}/course/course-comic` })
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 5_000))

  const evaluated = await rpc.call('Runtime.evaluate', {
    expression: `JSON.stringify({
      title: document.title,
      url: location.href,
      text: document.body.innerText.slice(0, 1500),
      rootChildren: document.querySelector('#root')?.childElementCount || 0,
      bodyHeight: document.body.scrollHeight
    })`,
    returnByValue: true,
  })
  const state = JSON.parse(evaluated.result.value)
  if (state.rootChildren < 1 || state.bodyHeight < 300 || !state.text.trim()) {
    throw new Error(`Course page did not render: ${JSON.stringify(state)}`)
  }

  const screenshot = await rpc.call('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  })
  writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'))
  rpc.close()
  console.log(JSON.stringify({ ...state, screenshotPath }, null, 2))
} finally {
  chrome.kill()
}
