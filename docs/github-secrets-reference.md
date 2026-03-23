# GitHub Secrets Reference

Add these at: https://github.com/scottdavidsonbiz/driveroi/settings/secrets/actions

| Secret Name | Source |
|-------------|--------|
| `INSTANTLY_API_KEY` | .env (INSTANTLY_API_KEY) |
| `ANTHROPIC_API_KEY` | .env.local (ANTHROPIC_API_KEY) |
| `NEXT_PUBLIC_SUPABASE_URL` | .env.local (NEXT_PUBLIC_SUPABASE_URL) |
| `SUPABASE_SERVICE_ROLE_KEY` | .env.local (SUPABASE_SERVICE_ROLE_KEY) |
| `SLACK_WEBHOOK_URL` | .env.local (SLACK_WEBHOOK_URL) |

All values are in the local env files. Do not commit actual secret values to git.
