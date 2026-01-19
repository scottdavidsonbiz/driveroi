---
name: youtube-transcript
description: Extracts and organizes YouTube transcripts by use case (LinkedIn, strategy, vibecode, content). Use when asked to get YouTube transcripts or analyze videos.
type: skill
use-cases:
  - linkedin-strategy
  - positioning
  - sales-enablement
personas:
  - ceo-founder
  - cro
  - cmo
created: 2024-12-09
last-updated: 2024-12-16
status: active
integrates-with:
  - linkedin-growth-strategy
  - extract-insights
references:
  - output-template
  - error-handling
  - examples
case-studies:
  - jacob-context-os-system
tags:
  - youtube
  - transcripts
  - content-research
---

# YouTube Transcript Extractor Skill

**Version:** 1.0.0
**Purpose:** Extract YouTube video transcripts and organize by use case
**Last Updated:** 2024-12-09

## What This Skill Does

Extracts transcripts from YouTube videos and saves them to organized folders based on your intended use:
- **LinkedIn**: Videos that inspire LinkedIn posts or social content
- **Strategy**: Videos for strategic insights, market analysis, competitor research
- **Vibecode**: Vibecode-specific content and research
- **Content**: General content creation research and inspiration

## Step-by-Step Process

### Step 1: Identify the Use Case
Ask the user (if not already specified):
- "What's this transcript for?"
  - LinkedIn post inspiration
  - Strategy/market analysis
  - Vibecode research
  - Content creation research
  - Other (ask for clarification)

### Step 2: Extract Video Metadata
From the YouTube URL, determine:
- Video ID (from URL)
- Video title
- Channel name
- Upload date (if accessible)
- Video description (optional, if useful)

### Step 3: Fetch the Transcript

**Method 1: Using yt-dlp (Recommended)**
```bash
yt-dlp --skip-download --write-auto-sub --sub-lang en --sub-format vtt --output "temp_%(id)s" [YOUTUBE_URL]
```

**Method 2: Using youtube-transcript-api (Python)**
```python
from youtube_transcript_api import YouTubeTranscriptApi
transcript = YouTubeTranscriptApi.get_transcript(video_id)
```

**Method 3: Manual extraction (if tools unavailable)**
- Inform user that yt-dlp or youtube-transcript-api needs to be installed
- Provide installation instructions
- Offer to help install if user wants

**If transcript is unavailable:**
- Check if video has captions enabled
- Try alternate subtitle formats (auto-generated vs manual)
- Inform user if transcript cannot be extracted

### Step 4: Format the Transcript

Clean up and format:
- Remove timestamp artifacts if not useful
- Preserve paragraph breaks where logical
- Clean up auto-generated caption errors (e.g., "[Music]", repeated words)
- Maintain speaker identification if present

### Step 5: Save to Appropriate Folder

**Folder mapping:**
- LinkedIn → `transcripts/youtube/linkedin/`
- Strategy → `transcripts/youtube/strategy/`
- Vibecode → `transcripts/youtube/vibecode/`
- Content → `transcripts/youtube/content/`

**File naming convention:**
`YYYY-MM-DD-[video-title-slug].md`

Example: `2024-12-09-jordan-crawford-ai-gtm-interview.md`

### Step 6: Create Markdown File with Metadata

Use the template in `references/output-template.md` for formatting and file organization.

### Step 7: Offer Follow-Up Actions

Based on use case, suggest next steps:

**If LinkedIn:**
- "Want me to draft LinkedIn post ideas based on this transcript?"
- "Should I extract key quotes for potential posts?"
- "Want me to identify storytelling angles from this video?"

**If Strategy:**
- "Want me to analyze this for strategic insights?"
- "Should I compare this to your existing positioning?"
- "Want me to extract competitive intelligence or market trends?"

**If Vibecode:**
- "Want me to pull vibecode-specific insights?"
- "Should I identify relevant concepts for vibecode development?"

**If Content:**
- "Want me to extract content ideas from this?"
- "Should I identify key themes and takeaways?"
- "Want me to create an outline based on this content?"

## Quality Checks

Before finishing, verify:
- [ ] Transcript extracted successfully
- [ ] Video metadata included (title, channel, URL, date)
- [ ] Saved to correct folder based on use case
- [ ] File naming follows YYYY-MM-DD-[title] convention
- [ ] Transcript is readable and properly formatted
- [ ] Offered relevant follow-up action based on use case

## Error Handling

See `references/error-handling.md` for detailed error messages and solutions for:
- yt-dlp not installed
- Video has no captions
- Transcript quality issues

## Examples & Integration

See `references/examples.md` for detailed use cases and integration patterns with other skills.

## When to Use This Skill

Use this skill when:
- User provides a YouTube URL and wants the transcript
- User asks to "analyze this YouTube video"
- User says "pull insights from this video"
- User wants to research content from YouTube
- User needs quotes or ideas from a specific video

Don't use this skill when:
- User just wants to watch the video (no transcript needed)
- User is asking about downloading the video file itself
- Content is not on YouTube (use different approach)

## Notes for Improvement

Tell Scott if:
- yt-dlp installation process is unclear or problematic
- Transcript quality is consistently poor (may need better cleaning logic)
- Folder organization isn't working (need different categories)
- Missing a common use case (add new category)
- Follow-up suggestions aren't helpful (refine by use case)
- Need integration with other tools/workflows
