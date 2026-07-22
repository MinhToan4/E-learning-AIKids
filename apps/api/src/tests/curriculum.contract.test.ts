import { describe, expect, it } from 'vitest'
import {
  curriculumCourses,
  LECTURE_PREVIEW_URL,
} from '../../prisma/seed/courses/curriculum.js'

describe('12-course curriculum contract', () => {
  it('contains the exact 146 lessons defined by the course library', () => {
    expect(curriculumCourses).toHaveLength(12)
    expect(
      curriculumCourses.every(
        (course) => course.productLabel.trim().length > 10,
      ),
    ).toBe(true)
    expect(
      Object.fromEntries(
        curriculumCourses.map((course) => [
          `${course.ageTrack}-${course.courseKey}`,
          course.quests.length,
        ]),
      ),
    ).toEqual({
      'L1-K1': 8,
      'L1-K2': 8,
      'L1-K3': 8,
      'L1-K4': 8,
      'L1-K5': 8,
      'L1-K6': 10,
      'L2-K1': 16,
      'L2-K2': 16,
      'L2-K3': 16,
      'L2-K4': 16,
      'L2-K5': 16,
      'L2-K6': 16,
    })
    expect(
      curriculumCourses.every((course) =>
        course.ageTrack === 'L1'
          ? course.ageLabel === '8–9 tuổi'
          : course.ageLabel === '10–11 tuổi',
      ),
    ).toBe(true)
  })

  it('keeps all four stations, honest optional lectures and per-lesson game packs', () => {
    let personalizedGamePacks = 0
    const gameInstructions = new Set<string>()
    const gameCardSets = new Set<string>()
    for (const course of curriculumCourses) {
      for (const quest of course.quests) {
        expect(quest.videoUrl).toBe(LECTURE_PREVIEW_URL)
        expect(LECTURE_PREVIEW_URL).toBeNull()
        expect(quest.stations?.stations.map((station) => station.kind)).toEqual([
          'video',
          'game',
          'practice',
          'check',
        ])
        expect(JSON.stringify(quest)).not.toContain('ForBiggerBlazes')
        expect(
          quest.stations?.stations.find((station) => station.kind === 'video')
            ?.videoUrl,
        ).toBe(LECTURE_PREVIEW_URL)
        const game = quest.stations?.stations.find(
          (station) => station.kind === 'game',
        )
        const lecture = quest.stations?.stations.find(
          (station) => station.kind === 'video',
        )
        expect(lecture?.content?.trim().length).toBeGreaterThan(20)
        expect(lecture?.outcome?.trim().length).toBeGreaterThan(10)
        const cards = (game?.gameConfig as { cards?: string[] } | undefined)
          ?.cards
        if (cards && cards.length >= 3) {
          expect(
            cards.every(
              (card) =>
                card.length <= 56 && /[\p{L}\p{N}]/u.test(card),
            ),
          ).toBe(true)
          expect(
            cards.every(
              (card) => !/^(Quan sát|So sánh|Giải thích):\s/iu.test(card),
            ),
          ).toBe(true)
          personalizedGamePacks += 1
          gameInstructions.add(game?.instruction ?? '')
          gameCardSets.add(cards.join('|'))
        }
      }
    }
    expect(personalizedGamePacks).toBe(146)
    expect(gameInstructions.size).toBe(146)
    expect(gameCardSets.size).toBe(146)
    expect(
      curriculumCourses
        .find((course) => course.id === 'l1-k1-the-gioi')
        ?.quests[0]?.stations?.stations.find(
          (station) => station.kind === 'game',
        )?.gameConfig?.cards,
    ).toContain('3 từ khoá + tên thế giới')

    const openingCourse = curriculumCourses.find(
      (course) => course.id === 'l1-k1-the-gioi',
    )
    const openingGames = openingCourse?.quests.map((quest) =>
      quest.stations?.stations.find((station) => station.kind === 'game'),
    )
    expect(openingGames?.[0]?.gameType).toBe('combine')
    expect(
      (openingGames?.[0]?.gameConfig as { groups?: unknown[] }).groups,
    ).toHaveLength(3)
    expect(openingGames?.[1]?.gameType).toBe('compare')
    expect(
      (openingGames?.[1]?.gameConfig as { rounds?: unknown[] }).rounds,
    ).toHaveLength(3)
    expect(
      (openingGames?.[2]?.gameConfig as { pairs?: unknown[] }).pairs,
    ).toHaveLength(3)
    expect(openingGames?.[3]?.gameType).toBe('combine')
    expect(
      (openingGames?.[3]?.gameConfig as { groups?: unknown[] }).groups,
    ).toHaveLength(2)
    expect(openingGames?.[5]?.gameType).toBe('compare')
    expect(
      (openingGames?.[5]?.gameConfig as { rounds?: unknown[] }).rounds,
    ).toHaveLength(3)
    expect(openingGames?.[6]?.gameType).toBe('place')
    expect(
      (openingGames?.[6]?.gameConfig as { placements?: unknown[] }).placements,
    ).toHaveLength(3)
    expect(openingGames?.[7]?.gameType).toBe('order')
    expect(openingGames?.[7]?.gameConfig?.cards).toEqual([
      'Tên thế giới',
      'Sinh vật đặc biệt',
      'Cảm giác chính',
    ])

    const characterCourse = curriculumCourses.find(
      (course) => course.id === 'l1-k2-nhan-vat',
    )
    const characterGames = characterCourse?.quests.map((quest) =>
      quest.stations?.stations.find((station) => station.kind === 'game'),
    )
    expect(characterGames?.map((game) => game?.gameType)).toEqual([
      'combine',
      'compare',
      'match',
      'compare',
      'order',
      'compare',
      'place',
      'order',
    ])
    expect(
      (characterGames?.[0]?.gameConfig as { groups?: unknown[] }).groups,
    ).toHaveLength(2)
    expect(
      (characterGames?.[2]?.gameConfig as { pairs?: unknown[] }).pairs,
    ).toHaveLength(3)
    expect(
      (characterGames?.[6]?.gameConfig as { placements?: unknown[] })
        .placements,
    ).toHaveLength(3)
    expect(characterGames?.[7]?.gameConfig?.cards).toEqual([
      'Chào người xem',
      'Nói tên nhân vật',
      'Kể tính cách và hành động',
      'Nêu chi tiết đặc biệt',
    ])

    const storyCourse = curriculumCourses.find(
      (course) => course.id === 'l1-k3-ke-chuyen',
    )
    const storyGames = storyCourse?.quests.map((quest) =>
      quest.stations?.stations.find((station) => station.kind === 'game'),
    )
    expect(storyGames?.map((game) => game?.gameType)).toEqual([
      'order',
      'place',
      'compare',
      'combine',
      'combine',
      'compare',
      'compare',
      'match',
    ])
    expect(storyGames?.[0]?.gameConfig?.cards).toHaveLength(3)
    expect(
      (storyGames?.[3]?.gameConfig as { groups?: unknown[] }).groups,
    ).toHaveLength(2)
    expect(
      (storyGames?.[7]?.gameConfig as { pairs?: unknown[] }).pairs,
    ).toHaveLength(3)

    const comicCourse = curriculumCourses.find(
      (course) => course.id === 'l1-k4-truyen-tranh',
    )
    const comicGames = comicCourse?.quests.map((quest) =>
      quest.stations?.stations.find((station) => station.kind === 'game'),
    )
    expect(comicGames?.map((game) => game?.gameType)).toEqual([
      'match',
      'compare',
      'match',
      'match',
      'compare',
      'compare',
      'order',
      'compare',
    ])
    expect(
      (comicGames?.[0]?.gameConfig as { pairs?: unknown[] }).pairs,
    ).toHaveLength(3)
    expect(comicGames?.[6]?.gameConfig?.cards).toHaveLength(4)

    const motionCourse = curriculumCourses.find(
      (course) => course.id === 'l1-k5-chuyen-dong',
    )
    const motionGames = motionCourse?.quests.map((quest) =>
      quest.stations?.stations.find((station) => station.kind === 'game'),
    )
    expect(motionGames?.map((game) => game?.gameType)).toEqual([
      'match',
      'compare',
      'order',
      'compare',
      'match',
      'compare',
      'compare',
      'order',
    ])
    expect(
      (motionGames?.[0]?.gameConfig as { pairs?: unknown[] }).pairs,
    ).toHaveLength(3)
    expect(motionGames?.[7]?.gameConfig?.cards).toHaveLength(4)

    const filmCourse = curriculumCourses.find(
      (course) => course.id === 'l1-k6-phim-ngan',
    )
    const filmGames = filmCourse?.quests.map((quest) =>
      quest.stations?.stations.find((station) => station.kind === 'game'),
    )
    expect(filmGames?.map((game) => game?.gameType)).toEqual([
      'match',
      'compare',
      'place',
      'compare',
      'combine',
      'compare',
      'order',
      'match',
      'compare',
      'order',
    ])
    expect(
      (filmGames?.[4]?.gameConfig as { groups?: unknown[] }).groups,
    ).toHaveLength(3)
    expect(filmGames?.[9]?.gameConfig?.cards).toHaveLength(4)

    const advancedWorldCourse = curriculumCourses.find(
      (course) => course.id === 'l2-k1-the-gioi',
    )
    const advancedWorldGames = advancedWorldCourse?.quests.map((quest) =>
      quest.stations?.stations.find((station) => station.kind === 'game'),
    )
    expect(advancedWorldGames?.map((game) => game?.gameType)).toEqual([
      'combine',
      'combine',
      'combine',
      'place',
      'combine',
      'compare',
      'match',
      'compare',
      'combine',
      'compare',
      'match',
      'compare',
      'order',
      'place',
      'order',
      'compare',
    ])
    expect(
      (advancedWorldGames?.[8]?.gameConfig as { groups?: unknown[] }).groups,
    ).toHaveLength(2)
    expect(advancedWorldGames?.[12]?.gameConfig?.cards).toHaveLength(4)

    const advancedCharacterCourse = curriculumCourses.find(
      (course) => course.id === 'l2-k2-nhan-vat',
    )
    const advancedCharacterGames = advancedCharacterCourse?.quests.map(
      (quest) =>
        quest.stations?.stations.find((station) => station.kind === 'game'),
    )
    expect(advancedCharacterGames?.map((game) => game?.gameType)).toEqual([
      'combine',
      'match',
      'match',
      'compare',
      'match',
      'match',
      'match',
      'compare',
      'compare',
      'compare',
      'place',
      'compare',
      'combine',
      'compare',
      'order',
      'compare',
    ])
    expect(
      (advancedCharacterGames?.[12]?.gameConfig as { groups?: unknown[] })
        .groups,
    ).toHaveLength(2)
    expect(advancedCharacterGames?.[14]?.gameConfig?.cards).toHaveLength(4)

    const advancedStoryCourse = curriculumCourses.find(
      (course) => course.id === 'l2-k3-ke-chuyen',
    )
    const advancedStoryGames = advancedStoryCourse?.quests.map((quest) =>
      quest.stations?.stations.find((station) => station.kind === 'game'),
    )
    expect(advancedStoryGames?.map((game) => game?.gameType)).toEqual([
      'order',
      'place',
      'compare',
      'order',
      'order',
      'compare',
      'combine',
      'compare',
      'compare',
      'match',
      'match',
      'order',
      'place',
      'compare',
      'compare',
      'compare',
    ])
    expect(advancedStoryGames?.[0]?.gameConfig?.cards).toHaveLength(5)
    expect(
      (advancedStoryGames?.[12]?.gameConfig as { placements?: unknown[] })
        .placements,
    ).toHaveLength(4)

    const advancedComicCourse = curriculumCourses.find(
      (course) => course.id === 'l2-k4-truyen-tranh',
    )
    const advancedComicGames = advancedComicCourse?.quests.map((quest) =>
      quest.stations?.stations.find((station) => station.kind === 'game'),
    )
    expect(advancedComicGames?.map((game) => game?.gameType)).toEqual([
      'match',
      'order',
      'place',
      'compare',
      'order',
      'place',
      'match',
      'match',
      'compare',
      'match',
      'compare',
      'compare',
      'place',
      'compare',
      'order',
      'compare',
    ])
    expect(advancedComicGames?.[4]?.gameConfig?.cards).toHaveLength(4)
    expect(
      (advancedComicGames?.[5]?.gameConfig as { placements?: unknown[] })
        .placements,
    ).toHaveLength(4)

    const advancedMotionCourse = curriculumCourses.find(
      (course) => course.id === 'l2-k5-chuyen-dong',
    )
    const advancedMotionGames = advancedMotionCourse?.quests.map((quest) =>
      quest.stations?.stations.find((station) => station.kind === 'game'),
    )
    expect(advancedMotionGames?.map((game) => game?.gameType)).toEqual([
      'match',
      'match',
      'order',
      'order',
      'match',
      'match',
      'compare',
      'compare',
      'order',
      'place',
      'compare',
      'compare',
      'order',
      'compare',
      'order',
      'compare',
    ])
    expect(advancedMotionGames?.[8]?.gameConfig?.cards).toHaveLength(4)
    expect(
      (advancedMotionGames?.[9]?.gameConfig as { placements?: unknown[] })
        .placements,
    ).toHaveLength(4)

    const advancedFilmCourse = curriculumCourses.find(
      (course) => course.id === 'l2-k6-phim-ngan',
    )
    const advancedFilmGames = advancedFilmCourse?.quests.map((quest) =>
      quest.stations?.stations.find((station) => station.kind === 'game'),
    )
    expect(advancedFilmGames?.map((game) => game?.gameType)).toEqual([
      'order',
      'compare',
      'match',
      'compare',
      'place',
      'place',
      'match',
      'compare',
      'place',
      'compare',
      'match',
      'match',
      'place',
      'compare',
      'order',
      'compare',
    ])
    expect(advancedFilmGames?.[14]?.gameConfig?.cards).toHaveLength(6)
    expect(
      (advancedFilmGames?.[12]?.gameConfig as { placements?: unknown[] })
        .placements,
    ).toHaveLength(3)
  })

  it('uses lesson-relevant assessment choices instead of throwaway distractors', () => {
    const bannedDistractors = [
      'Bỏ qua và sang bài tiếp theo',
      'Nhập thông tin cá nhân để được chấm',
      'Không cần học gì cả',
      'Chỉ cần copy người khác',
    ]

    for (const course of curriculumCourses) {
      for (const quest of course.quests.slice(0, -1)) {
        expect(quest.check).toHaveLength(1)
        expect(quest.check?.[0]?.options).toHaveLength(3)
        expect(
          quest.check?.[0]?.options.every(
            (option) => !bannedDistractors.includes(option),
          ),
        ).toBe(true)
      }
    }
  })

  it('uses a reviewed structured game mechanic for all 146 lessons', () => {
    let gameCount = 0
    for (const course of curriculumCourses) {
      for (const quest of course.quests) {
        const game = quest.stations?.stations.find(
          (station) => station.kind === 'game',
        )
        const config = game?.gameConfig as
          | {
              cards?: unknown[]
              groups?: unknown[]
              pairs?: unknown[]
              placements?: unknown[]
              rounds?: unknown[]
            }
          | undefined
        expect(['combine', 'compare', 'match', 'order', 'place']).toContain(
          game?.gameType,
        )
        if (game?.gameType === 'combine') {
          expect(config?.groups?.length).toBeGreaterThanOrEqual(2)
        } else if (game?.gameType === 'compare') {
          expect(config?.rounds?.length).toBeGreaterThanOrEqual(2)
        } else if (game?.gameType === 'match') {
          expect(config?.pairs?.length).toBeGreaterThanOrEqual(3)
        } else if (game?.gameType === 'place') {
          expect(config?.placements?.length).toBeGreaterThanOrEqual(3)
        } else if (game?.gameType === 'order') {
          expect(config?.cards?.length).toBeGreaterThanOrEqual(3)
        }
        gameCount += 1
      }
    }
    expect(gameCount).toBe(146)
  })

  it('states issuer, assessment, framework relationship and unique badge', () => {
    const credentials = curriculumCourses.map(
      (course) => course.recognition.credential,
    )
    expect(new Set(credentials).size).toBe(12)
    for (const course of curriculumCourses) {
      expect(course.recognition.issuer).toBe('AI Kids Creator Academy')
      expect(course.recognition.finalAssessment.length).toBeGreaterThan(10)
      expect(course.recognition.frameworks).toHaveLength(2)
      expect(course.recognition.disclaimer).toContain('không phải chứng nhận')
      expect(course.quests.at(-1)?.check?.length).toBeGreaterThanOrEqual(3)
    }
  })
})
