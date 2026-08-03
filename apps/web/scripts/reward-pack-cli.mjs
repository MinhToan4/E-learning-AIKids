#!/usr/bin/env node
import { inspectRewardPack, uploadRewardPack } from './reward-pack-lib.mjs'

function usage() {
  return [
    'Usage:',
    '  npm run rewards:pack -w @aikids/web -- validate <pack.zip>',
    '  npm run rewards:pack -w @aikids/web -- upload <pack.zip>',
    '',
    'Upload environment:',
    '  STORYMEE_API_ORIGIN=https://api.storymee.com',
    '  STORYMEE_STORAGE_ORIGIN=https://storage.storymee.com',
    '  STORYMEE_ADMIN_TOKEN=<short-lived CI/designer token>',
  ].join('\n')
}

const [, , command, zipPath] = process.argv
if (!['validate', 'upload'].includes(command) || !zipPath) {
  process.stderr.write(`${usage()}\n`)
  process.exitCode = 2
} else {
  try {
    if (command === 'validate') {
      const result = await inspectRewardPack(zipPath)
      process.stdout.write(
        `Reward pack hợp lệ: ${result.packId} · ${result.release} · ` +
        `${result.rewardCount} rewards · ${result.achievementCount} achievements · ` +
        `${result.assetCount} assets · sha256 ${result.sha256}\n`,
      )
    } else {
      const result = await uploadRewardPack(zipPath, {
        apiOrigin: process.env.STORYMEE_API_ORIGIN ?? '',
        storageOrigin:
          process.env.STORYMEE_STORAGE_ORIGIN ?? 'https://storage.storymee.com',
        token: process.env.STORYMEE_ADMIN_TOKEN ?? '',
      })
      process.stdout.write(
        `Đã upload draft ${result.draftId ?? '(pending)'} · ` +
        `status ${result.status ?? 'validating'} · sha256 ${result.sha256}\n`,
      )
    }
  } catch (error) {
    process.stderr.write(
      `Reward pack thất bại: ${
        error instanceof Error ? error.message : String(error)
      }\n`,
    )
    process.exitCode = 1
  }
}
