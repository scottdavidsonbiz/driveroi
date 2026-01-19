# Extract Insights Skill


## Description
This skill analyzes meeting transcripts to extract key business insights, actionable items, and summary points.

## Input
- **Source**: Text files in `/transcripts` folder.
- **Format**: `[HH:MM:SS - HH:MM:SS] Speaker Name: Text`

## Process
1.  **Read** the transcript file.
2.  **Analyze** the conversation for:
    -   **Key Topics**: Main subjects discussed.
    -   **Pain Points**: Challenges or problems mentioned by the participants.
    -   **Goals/Needs**: What the participants are trying to achieve or need help with.
    -   **Action Items**: Specific tasks or follow-ups mentioned.
    -   **Business Context**: Details about companies, roles, and market position.
3.  **Synthesize** the findings into a structured summary.

## Output
-   **Destination**: `content/insights/`
-   **Filename**: `[Original_Filename]_insights.md`
-   **Format**: Markdown

## Template

```markdown
# Meeting Insights: [Meeting Title/Participants]

## Executive Summary
[Brief overview of the conversation]

## Key Insights
- [Insight 1]
- [Insight 2]
- ...

## Pain Points & Challenges
- [Challenge 1]
- ...

## Action Items
- [ ] [Action 1]
- [ ] [Action 2]
- ...

## Context & Details
- **Participants**: [Names]
- **Companies**: [Company Names]
- **Topics**: [List of topics]
```

