# SpeakUp kitobi (memory/SpeakUp book.pdf, egasining ruxsati bilan) matnidan Speaking
# savollari, Band 8+ namuna javoblari va "Language to steal" lug'atini (inglizcha izoh +
# o'zbekcha tarjima) tuzilgan JSON'ga ajratadi.
#   node .local-scratch/pdfall.mjs   (PDF -> .local-scratch/speakup.txt, sahifalar "@@PAGE n" bilan)
#   python -I scripts/content/speakup/parse_speakup.py .local-scratch/speakup.txt scripts/content/speakup/speakup.json
import sys, re, json

src, out = sys.argv[1], sys.argv[2]
raw = open(src, encoding='utf8').read()

FOOTER = re.compile(r'^SpeakUp · IELTS Speaking.*$')
pages = []
for chunk in raw.split('@@PAGE ')[1:]:
    num, _, body = chunk.partition('\n')
    lines = [l.rstrip() for l in body.split('\n')]
    lines = [l for l in lines if l.strip() and not FOOTER.match(l.strip())]
    # Ikki qatorga bo'lingan savollarni ("4 Which is ... a building or" + "its functionality?") birlashtirish.
    merged = []
    for l in lines:
        prev = merged[-1] if merged else ''
        if re.match(r'^\d\s+[A-Z]', prev) and not prev.rstrip().endswith('?') and '\t' not in prev \
                and len(prev) > 40 and '?' in l:
            q_end = l.index('?') + 1
            merged[-1] = prev.rstrip() + ' ' + l[:q_end].strip()
            if l[q_end:].strip():
                merged.append(l[q_end:].strip())
        else:
            merged.append(l)
    pages.append((int(num), merged))

def norm(s):
    return re.sub(r'\s+', ' ', re.sub(r'\s+([,.;:!?)])', r'\1', s)).strip()

UZ = re.compile(r"(o['ʻ‘’`]|g['ʻ‘’`]|moq\b|mak\b|lik\b|lar\b|gan\b|dagi\b|ning\b|bilan\b|uchun\b|qil|bo['ʻ‘’]l|yo['ʻ‘’]q|emas\b|juda\b|narsa|\bva\b|siz\b|ish\b|ga\b|da\b|ni\b|mi\b|i\b$)", re.I)
QLINE = re.compile(r'^(\d{1,2})\s+(.+\?)\s*$')
TOPIC = re.compile(r'^(\d{2})\s+([A-Z][A-Za-z\- ,&]+)$')

def is_uz(line):
    return '\t' not in line and bool(UZ.search(line)) and not line.endswith('?')

# PDF'da tab yo'qolgan yozuvlar: atama qismi (qolgani — inglizcha izoh).
MANUAL_SPLIT = ['come across (something)', 'compete for my attention', 'take the guesswork out of',
                'accept the consequences willingly', "serve someone's interests", 'wait for your turn to speak',
                'debate whether to do something', 'talk someone through something']

def parse_vocab(lines, answer):
    """Lug'at blokini [{phrase, meaning, uz}] ga aylantiradi. Inglizcha qism 1+ qatordan iborat
    bo'lishi mumkin; o'zbekcha qator uni yopadi. Tab bo'lmasa — atama javob matnida uchraydigan
    eng uzun boshlang'ich so'zlar ketma-ketligi deb olinadi."""
    items, buf = [], []
    ans = ' ' + re.sub(r'[^a-z0-9\' ]', ' ', answer.lower()) + ' '
    ans = re.sub(r'\s+', ' ', ans)
    for l in lines:
        if is_uz(l) and buf:
            eng = ' '.join(buf)
            if '\t' in eng:
                phrase, meaning = [x.strip() for x in eng.split('\t', 1)]
            else:
                words = eng.split()
                phrase, meaning = eng, ''
                for k in range(len(words) - 1, 0, -1):
                    cand = re.sub(r'[^a-z0-9\' ]', ' ', ' '.join(words[:k]).lower())
                    cand = re.sub(r'\(.*?\)', ' ', cand)
                    cand = re.sub(r'\s+', ' ', cand).strip()
                    if cand and (' ' + cand + ' ') in ans:
                        phrase, meaning = ' '.join(words[:k]), ' '.join(words[k:])
                        break
                if not meaning and len(buf) >= 2:
                    phrase, meaning = buf[0], ' '.join(buf[1:])
            if not meaning:
                for p in MANUAL_SPLIT:
                    if eng.startswith(p + ' '):
                        phrase, meaning = p, eng[len(p):].strip()
                        break
            items.append({'phrase': norm(phrase.replace('\t', ' ')), 'meaning': norm(meaning), 'uz': norm(l)})
            buf = []
        else:
            buf.append(l)
    return items

