# Claygent Prompt Writer

## Metadata
- **Name:** claygent-prompt-writer
- **Description:** Creates optimized Claygent prompts for Clay.com workflows. Handles research, categorization, data extraction, and qualification use cases with JSON output.
- **Invocation:** /claygent or "write a claygent prompt"

---

## Instructions

When the user asks you to write a Claygent prompt, follow this process:

### Step 1: Gather Requirements

Ask the user for:
1. **Use case:** What are you trying to accomplish? (research, categorization, qualification, data extraction)
2. **Data source:** What input will Claygent receive? (URL, company name, LinkedIn profile, etc.)
3. **Desired outputs:** What specific fields/information do you need returned?
4. **Qualifying/disqualifying criteria:** (if applicable) What makes something a yes vs. no?
5. **Examples:** Can you share 2-3 example inputs and what the ideal output would look like?

If the user provides most of this upfront, skip redundant questions.

---

### Step 2: Write the Prompt Using This Structure

All Claygent prompts should follow this template:

```
## CONTEXT
[Explain what this prompt does and why - helps the AI understand the goal]

## TASK
[Clear, specific instructions on what the AI should do]

## INPUT
[Describe what data the AI will receive - use {{column_name}} syntax for Clay variables]

## QUALIFYING CRITERIA (if applicable)
**QUALIFIES:**
- [Criterion 1]
- [Criterion 2]

**DOES NOT QUALIFY:**
- [Criterion 1]
- [Criterion 2]

## OUTPUT FORMAT
Return your response as JSON with the following structure:

{
  "field_1": "description of what goes here",
  "field_2": "description of what goes here",
  "field_3": "description of what goes here"
}

## INSTRUCTIONS
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. If you cannot find the information, return null for that field - do not guess.

## EXAMPLES

**Input:** [Example input 1]
**Output:**
{
  "field_1": "example value",
  "field_2": "example value",
  "field_3": "example value"
}

**Input:** [Example input 2]
**Output:**
{
  "field_1": "example value",
  "field_2": "example value",
  "field_3": "example value"
}
```

---

### Step 3: Apply Claygent Best Practices

When writing the prompt, follow these best practices:

