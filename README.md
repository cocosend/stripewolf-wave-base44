# Stripewolf Wave — Base44 migration

The seven original routes, synthesizer, DSP graph, effect presets, routing, MIDI mapping and timed automix are recovered from its published JavaScript. `src/recovered.js` contains formatted application code, with descriptive names restored for main components. It is not an official Base44 source export. Third-party bundled runtime code was excluded and replaced with npm dependencies. The original CSS is retained.

## Run and verify

Node.js 24; `npm ci`, `npm test`, `npm run build`, `npm run dev`.

New import, demo, cloud and shell modules use strict TypeScript. The recovered JavaScript retains its original dynamic types (`checkJs: false`); typecheck does not prove the legacy engine's type safety.

## Fixes

- File decode no longer awaits AudioContext.resume, which may remain pending after a Safari file picker closes.
- Playback activation has a bounded timeout; import remains possible while suspended.
- Empty/oversized/unsupported files show a readable error, leaving an existing track intact.
- Last-selected file wins across overlapping decodes.
- Accessible file input supports common extensions as well as MIME types.
- Switching from a synth groove to a file stops the old groove.
- Imported track metadata survives navigating between app pages (not a full reload).
- Jog control uses pointer capture and touch events; wrap-around angle is normalized.
- Three original synthesized demo tracks can be rendered and loaded into either deck. They use the original synth voice logic and are not commercial artist recordings.

## Data

The former Base44 entity operations use a Supabase adapter. Without login, profiles/settings/history persist on the current device. With an existing Supabase Auth email/password account, they persist to `public.stripewolf_records`, isolated by `owner_id` and row-level security. Guest data is not automatically copied into cloud accounts. Audio files stay local and must be reselected after a full reload. This migration does not export private Base44 database records or users.

Required build variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. Never put a service-role key into Vite variables.

`database/schema.sql` documents the additive schema applied to the selected Primary connection. The project uses isolated names; unrelated agent tables are unchanged.

## Existing limitations preserved

This is a React web app using Web Audio, not a React Native/Core Audio app. BPM is manual; playback-rate sync also changes pitch. The original “AI” label describes a timed preset transition, not an AI model or beat/phase detection. The original set log stores metadata, not an audio recording. Device-specific microphone, MIDI and output selection depend on browser support. Actual iPhone Safari hardware testing is still required.
