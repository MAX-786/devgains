# First — Important Reality Check (2026)

There has been a major shift recently in AI video tooling.

* [Business Insider](https://www.businessinsider.com/openai-discontinues-sora-video-app-amid-robotics-shift-compute-limitations-2026-3?utm_source=chatgpt.com)
* [The Times of India](https://timesofindia.indiatimes.com/technology/tech-news/openai-ceo-sam-altman-breaks-silence-on-shutting-down-sora-in-less-than-a-year-and-leaving-disney-in-lurch-says-i-did-not-expect-/articleshow/130000005.cms?utm_source=chatgpt.com)
* [El País](https://elpais.com/tecnologia/2026-03-25/openai-cierra-su-generador-de-video-sora-solo-seis-meses-despues-de-su-lanzamiento-como-app.html?utm_source=chatgpt.com)

Key implications:

* Standalone AI video apps like Sora were shut down partly due to **high compute costs and infrastructure demands**. ([Business Insider][1])
* Video generation remains compute-intensive and expensive compared to text/image generation. ([The Week][2])
* The industry is shifting toward **agentic pipelines orchestrating multiple tools**, not one monolithic generator. ([arXiv][3])

So your instinct is correct:

**Do not build around heavy local GPU tools like ComfyUI if you don't have GPUs.**

Instead:

We build a **cloud-API-orchestrated agent pipeline**.

---

# Your Goal — Restated Precisely

You want:

```
prompt → nostalgic anime clip → loop → music → final reel
```

Fully automated.

But also:

* customizable at every stage
* runs on CPU cloud
* uses OpenAI API
* deployable on Oracle free tier

This is achievable.

---

# The Correct Architecture Direction

You are building:

```
Agentic Media Pipeline
```

Not:

```
Video generator
```

---

# Final High-Level Architecture (GPU-free)

```
User Prompt
     ↓
Idea Agent
     ↓
Scene Agent
     ↓
Image / Video Generation (API)
     ↓
Loop Generator
     ↓
Music Agent
     ↓
Editor Agent
     ↓
Export Reel
```

All compute-heavy work:

```
external APIs
```

---

# Core Design Principle

We design:

```
API-first
stateless
modular
customizable
```

---

# Pipeline — End to End

Now let's define each stage properly.

---

# Stage 1 — Prompt / Scenario Agent

Purpose:

Generate nostalgic Indian scenario.

Input:

```
"summer vacation"
```

or

```
random
```

Output:

```
scene description
style
mood
era
visual elements
```

Example:

```
Indian kids playing cricket
narrow street
early 2000s
afternoon sunlight
anime style
nostalgic mood
```

---

# Tools

Use:

```
OpenAI GPT
```

Why:

Best reasoning engine.

---

# Stage 2 — Scene / Storyboard Agent

Purpose:

Break scenario into visual frames.

Output:

```
frame 1 — boy throws ball
frame 2 — ball hits window
frame 3 — kids run
frame 4 — laughter
```

---

# Why this stage is critical

Consistency.

Without storyboard:

video becomes random.

---

# Stage 3 — Video Generation (Using API)

This is where your OpenAI key becomes powerful.

Modern video APIs allow:

* text → video
* image → video
* extend video

They work asynchronously — you submit a job and poll for completion. ([OpenAI Platform][4])

---

# What you generate

```
3–5 second video
```

---

# Example API Call

```
POST /videos

{
  model: "sora-2",
  prompt: "Indian kids playing cricket in summer, nostalgic anime style",
  seconds: 5,
  size: "720x1280"
}
```

Then:

```
poll status
download MP4
```

This is the correct production workflow. ([OpenAI Platform][4])

---

# Why this works without GPU

Because:

```
compute runs on provider infrastructure
```

You only orchestrate.

---

# Stage 4 — Loop Generator

Goal:

Turn:

```
5 second clip
```

into:

```
30 second seamless loop
```

---

# Implementation

Use:

```
FFmpeg
```

Example:

```
ffmpeg -stream_loop 5 -i clip.mp4 -c copy output.mp4
```

---

# Why FFmpeg is essential

Modern agentic video systems generate executable FFmpeg commands automatically to automate editing workflows. ([arXiv][5])

---

# Stage 5 — Music Agent

Purpose:

Select nostalgic music automatically.

---

# Input

```
scene
```

Example:

```
rain
```

---

# Output

```
lofi rain music
```

---

# How it works

Agent:

1 — understands mood
2 — searches music
3 — downloads
4 — trims
5 — loops

---

# Tools

```
yt-dlp
pydub
librosa
```

---

# Stage 6 — Video Editor Agent

Purpose:

Combine:

* video
* music
* transitions
* loop

---

# Implementation

Use:

```
FFmpeg
```

Tasks:

* add audio
* sync duration
* fade in
* crop
* resize

---

# Output

```
final reel
```

---

# Stage 7 — Export Agent

Final output:

```
1080x1920
30 fps
30 seconds
MP4
```

---

# Agent Orchestration Layer

This is the brain.

---

# Recommended Framework

Primary:

```
LangGraph
```

Why:

* handles multi-step workflows
* supports retries
* supports checkpoints
* production-ready

Agentic systems now commonly use planner/executor agent patterns to coordinate video generation and editing tasks across tools. ([arXiv][3])

---

# Final Tech Stack (Your Constraints)

You have:

* OpenAI API
* Oracle free tier
* no GPU

So the correct stack is:

---

Backend

```
Python
FastAPI
```

---

Agents

```
LangGraph
```

---

Video

```
OpenAI video API
```

---

Editing

```
FFmpeg
```

---

Music

```
yt-dlp
pydub
```

---

Storage

```
Supabase
or
S3
```

---

Queue

```
Redis
```

---

# Infrastructure — Oracle Free Tier

This is exactly how to deploy.

---

Oracle runs:

```
API server
agents
scheduler
storage
```

External APIs run:

```
video generation
image generation
music generation
```

---

Architecture:

```
Oracle VM

FastAPI
LangGraph
Redis
FFmpeg

↓

External APIs

OpenAI
Music APIs
Storage
```

---

# Customization — Mandatory Requirement

You wanted:

```
customization at every stage
```

So we implement:

```
pipeline state
```

---

Example state:

```
{
  prompt: "",
  style: "anime",
  duration: 30,
  music: "auto",
  loop: true
}
```

User can modify:

* prompt
* style
* video
* music
* duration
* transitions

---

# Folder Structure

```
reel-agent/

agents/

prompt_agent.py
scene_agent.py
video_agent.py
music_agent.py
editor_agent.py

pipeline/

graph.py

api/

routes.py

storage/

configs/

.env
```

---

# MVP — Minimal Working System

This is what you build first.

---

Pipeline:

```
prompt
   ↓
generate 5s video
   ↓
loop to 30s
   ↓
add music
   ↓
export reel
```

---

Time to build:

```
1–2 weeks
```

---

# Phase 2 — Smart Features

After MVP:

Add:

---

Randomized content

```
daily reels
```

---

Batch generation

```
100 reels
```

---

Auto-posting

```
Instagram API
```

---

Trend detection

---

Character memory

---

Brand style presets

---

# Performance Expectations

On Oracle free tier:

```
1 reel
```

Time:

```
1–3 minutes
```

Cost:

```
$0.05 — $0.30
```

---

# Final Recommended Architecture (Production)

```
User

↓

FastAPI

↓

LangGraph

↓

Agents:

Idea
Scene
Video
Loop
Music
Editor
Export

↓

Storage

↓

Instagram
```

---

# What Changed From the Previous Design

Important corrections:

1. Removed GPU dependency
2. Removed ComfyUI requirement
3. Made OpenAI API primary
4. Optimized for Oracle free tier
5. Designed for production realism

---

# Next Logical Step

We can now move into implementation mode.

Choose one:

A — Build MVP architecture step-by-step

B — Design database schema and API routes

C — Write actual code for the first working pipeline

D — Design cost optimization and rate limiting strategy

[1]: https://www.businessinsider.com/openai-discontinues-sora-video-app-amid-robotics-shift-compute-limitations-2026-3?utm_source=chatgpt.com "OpenAI is scrapping the Sora app to chase bigger AI goals"
[2]: https://theweek.com/business/openai-ending-ai-video-sora?utm_source=chatgpt.com "OpenAI: Ending its AI video feature"
[3]: https://arxiv.org/abs/2511.08521?utm_source=chatgpt.com "UniVA: Universal Video Agent towards Open-Source Next-Generation Video Generalist"
[4]: https://platform.openai.com/docs/guides/video-generation/?utm_source=chatgpt.com "Video generation with Sora - OpenAI API"
[5]: https://arxiv.org/abs/2602.00028?utm_source=chatgpt.com "ELLMPEG: An Edge-based Agentic LLM Video Processing Tool"

