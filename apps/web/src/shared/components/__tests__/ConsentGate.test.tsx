// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, beforeEach } from 'vitest'
import { ConsentGate } from '../ConsentGate'
import { useAuth } from '@/shared/store/auth'

describe('ConsentGate', () => {
  beforeEach(() => {
    useAuth.getState().setUser(null)
  })

  it('renders children when student has allowAiCreate = true', async () => {
    useAuth.getState().setUser({
      id: 'student-1',
      role: 'student',
      allowAiCreate: true,
    })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <ConsentGate cap="allowAiCreate">
          <div data-testid="allowed-content">Khung vẽ AI</div>
        </ConsentGate>,
      )
    })

    expect(container.textContent).toContain('Khung vẽ AI')
    expect(container.textContent).not.toContain('chưa được bật')

    act(() => root.unmount())
    container.remove()
  })

  it('renders children by default when student allowAiCreate is undefined', async () => {
    useAuth.getState().setUser({
      id: 'student-2',
      role: 'student',
      allowAiCreate: undefined,
    })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <ConsentGate cap="allowAiCreate">
          <div data-testid="allowed-content">Khung vẽ AI Mặc Định</div>
        </ConsentGate>,
      )
    })

    expect(container.textContent).toContain('Khung vẽ AI Mặc Định')
    expect(container.textContent).not.toContain('chưa được bật')

    act(() => root.unmount())
    container.remove()
  })

  it('blocks and shows Hallmark Soft Clay card when allowAiCreate is explicitly false', async () => {
    useAuth.getState().setUser({
      id: 'student-3',
      role: 'student',
      allowAiCreate: false,
    })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <ConsentGate cap="allowAiCreate">
          <div data-testid="allowed-content">Không được xem</div>
        </ConsentGate>,
      )
    })

    expect(container.textContent).not.toContain('Không được xem')
    expect(container.textContent).toContain('Phòng sáng tạo AI chưa được bật')
    expect(container.textContent).toContain('Ba / Mẹ chưa bật quyền sử dụng Studio AI cho con.')
    expect(container.textContent).toContain('Góc Phụ Huynh')

    act(() => root.unmount())
    container.remove()
  })

  it('allows through when role is parent or teacher regardless of cap state', async () => {
    useAuth.getState().setUser({
      id: 'parent-1',
      role: 'parent',
      allowAiCreate: false,
    })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <ConsentGate cap="allowAiCreate">
          <div data-testid="allowed-content">Phụ huynh xem trực tiếp</div>
        </ConsentGate>,
      )
    })

    expect(container.textContent).toContain('Phụ huynh xem trực tiếp')

    act(() => root.unmount())
    container.remove()
  })
})