# ---- bo'limlarga ajratish
def section_pages(title):
    idx = [i for i, (n, ls) in enumerate(pages) if ls and ls[0].strip() == title and n > 2]
    return idx[0]
p2 = section_pages('Part Two')
p3 = section_pages('Part Three')
PART1, PART2, PART3 = pages[3:p2], pages[p2 + 1:p3], pages[p3 + 1:]

def is_practice(lines):
    return bool(lines) and 'S P E A K I N G P R A C T I C E' in lines[0]

def parse_qa_pages(pgs):
    """Part 1 / Part 3: oddiy sahifalardagi 'N Savol?' + javob + Language to steal bloklari,
    va mashq sahifalari (qo'shimcha savollar + ANSWER KEY). Mavzu bo'yicha guruhlanadi."""
    topics, cur = [], None
    def new_topic(no, name):
        nonlocal cur
        cur = {'no': int(no), 'name': name, 'questions': [], 'practice': [], 'phraseBank': []}
        topics.append(cur)
    pending = []  # mavzu raqami sahifa oxirida keladi — undan oldingi savollar shu yerda turadi
    for n, lines in pgs:
        if is_practice(lines):
            no = lines[0].split()[0]
            name = lines[1].strip()
            if not cur or cur['no'] != int(no):
                new_topic(no, name)
            # phrase bank
            try:
                pb = lines.index(next(l for l in lines if l.startswith('Phrase bank')))
            except StopIteration:
                pb = None
            qs, i = [], (pb + 1 if pb is not None else 2)
            while i < len(lines) and not re.search(r'\t\d+$', lines[i]) and not lines[i].startswith('Notes'):
                cur['phraseBank'].append(norm(lines[i])); i += 1
            while i < len(lines) and re.search(r'\t\d+$', lines[i]):
                qs.append(norm(lines[i].rsplit('\t', 1)[0])); i += 1
            ak = next((j for j, l in enumerate(lines) if l.startswith('A N S W E R K E Y')), None)
            answers = {}
            if ak is not None:
                body = lines[ak + 2:]
                curno = None
                for l in body:
                    m = re.match(r'^(\d)\s+(.*)$', l)
                    if m and int(m.group(1)) == (curno or 0) + 1:
                        curno = int(m.group(1)); answers[curno] = [m.group(2)]
                    elif curno:
                        answers[curno].append(l)
            for k, qtext in enumerate(qs, 1):
                cur['practice'].append({'question': qtext, 'answer': norm(' '.join(answers.get(k, [])))})
            continue
        # oddiy sahifa: bloklar
        blocks, b = [], None
        for l in lines:
            m = QLINE.match(l.strip())
            t = TOPIC.match(l.strip())
            if t and not m:
                pending.append(('topic', t.group(1), t.group(2)))
                continue
            if m and (b is None or b['stage'] != 'answer' or not b['answer']):
                b = {'q': m.group(2), 'answer': [], 'vocab': [], 'stage': 'answer'}
                blocks.append(b)
            elif m and b['stage'] == 'vocab':
                b = {'q': m.group(2), 'answer': [], 'vocab': [], 'stage': 'answer'}
                blocks.append(b)
            elif b and l.strip() == 'Language to steal':
                b['stage'] = 'vocab'
            elif b:
                b[b['stage']].append(l)
        for blk in blocks:
            pending.append(('q', blk))
        # mavzu belgisi kelganda undan oldingi va shu sahifadagi savollar shu mavzuga
        tmark = [p for p in pending if p[0] == 'topic']
        if tmark:
            _, no, name = tmark[-1]
            if not cur or cur['no'] != int(no):
                new_topic(no, name)
            for p in pending:
                if p[0] == 'q':
                    blk = p[1]; ans = norm(' '.join(blk['answer']))
                    cur['questions'].append({'question': norm(blk['q']), 'answer': ans, 'vocab': parse_vocab(blk['vocab'], ans)})
            pending = []
        elif cur and any(p[0] == 'q' for p in pending) and cur['questions']:
            # mavzu belgisisiz sahifa — joriy mavzuning davomi (masalan 3- va 4-savollar)
            last_no = len(cur['questions'])
            first = next(p[1] for p in pending if p[0] == 'q')
            if QLINE.match('%d %s' % (last_no + 1, first['q'])):
                for p in pending:
                    blk = p[1]; ans = norm(' '.join(blk['answer']))
                    cur['questions'].append({'question': norm(blk['q']), 'answer': ans, 'vocab': parse_vocab(blk['vocab'], ans)})
                pending = []
    return topics

