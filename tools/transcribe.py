# transcribe.py: whisper-cli word timestamps on overlapping 30 s chunks of the song (no context carry-over,
# which stops whisper looping on the chorus). Writes tools/whisper_words.json: [[t0, t1, word], ...].
#   python3 tools/transcribe.py <path to ggml model>
import json, subprocess, sys, tempfile, os
MODEL, SONG, OUT = sys.argv[1], 'assets/music.m4a', 'tools/whisper_words.json'
DUR, LEN, STEP = 284.7, 30, 20
tmp = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SONG, '-ar', '16000', '-ac', '1', f'{tmp}/song.wav'], check=True)
words = []
a = 0
while a < DUR:
    base = f'{tmp}/c{a}'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a), '-t', str(LEN), '-i', f'{tmp}/song.wav', base + '.wav'], check=True)
    subprocess.run(['whisper-cli', '-m', MODEL, '-f', base + '.wav', '-l', 'en', '-ojf', '-of', base, '-ml', '1', '-sow', '-mc', '0'], capture_output=True)
    for s in json.load(open(base + '.json'))['transcription']:
        w = s['text'].strip()
        if not w: continue
        t0, t1 = a + s['offsets']['from'] / 1000, a + s['offsets']['to'] / 1000
        # keep a word only from the chunk where it sits in the middle 20 s (first/last chunk keep their edge)
        lo = a + (0 if a == 0 else (LEN - STEP) / 2); hi = a + LEN - (LEN - STEP) / 2
        if lo <= t0 < hi or (a + STEP >= DUR and t0 >= lo): words.append([round(t0, 2), round(t1, 2), w])
    print(f'chunk {a}: {len(words)} words so far', file=sys.stderr)
    a += STEP
json.dump(words, open(OUT, 'w'))
print(f'wrote {OUT}: {len(words)} words')