**Clarity & Structure:**
- Use clear section headers (##) to organize the prompt
- Number your instructions for step-by-step tasks
- Be explicit about output format - Claygent performs better with structure

**JSON Output:**
- Always specify the exact JSON schema you want returned
- Use `null` for missing values, not empty strings or "N/A"
- Keep field names lowercase with underscores (snake_case)
- Include 2-3 examples showing the expected JSON output

**Avoiding Hallucination:**
- Tell Claygent to return `null` if information cannot be found
- Ask for source URLs when possible to verify accuracy
- For boolean/qualification prompts, require explicit criteria

**Few-Shot Prompting:**
- Always include 2-3 examples covering different scenarios
- Include at least one "negative" example (doesn't qualify, info not found)
- Keep example JSON clean - no markdown formatting inside the JSON

**Model-Specific Tips:**
- For data extraction and formatting: Neon model works well
- For complex reasoning and research: GPT-4 or Claude works better
- Mention the recommended model in your response

**Source Specification:**
- If the data should come from a specific source (Google, LinkedIn, the provided URL), say so explicitly
- For URL-based research, tell it to extract from "the page at {{url}}" not to search the web

---

### Step 4: Deliver the Prompt

Provide:
1. The complete Claygent prompt (in a code block for easy copy/paste)
2. Recommended AI model (Neon, GPT-4, or Claude)
3. Expected output fields (so they know what columns to create in Clay)
4. Any notes on edge cases or limitations

---

## Example Skill Usage

**User:** I need a Claygent prompt to analyze Business Wire articles about acquisitions. I want to identify if the acquisition involves industrial property (manufacturing, warehouses, etc.) for a property tax assessment client. Input is the article URL.

**Assistant Response:**

Here's your Claygent prompt:

```
## CONTEXT
You are analyzing Business Wire acquisition announcements to identify opportunities for an industrial property tax assessment firm. You need to determine if the acquisition involves industrial property that would need valuation services.

## TASK
Read the article at the provided URL and determine if this acquisition qualifies as an industrial property opportunity.

## INPUT
Article URL: {{article_url}}

## QUALIFYING CRITERIA

**QUALIFIES (has industrial property):**
- Manufacturing companies (any type)
- Food & beverage processing plants
- Chemical plants
- Oil & gas operations
- Warehouses or distribution centers
- Light industrial buildings
- Pharma/biotech with manufacturing facilities
- Data centers

**DOES NOT QUALIFY:**
- Office buildings
- Hospitality (hotels, restaurants)
- Retail properties
- Service businesses (consulting, software, insurance)
- "Asset-light" platforms
- Residential real estate

## OUTPUT FORMAT
Return your response as JSON:

{
  "qualifies": true or false,
  "acquisition_type": "company" or "property" or null,
  "acquired_entity": "name of company or property address(es)" or null,
  "acquirer_domain": "website.com" or null,
  "industry": "brief industry description" or null,
  "reasoning": "one sentence explanation"
}

## INSTRUCTIONS
1. Visit the article URL and read the full content
2. Determine if this is a company acquisition or property acquisition
3. Evaluate against the qualifying criteria
4. Extract the acquirer's website domain from the article
5. If information cannot be found, return null for that field

## EXAMPLES

**Input:** https://www.businesswire.com/news/home/plasticade-acquires-mr-chain
**Output:**
{
  "qualifies": true,
  "acquisition_type": "company",
  "acquired_entity": "Mr. Chain",
  "acquirer_domain": "plasticade.com",
  "industry": "Plastic manufacturing (barriers, chains, signage)",
  "reasoning": "Mr. Chain is a manufacturing company producing plastic safety products"
}

**Input:** https://www.businesswire.com/news/home/resident-acquires-blace
**Output:**
{
  "qualifies": false,
  "acquisition_type": null,
  "acquired_entity": null,
  "acquirer_domain": null,
  "industry": null,
  "reasoning": "BLACE is an asset-light hospitality platform with no industrial property"
}
```

**Recommended model:** GPT-4 or Claude (requires reasoning about qualification criteria)

**Output columns to create in Clay:**
- qualifies (boolean)
- acquisition_type (text)
- acquired_entity (text)
- acquirer_domain (text)
- industry (text)
- reasoning (text)

---

## Common Use Case Templates

### 1. URL Research / Data Extraction
- Extract specific fields from a webpage
- Works best with: Neon model
- Key: Specify exactly which page element contains the data

### 2. Categorization / Qualification
- Determine if something meets criteria (yes/no)
- Works best with: GPT-4 or Claude (needs reasoning)
- Key: Explicit qualifying/disqualifying criteria with examples

### 3. Web Research (no URL provided)
- Find information about a company/person via search
- Works best with: GPT-4 or Claude
- Key: Specify which sources to prioritize (LinkedIn, company website, news)

### 4. Multi-Step Research
- Chain multiple research tasks together
- Works best with: GPT-4 or Claude
- Key: Number your steps clearly, specify what to do if step fails

---

## Sources & References
- [Clay University: Writing AI Prompts](https://www.clay.com/university/guide/ai-metaprompter-guide)
- [Clay Community: Effective Claygent Prompts](https://community.clay.com/x/support/shzkuoza0bsb/how-to-create-effective-prompts-for-clays-claygent)
- [Clay University: 24 Pre-Built Prompts](https://www.clay.com/university/lesson/we-made-24-prompts-so-you-dont-have-to-automated-outbound)
- [Claygent JSON Schema Output](https://community.clay.com/x/support/px98n5mdbxku/convert-claygent-search-results-to-json-format)