def parse_part2(pgs):
    cards, cur = [], None
    for n, lines in pgs:
        if is_practice(lines):
            # muqobil cue card + phrase bank + namuna javob
            topic = lines[2].strip()
            ys = lines.index('You should say:') if 'You should say:' in lines else 3
            bullets, i = [], ys + 1
            while i < len(lines) and not lines[i].startswith('You have 1 minute'):
                bullets.append(norm(lines[i])); i += 1
            ak = next((j for j, l in enumerate(lines) if l.startswith('A N S W E R K E Y')), None)
            ans = norm(' '.join(lines[ak + 2:])) if ak is not None else ''
            if cur:
                cur['practice'] = {'topic': norm(topic), 'bullets': bullets, 'answer': ans}
            continue
        if lines and lines[0].startswith('Describe'):
            cur = {'topic': norm(lines[0]), 'bullets': [], 'answer': '', 'vocab': [], 'no': None, 'name': ''}
            cards.append(cur)
            body = lines[2:] if len(lines) > 1 and lines[1].startswith('You should say') else lines[1:]
            try:
                lts = body.index('Language to steal')
            except ValueError:
                lts = len(body)
            cur['_answer'] = body[:lts]
            rest = body[lts + 1:]
            # oxirida "NN Name" + 4 ta bullet
            tm = next((j for j, l in enumerate(rest) if TOPIC.match(l.strip())), None)
            vocab_lines = rest[:tm] if tm is not None else rest
            if tm is not None:
                t = TOPIC.match(rest[tm].strip()); cur['no'] = int(t.group(1)); cur['name'] = t.group(2)
                cur['bullets'] = [norm(x) for x in rest[tm + 1:tm + 5]]
            cur['answer'] = norm(' '.join(cur.pop('_answer')))
            cur['vocab'] = parse_vocab(vocab_lines, cur['answer'])
        elif cur and not cur.get('no'):
            # javob/lug'at keyingi sahifaga o'tgan holat
            tm = next((j for j, l in enumerate(lines) if TOPIC.match(l.strip())), None)
            if tm is not None:
                t = TOPIC.match(lines[tm].strip()); cur['no'] = int(t.group(1)); cur['name'] = t.group(2)
                cur['bullets'] = [norm(x) for x in lines[tm + 1:tm + 5]]
                cur['vocab'] += parse_vocab(lines[:tm], cur['answer'])
    return cards

data = {
    'source': 'SpeakUp - IELTS Speaking Parts 1-3 (used with the owner\'s permission)',
    'part1': parse_qa_pages(PART1),
    'part2': parse_part2(PART2),
    'part3': parse_qa_pages(PART3),
}
json.dump(data, open(out, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
for k in ('part1', 'part3'):
    ts = data[k]
    print(k, len(ts), 'topics;', 'questions', sum(len(t['questions']) for t in ts), 'practice', sum(len(t['practice']) for t in ts),
          '| empty answers', sum(1 for t in ts for q in t['questions'] + t['practice'] if not q['answer']))
    print('   per topic:', [(t['no'], len(t['questions']), len(t['practice'])) for t in ts])
print('part2', len(data['part2']), 'cards; no answer', sum(1 for c in data['part2'] if not c['answer']), '| bullets!=4', [c['no'] for c in data['part2'] if len(c['bullets']) != 4], '| practice', sum(1 for c in data['part2'] if c.get('practice')))
