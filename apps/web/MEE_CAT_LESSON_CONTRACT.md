# Mee Cat lesson guidance contract

Mee Cat is a presentation layer for lesson content owned and validated by
`core-lms-api`. The web client must not generate a solution, infer the correct
answer, or treat `strategy` as text that can be read directly to a child.

## Check-question JSON

```json
{
  "id": "add-carry-01",
  "prompt": "25 + 17 bằng bao nhiêu?",
  "options": ["32", "42", "52"],
  "answer": 1,
  "explain": "Cộng hàng đơn vị trước: 5 + 7 = 12, viết 2 nhớ 1.",
  "mee": {
    "readText": "Hai mươi lăm cộng mười bảy bằng bao nhiêu nhỉ?",
    "strategy": "Tách hàng chục và hàng đơn vị; cộng đơn vị trước và xử lý nhớ 1.",
    "hints": [
      "Con nhìn vào hàng đơn vị trước nhé.",
      "Thử tính 5 cộng 7 rồi đổi 10 đơn vị thành 1 chục.",
      "5 cộng 7 bằng 12: viết 2 và nhớ 1 sang hàng chục."
    ],
    "gesture": "point-left",
    "autoRead": false
  }
}
```

## Field rules

- `readText`: optional TTS-friendly rewrite, one idea per sentence. The client
  falls back to `prompt`/`question` when omitted.
- `strategy`: required authoring context for future tutor services. It is not
  exposed or spoken by the web client.
- `hints`: ordered from the smallest nudge to a worked first step. The first
  hint must not reveal the final answer.
- `gesture`: one of `presentation`, `point-left`, `point-right`, `think`, or
  `idea`.
- `autoRead`: opt-in only. Student controls for play and stop remain available.

The same `mee` object can be attached to a `learnCards[]` item with
`readText`, `gesture`, and `autoRead`. Learn cards intentionally omit
`strategy` and `hints`; those belong to activities that require solving.

For compatibility, the lesson read endpoint may return the authored `prompt`
as `question`, but it must preserve the nested `mee` object. Unknown fields are
ignored by older web clients. All authoring input must be length-limited and
validated by the owning LMS service before persistence.

## Gateway endpoints

- Authoring writes continue through `/api/teacher/lectures`.
- Student lesson reads continue through `/api/quests/:lessonId`.
- No answer or `strategy` should be included in offline student manifests.

## Lesson type: AIKI rule journey

The authored `learnCards` array is the source of truth for a rule lesson. It
contains exactly these kinds, in order: `situation`, `aiki-riddle`, `rule`,
`explanation`, and `closing`.

Each stage has a child-facing title and body, one primary `videoUrl` or
`imageUrl`, accessible `imageAlt`, and `mee.readText`. The student renderer
places the primary media beside the AIKI cat. HTTPS video and audio URLs are
validated before they reach a media element.

Until the deployed LMS schema exposes those fields directly, the web authoring
adapter stores the stage marker, media and Mee settings in a reserved
`visualItems` entry labelled `__AIKI_RULE_STAGE__`. Stage ids use the
`aiki-rule-*` prefix and the adapter maps stage kinds to the deployed kind enum.
The CMS and student renderer hydrate that envelope back to the public shape;
authors never edit the compatibility entry directly.

Vertex voice generation remains a StoryMee Hub responsibility. Hub persists
the generated HTTPS asset as `mee.audioUrl` with
`mee.voiceProvider: "vertex"`; the frontend only plays that asset and must
never receive a Vertex credential. When no generated asset exists, the
existing local Mee narration is only a draft-preview fallback and the course
must stay hidden until production media is complete.
